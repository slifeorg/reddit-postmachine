from __future__ import annotations

import json
import hashlib
import re
import time

import frappe
from frappe.utils import strip_html
from openai import OpenAI

from reddit_postmachine.reddit_postmachine.doctype.subreddit_template.location_utils import (
    extract_location_from_subreddit,
)
from reddit_postmachine.reddit_postmachine.doctype.subreddit_template.safe_logging import (
    log_error_safe,
    safe_log_append,
)
from reddit_postmachine.reddit_postmachine.doctype.subreddit_template.title_format import (
    sanitize_hashtag_token,
    strip_outer_wrappers,
    TitleFormatter,
)


class SubredditTemplatePostGenerator:
    """
    Main service class.
    Includes "Scorched Earth" cleaning logic to fix duplicated metadata issues.
    """
    
    def __init__(self, *, openai_client_factory=None):
        self._openai_client_factory = openai_client_factory or (lambda api_key: OpenAI(api_key=api_key))

    # --- Logging Helper ---
    def _log(self, logs: list, message: str):
        timestamp = time.strftime("%H:%M:%S")
        safe_log_append(logs, f"[{timestamp}] {message}")
        print(f"\033[96mREDDIT_GEN:\033[0m {message}")

    # --- Helpers ---
    @staticmethod
    def _stable_choice(seed: str, options: list[str]) -> str:
        if not options: return ""
        s = str(seed or "")
        h = hashlib.md5(s.encode("utf-8")).hexdigest()
        idx = int(h, 16) % len(options)
        return options[idx]

    @staticmethod
    def _stable_age(seed: str, *, min_age: int = 22, max_age: int = 39) -> int:
        if min_age >= max_age: return min_age
        s = str(seed or "")
        h = hashlib.md5(s.encode("utf-8")).hexdigest()
        span = (max_age - min_age) + 1
        return min_age + (int(h, 16) % span)

    def _derive_persona_defaults(self, *, account_username: str, account_doc_name: str, fallback_location: str) -> dict:
        seed = (account_username or account_doc_name or "").strip() or "default"
        professions = ["yoga instructor", "software developer", "photographer", "nurse", "student"]
        locations = [fallback_location or "New Haven", "Austin", "Seattle", "Miami", "Denver"]
        quirks = ["playful", "direct", "witty", "warm", "bold"]
        hooks = ["likes adventures", "loves conversation", "prefers low-key hangs"]

        return {
            "seed": seed,
            "age": self._stable_age(seed),
            "profession": self._stable_choice(seed + ":profession", professions),
            "location": self._stable_choice(seed + ":location", locations),
            "quirk": self._stable_choice(seed + ":quirk", quirks),
            "hook": self._stable_choice(seed + ":hook", hooks),
        }

    @staticmethod
    def _normalize_text_for_dedupe(text: str) -> str:
        s = str(text or "").strip().lower()
        return re.sub(r"\s+", " ", s)

    def _content_signature(self, *, title: str, body: str) -> str:
        base = f"title:{self._normalize_text_for_dedupe(title)}\nbody:{self._normalize_text_for_dedupe(body)}"
        return hashlib.sha1(base.encode("utf-8")).hexdigest()

    def _is_duplicate_recent_post(self, subreddit_group: str, subreddit_name: str, title: str, body: str, limit: int = 50) -> bool:
        sig = self._content_signature(title=title, body=body)
        rows = frappe.db.sql(
            """SELECT title, body_text FROM `tabReddit Post`
               WHERE subreddit_group = %s AND subreddit_name = %s
               ORDER BY creation DESC LIMIT %s""",
            (subreddit_group, subreddit_name, limit),
            as_dict=True,
        )
        for r in rows or []:
            if self._content_signature(title=(r.get("title") or ""), body=(r.get("body_text") or "")) == sig:
                return True
        return False

    def _ensure_frappe_local_response(self):
        try:
            if not hasattr(frappe, "local") or frappe.local is None:
                frappe.local = frappe._dict()
            if not hasattr(frappe.local, "response") or getattr(frappe.local, "response", None) is None:
                frappe.local.response = frappe._dict()
        except Exception:
            pass

    # --- THE SCORCHED EARTH CLEANER ---
    def _clean_ai_headline(self, text: str, age: str, gender_tag: str, location: str, logs: list) -> str:
        current = str(text or "").strip()
        self._log(logs, f"RAW AI INPUT: '{current}'")
        
        patterns_to_kill = []
        patterns_to_kill.append(re.escape(str(age)))
        patterns_to_kill.append(r"\d{2}")
        
        if gender_tag:
            patterns_to_kill.append(re.escape(gender_tag))
            bare_tag = strip_outer_wrappers(gender_tag)
            if bare_tag:
                patterns_to_kill.append(re.escape(bare_tag))
        
        patterns_to_kill.append(r"\[?[FfMm]4[FfMm]\]?")
        patterns_to_kill.append(r"\[?[Rr]4[Rr]\]?")
        
        if location:
            patterns_to_kill.append(re.escape(location))
            h_loc = sanitize_hashtag_token(location)
            if h_loc:
                patterns_to_kill.append(r"#?" + re.escape(h_loc))

        max_loops = 15
        for i in range(max_loops):
            prev = current
            current = re.sub(r"^[\s\-\|:—–,]+", "", current)
            
            for pattern in patterns_to_kill:
                current = re.sub(rf"^\s*{pattern}\b", "", current, flags=re.IGNORECASE)
                if "[" not in pattern:
                    current = re.sub(rf"^\s*\[{pattern}\]", "", current, flags=re.IGNORECASE)
                    current = re.sub(rf"^\s*\({pattern}\)", "", current, flags=re.IGNORECASE)

            current = re.sub(r"^[\s\-\|:—–,]+", "", current).strip()

            if current != prev:
                self._log(logs, f"Clean Pass {i+1}: '{current}'")
            else:
                break
                
        self._log(logs, f"FINAL CLEAN TEXT: '{current}'")
        return current

    @staticmethod
    def _truncate_title(title: str, *, max_len: int = 140) -> str:
        """
        Ensure title fits DocField max length (140).
        Tries to cut on a word boundary and adds an ellipsis when truncating.
        """
        s = str(title or "").strip()
        if max_len <= 0:
            return ""
        if len(s) <= max_len:
            return s

        ellipsis = "…"
        hard_max = max_len - len(ellipsis)
        if hard_max <= 0:
            return s[:max_len]

        cut = s[:hard_max].rstrip()
        # Prefer last space boundary for nicer truncation
        if " " in cut:
            cut2 = cut.rsplit(" ", 1)[0].rstrip()
            if len(cut2) >= max(10, int(hard_max * 0.6)):
                cut = cut2
        cut = cut.rstrip(" -–—:|,.;!?)\"]'")  # avoid ugly dangling punctuation
        return (cut + ellipsis).strip()

    @staticmethod
    def _infer_title_style_from_examples(title_examples: list[str]) -> dict:
        """
        Infer whether titles usually include:
        - a dash separator (e.g. " - ")
        - a location token between gender tag and dash
        - bracket/parentheses wrapper style for gender tag token

        We keep this deliberately simple and default-safe.
        """
        style = {
            "use_dash": False,
            "include_location": False,
            "gender_wrapper": "",  # "", "[]", "()"
        }
        for ex in title_examples or []:
            s = str(ex or "").strip()
            if not s:
                continue

            # Detect dash separator variant
            if re.search(r"\s[-–—]\s", s):
                style["use_dash"] = True
                left = re.split(r"\s[-–—]\s", s, maxsplit=1)[0].strip()
                toks = left.split()
                if len(toks) >= 2:
                    tag_tok = toks[1]
                    if tag_tok.startswith("[") and tag_tok.endswith("]"):
                        style["gender_wrapper"] = "[]"
                    elif tag_tok.startswith("(") and tag_tok.endswith(")"):
                        style["gender_wrapper"] = "()"
                    # If there is anything after age+tag before dash, treat it as location.
                    if len(toks) >= 3:
                        style["include_location"] = True
                break

            # No dash: still infer wrapper if present
            toks = s.split()
            if len(toks) >= 2:
                tag_tok = toks[1]
                if tag_tok.startswith("[") and tag_tok.endswith("]"):
                    style["gender_wrapper"] = "[]"
                elif tag_tok.startswith("(") and tag_tok.endswith(")"):
                    style["gender_wrapper"] = "()"

        return style

    @staticmethod
    def _extract_location_and_gender_from_title_examples(title_examples: list[str]) -> dict:
        """
        Best-effort extraction of gender tag + location from `Subreddit Template.title_example`.

        Example supported:
          "25 [F4M] Orlando - Looking for a little chemistry and good company"
          "25 F4M Orlando - ..."
          "25 (F4M) New Haven - ..."

        Returns:
          {"gender_tag": "[F4M]", "location": "Orlando"}  (values may be None)
        """
        out = {"gender_tag": None, "location": None}
        for ex in title_examples or []:
            s = str(ex or "").strip()
            if not s:
                continue

            # Prefer the dash format: "<age> <tag> <location> - <title>"
            m = re.match(r"^\s*\d{1,2}\s+(\[[^\]]+\]|\([^)]+\)|\S+)\s+(.+?)\s*[-–—]\s+.+$", s)
            if m:
                tag = m.group(1).strip()
                loc = m.group(2).strip()
                # Normalize placeholder-ish values
                if loc.lower() in {"dynamic", "dynamics"}:
                    loc = ""
                out["gender_tag"] = tag or None
                out["location"] = loc or None
                return out

            # Fallback: try "<age> <tag> <rest...>"
            m2 = re.match(r"^\s*\d{1,2}\s+(\[[^\]]+\]|\([^)]+\)|\S+)\s+(.+)$", s)
            if m2 and not out["gender_tag"]:
                out["gender_tag"] = m2.group(1).strip() or None

        return out

    @staticmethod
    def _normalize_gender_tag(tag: str | None) -> str | None:
        """
        Normalize and validate a gender tag.

        We accept tags like:
          F4M, M4F, F4F, M4M, R4R (and similar), with optional [] or () wrappers.

        We explicitly reject "r4r" / "[r4r]" coming from subreddit naming noise,
        because it is not a gender tag in our title format rules.
        """
        if not tag:
            return None
        s = str(tag).strip()
        if not s:
            return None

        bare = strip_outer_wrappers(s).strip()
        if not bare:
            return None

        bare_u = bare.upper()

        # Reject subreddit-noise tokens
        if bare_u == "R4R" or bare_u.endswith("R4R") or "R4R" == bare_u:
            # If you truly want R4R as a gender tag later, remove this guard.
            return None

        # Accept typical patterns like F4M / M4F / NB4M etc.
        if not re.match(r"^[A-Z]{1,3}4[A-Z]{1,3}$", bare_u):
            return None

        # Preserve wrapper style from input if present, default to bare
        if s.startswith("[") and s.endswith("]"):
            return f"[{bare_u}]"
        if s.startswith("(") and s.endswith(")"):
            return f"({bare_u})"
        return bare_u

    @staticmethod
    def _apply_gender_wrapper(bare_gender_tag: str, wrapper: str) -> str:
        t = str(bare_gender_tag or "").strip()
        if not t:
            return ""
        if wrapper == "[]":
            return f"[{t}]"
        if wrapper == "()":
            return f"({t})"
        return t

    @staticmethod
    def _strip_leading_redundant_prefixes(
        text: str,
        *,
        age: str,
        raw_gender_tag: str,
        bare_gender_tag: str,
        location: str,
        location_hashtag: str,
    ) -> str:
        """
        Remove leaked metadata prefixes from the START only, repeatedly, e.g.:
          "F4M 25 F4M Let's ..." -> "Let's ..."
        """
        s = str(text or "").strip()
        patterns: list[str] = []

        # Age patterns (specific age and generic 1-2 digits)
        if age:
            patterns.append(re.escape(str(age).strip()))
        patterns.append(r"\d{1,2}")

        # Gender tag variants
        for g in {str(raw_gender_tag or "").strip(), str(bare_gender_tag or "").strip()}:
            if not g:
                continue
            patterns.append(re.escape(g))
            patterns.append(re.escape(f"[{g}]"))
            patterns.append(re.escape(f"({g})"))

        # Common tag shapes
        patterns.append(r"\[?[FfMm]4[FfMm]\]?")
        patterns.append(r"\[?[Rr]4[Rr]\]?")

        # Location variants
        loc = str(location or "").strip()
        if loc:
            patterns.append(re.escape(loc))
        if location_hashtag:
            patterns.append(r"#?" + re.escape(location_hashtag))

        for _ in range(15):
            prev = s
            s = re.sub(r"^[\s\-\|:—–,]+", "", s)
            for p in patterns:
                s = re.sub(rf"^\s*{p}\b", "", s, flags=re.IGNORECASE)
            s = re.sub(r"^[\s\-\|:—–,]+", "", s).strip()
            if s == prev:
                break
        return s


    # --- Main Logic ---

    def generate_post_from_template(self, template_name: str, account_name: str | None = None, agent_name: str | None = None):
        logs: list[str] = []
        self._ensure_frappe_local_response()

        try:
            self._log(logs, f"--- Generating for {template_name} ---")

            # 1. Load Data
            if not frappe.db.exists("Subreddit Template", template_name):
                frappe.throw(f"Template '{template_name}' not found")
            template = frappe.get_doc("Subreddit Template", template_name)

            title_examples = [x.strip() for x in (getattr(template, "title_example", "") or "").splitlines() if x.strip()]
            example_meta = self._extract_location_and_gender_from_title_examples(title_examples)
            
            key_doc = frappe.db.get_value("Keys", {}, "name")
            if not key_doc: frappe.throw("No 'Keys' doc found.")
            api_key = frappe.get_doc("Keys", key_doc).get_password("api_key")
            client = self._openai_client_factory(api_key)

            # 2. Account
            if account_name:
                account_doc = frappe.get_doc("Reddit Account", account_name)
            else:
                acc_val = frappe.db.get_value("Reddit Account", {"status": "Active", "is_posting_paused": 0}, "name")
                if not acc_val: frappe.throw("No active Reddit Account found.")
                account_doc = frappe.get_doc("Reddit Account", acc_val)

            # 3. Persona
            agent_display_name = agent_name or account_doc.assistant_name or account_doc.username or "Unknown"
            
            raw_loc = str(getattr(template, "location", "") or "").strip()
            if raw_loc.lower() == "dynamic":
                # Prefer location explicitly shown in examples; fallback to subreddit-derived location.
                agent_location = example_meta.get("location") or extract_location_from_subreddit(template.sub, location=None)
            elif raw_loc:
                agent_location = raw_loc
            else:
                # If template doesn't have a location field, infer it from the examples.
                agent_location = example_meta.get("location") or account_doc.assistant_location

            defaults = self._derive_persona_defaults(
                account_username=account_doc.username,
                account_doc_name=account_doc.name,
                fallback_location=agent_location
            )
            
            final_age = str(account_doc.assistant_age or defaults["age"])
            final_location = str(agent_location or defaults["location"])
            final_profession = str(account_doc.assistant_profession or defaults["profession"])
            
            self._log(logs, f"Persona: {final_age} / {final_location}")

            # 4. Format Setup
            # IMPORTANT: prefer gender tag from the template examples (this is the user's source of truth),
            # and ignore invalid/noisy tokens like "[r4r]".
            example_gender = self._normalize_gender_tag(example_meta.get("gender_tag"))
            template_gender = self._normalize_gender_tag(getattr(template, "gender_tag", None))
            raw_gender_tag = example_gender or template_gender or "[F4M]"
            location_hashtag = sanitize_hashtag_token(final_location)  # наприклад "Orlando" (без #)
            bare_gender_tag = strip_outer_wrappers(raw_gender_tag)  # "F4M"
            inferred_style = self._infer_title_style_from_examples(title_examples)
            rendered_gender_tag = self._apply_gender_wrapper(bare_gender_tag, inferred_style["gender_wrapper"])

            # 5. Prompt Construction
            json_schema = {
                "name": "post_response",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "headline_text": {
                            "type": "string", 
                            "description": "The text body ONLY. NO metadata prefixes."
                        },
                        "post_type": {"type": "string", "enum": ["Text", "Link"]},
                        "url_to_share": {"type": "string"},
                        "content": {"type": "string"},
                        "hashtags": {"type": "string"},
                    },
                    "required": ["headline_text", "post_type", "url_to_share", "content", "hashtags"],
                    "additionalProperties": False,
                },
            }

            example_block = ""
            for ex in title_examples[:3]:
                parts = re.split(r"[-–—]\s", ex, maxsplit=1)
                text_part = parts[-1].strip() if len(parts) > 1 else ex
                if re.match(r"^\d", ex) and len(parts) == 1:
                     tokens = ex.split(" ", 2)
                     if len(tokens) > 2: text_part = tokens[2]
                
                example_block += f"\n- Input Example: \"{ex}\"\n  -> CORRECT OUTPUT: \"{text_part}\""

            system_content = f"""You are posting to r/{template.sub}.
            Persona: {final_age}, {final_profession}, {final_location}.
            
            TASK: Return ONLY the 'headline_text'.
            
            CRITICAL INSTRUCTION:
            The input examples contain Age/Tags/Location. 
            You must STRIP these and return only the message text.
            
            BAD OUTPUT: "{final_age} {raw_gender_tag} {final_location} - Let's hang out"
            GOOD OUTPUT: "Let's hang out"

            HARD LIMIT:
            'headline_text' MUST be short enough that the final Reddit title fits within 140 characters.
            Keep 'headline_text' concise (typically under ~80 characters).
            
            {example_block}
            """

            user_msg = f"Prompt: {template.prompt}\nRules: {template.rules}\nAvoid: {template.body_exclusion_words}"

            # 6. Execution Loop
            max_retries = 3
            chosen_res = None
            final_title = ""
            final_body = ""
            sub_name = template.sub.strip()
            if not sub_name.startswith("r/"): sub_name = f"r/{sub_name}"

            for i in range(max_retries):
                self._log(logs, f">> Attempt {i+1}...")
                
                completion = client.chat.completions.create(
                    model="gpt-4o-2024-08-06",
                    messages=[
                        {"role": "system", "content": system_content},
                        {"role": "user", "content": user_msg}
                    ],
                    response_format={"type": "json_schema", "json_schema": json_schema},
                    temperature=0.9
                )
                
                try:
                    data = json.loads(completion.choices[0].message.content)
                except Exception as e:
                    self._log(logs, f"JSON Error: {e}")
                    continue

                raw_headline = data.get("headline_text", "")
                
                # 1) Extract the "title text" portion if the model leaked metadata like:
                #    "25 Orlando - Looking for ..." -> "Looking for ..."
                extract_fn = getattr(TitleFormatter, "extract_title_text_from_ai_title", None)
                if callable(extract_fn):
                    extracted_title_text = extract_fn(
                        raw_headline,
                        final_age=final_age,
                        rendered_gender_tag=bare_gender_tag,
                        location_hashtag=location_hashtag,
                        final_location=final_location,
                        wants_age=True,
                        wants_location=True,
                    )
                else:
                    # Backward-compatible fallback: rely on the hardening cleaners below.
                    extracted_title_text = raw_headline

                # 1.1) Extra hardening: remove repeated leaked prefixes (age/tag/location) from the start.
                extracted_title_text = self._strip_leading_redundant_prefixes(
                    extracted_title_text,
                    age=final_age,
                    raw_gender_tag=raw_gender_tag,
                    bare_gender_tag=bare_gender_tag,
                    location=final_location,
                    location_hashtag=location_hashtag,
                )

                # 2) Final safety pass: strip any remaining leaked prefix tokens from the start only.
                clean_headline = self._clean_ai_headline(
                    text=extracted_title_text,
                    age=final_age,
                    gender_tag=raw_gender_tag,
                    location=final_location,
                    logs=logs,
                )
                clean_headline = re.sub(r"^\s*[-–—]\s*", "", clean_headline).strip()
                
                # --- Assemble final title in the expected format ---
                # Format is inferred from `title_example`:
                # - default (no dash): "26 F4M Let's ..."
                # - dash + location:   "26 [F4M] Orlando - Let's ..."
                include_location = bool(inferred_style.get("include_location"))
                use_dash = bool(inferred_style.get("use_dash"))

                prefix_parts = [final_age, rendered_gender_tag]
                if include_location and final_location:
                    prefix_parts.append(final_location)
                prefix = " ".join([p for p in prefix_parts if p]).strip()

                if clean_headline:
                    if use_dash:
                        final_title = f"{prefix} - {clean_headline}" if prefix else clean_headline
                    else:
                        final_title = f"{prefix} {clean_headline}".strip() if prefix else clean_headline
                else:
                    final_title = prefix

                # Extra normalization
                final_title = re.sub(r"\s{2,}", " ", final_title).strip()
                final_title = re.sub(r"\s+-\s+", " - ", final_title).strip()
                final_title = self._truncate_title(final_title, max_len=140)

                self._log(logs, f"Assembled: '{final_title}'")
                
                # Dedupe
                if self._is_duplicate_recent_post(template.group, sub_name, final_title, data.get("content", "")):
                    self._log(logs, "DUPLICATE DETECTED. Retrying.")
                    continue
                
                chosen_res = data
                final_body = data.get("content", "")
                break

            if not chosen_res:
                frappe.throw("Failed to generate unique post.")

            # 7. Create Document
            # Prefer using the validated, rendered gender tag for flair (e.g. "[F4M]"),
            # never noisy tokens like "[r4r]".
            flair = rendered_gender_tag or None
            
            available_flairs = getattr(template, "available_flairs", None)
            if available_flairs:
                f_list = [x.strip() for x in str(available_flairs).splitlines() if x.strip()]
                if f_list: flair = f_list[0]
            section_flair = getattr(template, "section_flair", None)
            if section_flair:
                flair = section_flair

            tags = chosen_res.get("hashtags", "")
            if flair and flair not in tags:
                tags = f"{tags}, {flair}" if tags else flair

            doc = frappe.get_doc({
                "doctype": "Reddit Post",
                "title": final_title,
                "post_type": chosen_res.get("post_type"),
                "url_to_share": chosen_res.get("url_to_share"),
                "body_text": final_body,
                "hashtags": tags,
                "flair": flair or "",
                "subreddit_name": sub_name,
                "subreddit_group": template.group,
                "account": account_doc.name,
                "account_username": account_doc.username,
                "status": "Created",
                "template_used": template.name
            })
            doc.insert(ignore_permissions=True)
            self._log(logs, f"CREATED: {doc.name}")

            return {"status": "success", "post_name": doc.name, "logs": logs}

        except Exception as e:
            self._log(logs, f"CRITICAL ERROR: {str(e)}")
            log_error_safe("generate_post_from_template", logs, e)
            raise

    # API Wrapper
    def generate_post_for_agent(self, agent_name: str):
        logs = []
        try:
            self._log(logs, f"API Request: {agent_name}")
            if not agent_name: frappe.throw("Agent required")
            
            acc_name = frappe.db.get_value("Reddit Account", {"assistant_name": agent_name}, "name")
            if not acc_name: acc_name = frappe.db.get_value("Reddit Account", {"username": agent_name}, "name")
            if not acc_name: frappe.throw("Account not found")
            
            acc = frappe.get_doc("Reddit Account", acc_name)
            if not acc.subreddit_group: frappe.throw("No Group set")
            
            tmpl = frappe.db.get_value("Subreddit Template", {"group": acc.subreddit_group, "is_active": 1}, "name", order_by="last_used asc")
            if not tmpl: frappe.throw("No template found")

            return self.generate_post_from_template(tmpl, account_name=acc.name, agent_name=agent_name)
        except Exception as e:
            log_error_safe("generate_post_for_agent", logs, e)
            raise


# ----------------------------
# Whitelisted module wrappers
# ----------------------------
@frappe.whitelist()
def generate_post_from_template(
    template_name: str,
    account_name: str | None = None,
    agent_name: str | None = None,
    account_info: str | None = None,  # kept for backward-compat; ignored
):
    """
    Public Frappe endpoint that delegates to `SubredditTemplatePostGenerator`.
    This makes `post_generator.py` callable from the client/API.
    """
    return SubredditTemplatePostGenerator().generate_post_from_template(
        template_name, account_name=account_name, agent_name=agent_name
    )


@frappe.whitelist()
def generate_post_for_agent(agent_name: str):
    """
    Public Frappe endpoint that delegates to `SubredditTemplatePostGenerator`.
    """
    return SubredditTemplatePostGenerator().generate_post_for_agent(agent_name)