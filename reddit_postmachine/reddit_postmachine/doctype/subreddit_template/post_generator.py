from __future__ import annotations

import json
import hashlib
import re
import time

import frappe
from frappe.utils import strip_html
from openai import OpenAI

from .location_utils import extract_location_from_subreddit
from .safe_logging import log_error_safe, safe_log_append
from .title_format import strip_outer_wrappers, sanitize_hashtag_token 


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
            
            raw_loc = str(template.location or "").strip()
            if raw_loc.lower() == "dynamic":
                agent_location = extract_location_from_subreddit(template.sub, location=None)
            elif raw_loc:
                agent_location = raw_loc
            else:
                agent_location = account_doc.assistant_location

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
            raw_gender_tag = template.gender_tag or "[F4M]"
            location_hashtag = sanitize_hashtag_token(final_location)  # наприклад "#Orlando"

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

            title_examples = [x.strip() for x in (template.title_example or "").splitlines() if x.strip()]
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
                
                # --- APPLY SCORCHED EARTH CLEANING ---
                clean_headline = self._clean_ai_headline(
                    text=raw_headline,
                    age=final_age,
                    gender_tag=raw_gender_tag,
                    location=final_location,
                    logs=logs
                )
                
                # --- НОВЕ ФОРМУВАННЯ TITLE ЧЕРЕЗ F-STRING ---
                title_parts = [final_age, raw_gender_tag]
                title_parts.append(clean_headline.strip())

                final_title = " ".join([part for part in title_parts if part and part != "-"]).strip()

                # Додаткова чистка: прибрати подвійний дефіс або зайві пробіли
                final_title = re.sub(r'\s*-\s*$', '', final_title)  # якщо headline порожній
                final_title = re.sub(r'\s+-', ' - ', final_title)
                final_title = re.sub(r'\s{2,}', ' ', final_title).strip()

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
            flair = None
            if raw_gender_tag and "[" in raw_gender_tag:
                 flair = strip_outer_wrappers(raw_gender_tag)
            
            if template.available_flairs:
                f_list = [x.strip() for x in template.available_flairs.splitlines() if x.strip()]
                if f_list: flair = f_list[0]
            if template.section_flair:
                flair = template.section_flair

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