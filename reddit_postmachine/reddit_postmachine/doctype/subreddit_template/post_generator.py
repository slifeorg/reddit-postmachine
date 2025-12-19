from __future__ import annotations

import json
import hashlib
import re

import frappe
from frappe.utils import strip_html
from openai import OpenAI

from .location_utils import extract_location_from_subreddit
from .safe_logging import log_error_safe, safe_log_append
from .title_format import (
    TitleFormatRequirements,
    TitleFormatter,
    sanitize_hashtag_token,
    strip_outer_wrappers,
)

class SubredditTemplatePostGenerator:
    """
    Main service class responsible for generating Reddit Posts from Subreddit Templates.

    Public API is intentionally aligned with the old module-level functions:
    - generate_post_from_template(...)
    - generate_post_for_agent(...)
    """
    
    def __init__(self, *, openai_client_factory=None):
        self._openai_client_factory = openai_client_factory or (lambda api_key: OpenAI(api_key=api_key))

    @staticmethod
    def _stable_choice(seed: str, options: list[str]) -> str:
        if not options:
            return ""
        s = str(seed or "")
        h = hashlib.md5(s.encode("utf-8")).hexdigest()
        idx = int(h, 16) % len(options)
        return options[idx]

    @staticmethod
    def _stable_age(seed: str, *, min_age: int = 22, max_age: int = 39) -> int:
        """Deterministic age based on seed to avoid identical defaults across accounts."""
        if min_age >= max_age:
            return min_age
        s = str(seed or "")
        h = hashlib.md5(s.encode("utf-8")).hexdigest()
        span = (max_age - min_age) + 1
        return min_age + (int(h, 16) % span)

    def _derive_persona_defaults(self, *, account_username: str, account_doc_name: str, fallback_location: str) -> dict:
        """
        If account persona fields are missing, derive stable per-account defaults.
        This prevents multiple accounts from generating identical posts due to shared hardcoded defaults.
        """
        seed = (account_username or account_doc_name or "").strip() or "default"

        professions = [
            "yoga instructor",
            "software developer",
            "photographer",
            "nurse",
            "bartender",
            "fitness coach",
            "teacher",
            "graphic designer",
            "hair stylist",
            "massage therapist",
            "student",
            "real estate agent",
        ]
        locations = [
            fallback_location or "New Haven",
            "Austin",
            "Seattle",
            "Miami",
            "Denver",
            "Boston",
            "Chicago",
            "San Diego",
            "San Francisco",
            "Atlanta",
            "Dallas",
            "Philadelphia",
        ]
        quirks = [
            "playful and flirty",
            "confident and direct",
            "witty and slightly teasing",
            "warm and wholesome",
            "bold and adventurous",
            "shy but curious",
        ]
        hooks = [
            "likes spontaneous late-night adventures",
            "loves slow-burn conversation before meeting",
            "is big on consent and good vibes",
            "prefers low-key hangs over loud bars",
            "has a soft spot for confident energy",
            "is into fun banter and playful challenges",
        ]

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
        s = re.sub(r"\s+", " ", s)
        return s

    def _content_signature(self, *, title: str, body: str) -> str:
        base = f"title:{self._normalize_text_for_dedupe(title)}\nbody:{self._normalize_text_for_dedupe(body)}"
        return hashlib.sha1(base.encode("utf-8")).hexdigest()

    def _is_duplicate_recent_post(
        self,
        *,
        subreddit_group: str,
        subreddit_name: str,
        title: str,
        body: str,
        limit: int = 50,
    ) -> bool:
        """
        Detect near-exact duplicates among recent posts in the same group+subreddit.
        This catches duplicates across accounts as well.
        """
        sig = self._content_signature(title=title, body=body)
        rows = frappe.db.sql(
            """
            SELECT title, body_text
            FROM `tabReddit Post`
            WHERE subreddit_group = %s
              AND subreddit_name = %s
            ORDER BY creation DESC
            LIMIT %s
            """,
            (subreddit_group, subreddit_name, limit),
            as_dict=True,
        )
        for r in rows or []:
            if self._content_signature(title=(r.get("title") or ""), body=(r.get("body_text") or "")) == sig:
                return True
        return False

    @staticmethod
    def _ensure_frappe_local_response() -> None:
        try:
            if not hasattr(frappe, "local") or frappe.local is None:
                frappe.local = frappe._dict()
            if not hasattr(frappe.local, "response") or getattr(frappe.local, "response", None) is None:
                frappe.local.response = frappe._dict()
        except Exception:
            return

    def generate_post_from_template(self, template_name: str, account_name: str | None = None, agent_name: str | None = None):
        """
        Generate and create a new Reddit Post document based on a Subreddit Template.
        """
        logs: list[str] = []
        self._ensure_frappe_local_response()

        try:
            # 1) Validate template
            if not frappe.db.exists("Subreddit Template", template_name):
                frappe.throw(f"Template '{template_name}' not found")
            safe_log_append(logs, f"Template found: {template_name}")

            template = frappe.get_doc("Subreddit Template", template_name)
            safe_log_append(logs, f"Subreddit: {template.sub}, Group: {template.group}")

            # 2) Fetch OpenAI API key (DocType "Keys")
            key_doc_name = frappe.db.get_value("Keys", {}, "name")
            if not key_doc_name:
                frappe.throw("No 'Keys' record found. Please create one.")
            safe_log_append(logs, "Keys document found")

            api_key = frappe.get_doc("Keys", key_doc_name).get_password("api_key")
            if not api_key:
                frappe.throw("The API Key field is empty in the 'Keys' document.")
            safe_log_append(logs, "API key retrieved")

            client = self._openai_client_factory(api_key)

            # 3) Resolve account
            if account_name:
                if not frappe.db.exists("Reddit Account", account_name):
                    frappe.throw(f"Account '{account_name}' not found")
                account_doc = frappe.get_doc("Reddit Account", account_name)
            else:
                account_value = frappe.db.get_value(
                    "Reddit Account", {"status": "Active", "is_posting_paused": 0}, "name"
                )
                if not account_value:
                    account_value = frappe.db.get_value("Reddit Account", {}, "name")
                if not account_value:
                    frappe.throw("No Reddit Account found in system to assign to this post.")
                account_doc = frappe.get_doc("Reddit Account", account_value)

            # Ensure safe defaults for optional fields
            for _field in (
                "account_description",
                "posting_style",
                "assistant_name",
                "assistant_age",
                "assistant_profession",
                "assistant_location",
                "custom_prompt_instructions",
                "status",
                "is_posting_paused",
                "username",
            ):
                if not hasattr(account_doc, _field):
                    if _field == "assistant_age":
                        setattr(account_doc, _field, None)
                    elif _field in ("is_posting_paused",):
                        setattr(account_doc, _field, False)
                    elif _field == "status":
                        setattr(account_doc, _field, "Inactive")
                    else:
                        setattr(account_doc, _field, "")

            if account_doc.status != "Active" or account_doc.is_posting_paused:
                account_name_str = getattr(account_doc, "name", "Unknown")
                frappe.throw(f"Account '{account_name_str}' is inactive or paused.")

            safe_log_append(logs, f"Account fixed by input: {account_doc.name}" if account_name else f"Account auto-selected: {account_doc.name}")

            account_username = account_doc.username

            # 4) Build prompts
            instructions = strip_html(template.prompt) if template.prompt else "Create viral content."
            rules = strip_html(template.rules) if template.rules else "No specific rules."
            exclusions = template.body_exclusion_words if template.body_exclusion_words else ""

            # Title-format settings
            title_format_template = strip_html(getattr(template, "title_format", "") or "") or ""
            title_prompt = strip_html(getattr(template, "title_prompt", "") or "") or ""
            title_examples_raw = strip_html(getattr(template, "title_example", "") or "") or ""
            title_examples = [ln.strip() for ln in str(title_examples_raw).splitlines() if ln.strip()]

            title_req = TitleFormatRequirements.from_template(title_format_template)
            safe_log_append(logs, f"Template title_format: {title_format_template!r}")
            safe_log_append(logs, f"Template gender_tag (raw): {getattr(template, 'gender_tag', '')!r}")

            # Warn if title_format appears to hardcode a gender tag instead of using {gender_tag}
            if title_format_template and ("{gender_tag}" not in title_format_template):
                if (
                    re.search(r"\[[A-Za-z0-9]{1,4}4[A-Za-z0-9]{1,4}\]", title_format_template)
                    or re.search(r"\[(?:r4r|R4R)\]", title_format_template)
                    or re.search(r"\[(?:F|M|T)\]", title_format_template)
                ):
                    safe_log_append(
                        logs,
                        "WARNING: title_format contains a hardcoded gender tag like '[F4M]' but does not use '{gender_tag}'. "
                        "This can cause mismatch between title tag and flair.",
                    )

            # Detect location hashtag requirement either from rules text (legacy) OR title_format template (preferred)
            requires_location_hashtag = False
            if rules:
                rules_lower = rules.lower()
                if (
                    ("hashtag" in rules_lower and "location" in rules_lower)
                    or ("#" in rules and ("location" in rules_lower or "specific location" in rules_lower))
                    or ("followed directly by a hashtag" in rules_lower)
                ):
                    requires_location_hashtag = True
                    safe_log_append(logs, "Detected requirement for location hashtag (rules-based)")
            if title_req.wants_city_hashtag or title_req.wants_location_hashtag:
                requires_location_hashtag = True
                safe_log_append(logs, "Detected requirement for location hashtag (title_format-based)")

            agent_display_name = agent_name
            if not agent_display_name:
                if hasattr(account_doc, "assistant_name") and account_doc.assistant_name:
                    agent_display_name = str(account_doc.assistant_name).strip()
                else:
                    agent_display_name = account_username or "Unknown"
            if not agent_display_name or not isinstance(agent_display_name, str):
                agent_display_name = str(account_username) if account_username else "Unknown"

            # Age
            agent_age = None
            if hasattr(account_doc, "assistant_age") and account_doc.assistant_age is not None:
                try:
                    agent_age = int(account_doc.assistant_age)
                except (ValueError, TypeError):
                    agent_age = None

            # Profession
            agent_profession = ""
            if hasattr(account_doc, "assistant_profession") and account_doc.assistant_profession:
                agent_profession = str(account_doc.assistant_profession).strip()

            # Location selection: template.location overrides account.assistant_location
            template_location_raw = ""
            if hasattr(template, "location") and template.location:
                template_location_raw = str(template.location).strip()

            account_location_raw = ""
            if hasattr(account_doc, "assistant_location") and account_doc.assistant_location:
                account_location_raw = str(account_doc.assistant_location).strip()

            agent_location_raw = template_location_raw or account_location_raw

            custom_instructions_raw = ""
            if hasattr(account_doc, "custom_prompt_instructions") and account_doc.custom_prompt_instructions:
                custom_instructions_raw = str(account_doc.custom_prompt_instructions).strip()

            try:
                agent_custom_instructions = strip_html(custom_instructions_raw) if custom_instructions_raw else ""
            except Exception:
                agent_custom_instructions = str(custom_instructions_raw) if custom_instructions_raw else ""

            safe_log_append(
                logs,
                "Raw agent data from DB - assistant_name: {n}, assistant_age: {a}, assistant_profession: {p}, assistant_location: {l}".format(
                    n=getattr(account_doc, "assistant_name", "NOT FOUND"),
                    a=getattr(account_doc, "assistant_age", "NOT FOUND"),
                    p=getattr(account_doc, "assistant_profession", "NOT FOUND"),
                    l=getattr(account_doc, "assistant_location", "NOT FOUND"),
                ),
            )

            agent_location = None
            is_dynamic_location = False
            if agent_location_raw and isinstance(agent_location_raw, str) and agent_location_raw.lower() == "dynamic":
                agent_location = extract_location_from_subreddit(template.sub, location=None)
                is_dynamic_location = True
                safe_log_append(logs, f"Location extracted from subreddit '{template.sub}': {agent_location} (dynamic)")
            elif agent_location_raw:
                agent_location = str(agent_location_raw)

            safe_log_append(logs, f"Agent data - Name: {agent_display_name}, Age: {agent_age}, Profession: {agent_profession}, Location: {agent_location}")

            # Agent info block (kept same shape)
            agent_info_lines: list[str] = []
            try:
                safe_display_name = str(agent_display_name) if agent_display_name is not None else "Unknown"
                safe_profession = str(agent_profession) if agent_profession is not None and agent_profession else ""
                safe_location = str(agent_location) if agent_location is not None else ""
                safe_custom_instructions = (
                    str(agent_custom_instructions) if agent_custom_instructions is not None and agent_custom_instructions else ""
                )

                agent_info_lines.append(f"Agent/Persona Name: {safe_display_name}")
                if agent_age:
                    agent_info_lines.append(f"Age: {agent_age}")
                else:
                    agent_info_lines.append("Age: [MUST INVENT A SPECIFIC AGE - use a number like 25, 30, 28, etc. NOT [Age] or placeholder]")

                if safe_profession:
                    agent_info_lines.append(f"Profession/Hobby: {safe_profession}")
                else:
                    agent_info_lines.append(
                        "Profession/Hobby: [MUST INVENT A SPECIFIC PROFESSION/HOBBY - use real text like 'software developer', 'yoga instructor', 'photographer', etc. NOT [Profession] or placeholder]"
                    )

                if safe_location:
                    agent_info_lines.append(f"Location/City: {safe_location}")
                else:
                    agent_info_lines.append("Location/City: [MUST INVENT A SPECIFIC CITY NAME - use real city name, NOT [City] or placeholder]")

                if safe_custom_instructions:
                    agent_info_lines.append(f"Custom Instructions: {safe_custom_instructions}")
            except Exception:
                agent_info_lines = ["Agent info error"]

            if not isinstance(agent_info_lines, list) or len(agent_info_lines) == 0:
                agent_info_lines = ["Agent information not available"]

            agent_info_block = "\n".join(agent_info_lines)
            if instructions is None:
                instructions = ""

            safe_log_append(logs, f"Agent info block: {agent_info_block}")

            subreddit_lower = str(template.sub or "").lower()
            is_r4r = "r4r" in subreddit_lower or "personals" in subreddit_lower

            persona_defaults = self._derive_persona_defaults(
                account_username=str(account_username or "").strip(),
                account_doc_name=str(getattr(account_doc, "name", "") or "").strip(),
                fallback_location=str(agent_location or "").strip() or "New Haven",
            )

            # Use per-account stable defaults if DB fields are empty
            final_age = str(agent_age) if agent_age is not None else str(persona_defaults["age"])
            final_location = str(agent_location) if agent_location else str(persona_defaults["location"])
            final_profession = str(agent_profession) if agent_profession else str(persona_defaults["profession"])
            final_name = (
                str(agent_display_name)
                if agent_display_name
                else (str(account_username) if account_username else (str(getattr(account_doc, "name", "")) or "Unknown"))
            )

            # For dynamic location, we'll let the AI choose a nearby location
            if is_dynamic_location:
                final_location = agent_location

            # Gender tag selection
            gender_tag_raw = None
            if hasattr(template, "gender_tag") and template.gender_tag:
                gender_tag_raw = str(template.gender_tag).strip()
            elif is_r4r:
                gender_tag_raw = "F4M"

            gender_tag_bare = strip_outer_wrappers(gender_tag_raw) if gender_tag_raw else None

            # Render gender tag for title, respecting title_format wrapper style
            rendered_gender_tag = ""
            if gender_tag_raw and title_req.wants_gender_tag:
                if title_req.uses_square_brackets_for_gender or title_req.uses_parentheses_for_gender:
                    rendered_gender_tag = gender_tag_bare
                else:
                    rendered_gender_tag = gender_tag_raw
            elif gender_tag_raw and not title_req.has_format:
                rendered_gender_tag = gender_tag_bare

            # Prepare location hashtag token if needed
            location_hashtag = ""
            if requires_location_hashtag and final_location:
                location_hashtag = sanitize_hashtag_token(final_location)

            # Title format guidance should come from `title_format` (if configured)
            title_format_text = ""
            placeholder_text = ""
            brackets_rules_text = ""
            if title_req.has_format:
                example_title_text = (title_examples[0] if title_examples else "Looking for something fun tonight")
                example_rendered = TitleFormatter.render(
                    title_format_template,
                    age=final_age,
                    gender_tag=rendered_gender_tag or (gender_tag_bare or ""),
                    city=location_hashtag,
                    city_full=final_location,
                    location=final_location,
                    location_full=final_location,
                    title_text=example_title_text,
                )
                title_format_text = f'Use this EXACT template: "{example_rendered}"'
                if not title_req.allows_square_brackets:
                    brackets_rules_text = "1. FORBIDDEN: Do NOT use square brackets [] anywhere in the title unless the title_format explicitly contains them."
                if not title_req.allows_parentheses:
                    brackets_rules_text = (
                        (brackets_rules_text + "\n2. FORBIDDEN: Do NOT use parentheses () anywhere in the title unless the title_format explicitly contains them.").strip()
                    )
            else:
                if gender_tag_bare:
                    if requires_location_hashtag and location_hashtag:
                        title_format_text = f'Start with age followed by gender tag in square brackets with a space, then add hashtag with SPECIFIC location: "{final_age} [{gender_tag_bare}] #{location_hashtag} - ..."'
                    else:
                        title_format_text = f'Start with age followed by gender tag in square brackets with a space: "{final_age} [{gender_tag_bare}]"'
                    brackets_rules_text = f'1. ALLOWED: You MUST use square brackets for the Gender tag in the title with a space after age (e.g., "{final_age} [{gender_tag_bare}]").'
                else:
                    title_format_text = "Create an engaging title."

            # Context for R4R / title_format
            post_type_context = ""
            if title_req.has_format:
                post_type_context = f"""\n\nTITLE REQUIREMENT (from Subreddit Template):
                        - Follow the configured title_format exactly.
                        - Do NOT add extra age/location/tags outside the template.
                        - Title Prompt (if provided): {title_prompt if title_prompt else "(none)"}"""
                if title_examples:
                    post_type_context += "\nTITLE EXAMPLES (configured):\n" + "\n".join([f"- {ex}" for ex in title_examples[:5]])
            elif gender_tag_bare:
                if requires_location_hashtag and location_hashtag:
                    example_format = f"{final_age} [{gender_tag_bare}] #{location_hashtag} - Looking to get fucked. Hung only!"
                    post_type_context = f"""\n\nTITLE REQUIREMENT: You MUST follow this EXACT format:
                        REQUIRED FORMAT: "{final_age} [{gender_tag_bare}] #{location_hashtag} - ..." 
                        Example: "{example_format}" """
                elif is_r4r:
                    post_type_context = f"""\n\nPOST TYPE: This is an R4R personal ad post. 
                        TITLE REQUIREMENT: You MUST start the title with age followed by gender tag in square brackets with a space between them.
                        REQUIRED FORMAT: "{final_age} [{gender_tag_bare}] ..." """

            # Extra guardrails: if title_format does NOT include age/location, forbid them in title
            forbid_age_in_title = title_req.has_format and (not title_req.wants_age)
            forbid_location_in_title = title_req.has_format and (not title_req.wants_any_location)

            extra_title_guardrails = ""
            if forbid_age_in_title:
                extra_title_guardrails += f'\n- DO NOT include age "{final_age}" anywhere in the title unless the title_format contains {{age}}.'
            if forbid_location_in_title:
                extra_title_guardrails += f'\n- DO NOT include location "{final_location}" (or hashtags like "#{location_hashtag}") anywhere in the title unless the title_format contains a location placeholder.'

            instructions = f"""{instructions}

        AGENT/PERSONA INFORMATION:
        {agent_info_block}
        {post_type_context}

        CRITICAL REQUIREMENTS:
        1. USE REAL VALUES: Use age "{final_age}", location "{final_location}", profession "{final_profession}".
        2. TITLE FORMAT: {title_format_text}
        3. TITLE SAFETY (IMPORTANT):{extra_title_guardrails}
        4. NO PLACEHOLDERS: Do NOT use brackets for placeholders like [City] or [Insert Age]. {placeholder_text}"""

            system_content = f"""You are a Reddit expert creating posts for r/{template.sub} (Group: {template.group}).
        You are writing AS the persona described below.

        IDENTITY CONTEXT:
        - Username: {account_username}
        - Name: {final_name}
        - Age: {final_age}
        - Profession: {final_profession}
        - Location: {final_location}

        INTERNAL (do not mention): PersonaSeed={persona_defaults["seed"]}; PersonaQuirk={persona_defaults["quirk"]}; PersonaHook={persona_defaults["hook"]}

        RULES FOR BRACKETS:
        {brackets_rules_text}
        2. FORBIDDEN: You MUST NOT use square brackets for placeholders (e.g., [City], [Location]). Write the actual city name instead."""

            safe_log_append(logs, "Prompt prepared: Updated to allow [Tag] but ban [Placeholder]")

            # 5) JSON Schema
            json_schema = {
                "name": "reddit_post_response",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string", "description": "Engaging title including [AgeGender] tag"},
                        "post_type": {"type": "string", "enum": ["Text", "Link"]},
                        "url_to_share": {"type": "string", "description": "URL if Link type, else empty"},
                        "content": {"type": "string", "description": "Body text"},
                        "hashtags": {"type": "string", "description": "Relevant flairs and tags"},
                    },
                    "required": ["title", "post_type", "url_to_share", "content", "hashtags"],
                    "additionalProperties": False,
                },
            }

            # User message title requirements
            if title_req.has_format:
                example_title_text = (title_examples[0] if title_examples else "Looking for something fun tonight")
                example_rendered = TitleFormatter.render(
                    title_format_template,
                    age=final_age,
                    gender_tag=(rendered_gender_tag or (gender_tag_bare or "")),
                    city=location_hashtag,
                    city_full=final_location,
                    location=final_location,
                    location_full=final_location,
                    title_text=example_title_text,
                )
                title_format_line1 = f'- Use this EXACT template: "{example_rendered}"'
                title_format_line2 = "- Do not add anything before/after the template."
                title_format_line3 = "- If the template does not include age/location, do NOT add them."
                title_format_line4 = "- Replace only {title_text} with your headline text (if present in template)."
                title_format_line5 = ""
                title_format_line6 = ""
                examples_correct = f'CORRECT TITLE: "{example_rendered}"'
            elif requires_location_hashtag and location_hashtag and gender_tag_bare:
                title_format_line1 = "- The title MUST start with age number followed by gender tag in square brackets with a SPACE between them."
                title_format_line2 = f"- Then add hashtag with SPECIFIC location: #{location_hashtag}"
                title_format_line3 = "- Then a dash and space: - "
                title_format_line4 = "- Then your title text"
                title_format_line5 = f'- Example: "{final_age} [{gender_tag_bare}] #{location_hashtag} - Looking to get fucked. Hung only!"'
                title_format_line6 = ""
                examples_correct = f'CORRECT TITLE: "{final_age} [{gender_tag_bare}] #{location_hashtag} - Looking to get fucked. Hung only!"'
            elif gender_tag_bare:
                title_format_line1 = "- The title MUST start with age number followed by gender tag in square brackets with a SPACE between them."
                title_format_line2 = f'- Required format: "{final_age} [{gender_tag_bare}] ..."'
                title_format_line3 = f'- Example: "{final_age} [{gender_tag_bare}] Looking for a fun time in {final_location}"'
                title_format_line4 = ""
                title_format_line5 = ""
                title_format_line6 = ""
                examples_correct = f'CORRECT TITLE: "{final_age} [{gender_tag_bare}] Looking for a fun time in {final_location}"'
            else:
                title_format_line1 = "- Create an engaging title."
                title_format_line2 = ""
                title_format_line3 = ""
                title_format_line4 = ""
                title_format_line5 = ""
                title_format_line6 = ""
                examples_correct = 'CORRECT TITLE: "Looking for someone fun tonight"'

            # Normalize subreddit name early (used for dedupe + final insert)
            subreddit_name = template.sub.strip()
            if not subreddit_name.startswith("r/"):
                subreddit_name = f"r/{subreddit_name}"

            # We'll retry generation a couple of times if we hit an exact duplicate
            max_attempts = 3
            chosen_ai_response = None
            chosen_title = None
            chosen_content = None

            for attempt in range(1, max_attempts + 1):
                generation_salt = frappe.generate_hash(length=10)
                safe_log_append(logs, f"Sending request to OpenAI (attempt {attempt}/{max_attempts})")

                user_message_content = f"""Generate a Reddit post for r/{template.sub}.

        PROMPT/TEMPLATE:
        {instructions}

        RULES:
        {rules}

        AVOID WORDS:
        {exclusions}

        ABSOLUTE REQUIREMENTS:

        1. TITLE FORMAT (CRITICAL):
        {title_format_line1}
        {title_format_line2}
        {title_format_line3}
        {title_format_line4}
        {title_format_line5}
        {title_format_line6}

        2. NO PLACEHOLDERS:
        - FORBIDDEN: [City], [Location], [Age], [Insert Interest]
        - REQUIRED: Use the actual values. Write "{final_location}", NOT "[City]".

        3. EXAMPLES:
        {examples_correct}
        CORRECT TITLE: "26 [F4M] Looking for someone fun in Houston"
        INCORRECT TITLE: "26[F4M] Looking for..." (missing space)
        INCORRECT TITLE: "[Age]F4M Looking for [Connection] in [City]"

        4. CONTENT:
        - "Hi, I'm {final_name}, a {final_age}-year-old {final_profession} from {final_location}."

        5. EXECUTION:
        - Write natural, complete sentences.
        - Do NOT use any template placeholders.

        6. USE PROVIDE HASHTAGS AS SCPECIFIED IN RULES
        """

                # Add per-call salt so consecutive retries don't collapse to the same completion
                system_content_with_salt = (
                    system_content
                    + f"\n\nINTERNAL (do not mention): GenerationAttempt={attempt}; GenerationSalt={generation_salt}"
                )

                completion = client.chat.completions.create(
                    model="gpt-4o-2024-08-06",
                    messages=[
                        {"role": "system", "content": system_content_with_salt},
                        {"role": "user", "content": user_message_content},
                    ],
                    response_format={"type": "json_schema", "json_schema": json_schema},
                    # Encourage variation while still respecting strict title_format enforcement.
                    temperature=0.9,
                    top_p=1.0,
                )

                if not completion or not completion.choices or len(completion.choices) == 0:
                    frappe.throw("No response from OpenAI")

                response_content = completion.choices[0].message.content
                if not response_content:
                    frappe.throw("Empty response from OpenAI")

                try:
                    ai_response = json.loads(response_content)
                except json.JSONDecodeError as e:
                    frappe.throw(f"Invalid JSON response from OpenAI: {str(e)}")

                safe_log_append(logs, "OpenAI response received")

                title = ai_response.get("title", "") or ""
                content = ai_response.get("content", "") or ""

                if not isinstance(title, str):
                    title = str(title)
                if not isinstance(content, str):
                    content = str(content)

                safe_final_age = str(final_age) if final_age else "28"
                safe_final_location = str(final_location) if final_location else "New Haven"
                safe_final_profession = str(final_profession) if final_profession else "photographer"

                placeholder_replacements = {
                    r"\[Age\]": safe_final_age,
                    r"\[age\]": safe_final_age,
                    r"\[City\]": safe_final_location,
                    r"\[city\]": safe_final_location,
                    r"\[City name\]": safe_final_location,
                    r"\[Location\]": safe_final_location,
                    r"\[location\]": safe_final_location,
                    r"\[Profession\]": safe_final_profession,
                    r"\[specific interests\]": safe_final_profession,
                }

                original_title = title
                original_content = content

                try:
                    for pattern, replacement in placeholder_replacements.items():
                        if title:
                            title = re.sub(pattern, str(replacement), title, flags=re.IGNORECASE)
                        if content:
                            content = re.sub(pattern, str(replacement), content, flags=re.IGNORECASE)

                    # Placeholder cleanup + bracket policy (based on title_format)
                    if title:
                        gender_token_in_title = ""
                        if title_req.wants_gender_tag and gender_tag_bare:
                            if title_req.uses_square_brackets_for_gender:
                                gender_token_in_title = f"[{gender_tag_bare}]"
                            elif title_req.uses_parentheses_for_gender:
                                gender_token_in_title = f"({gender_tag_bare})"
                            else:
                                gender_token_in_title = str(gender_tag_raw or gender_tag_bare)

                        if title_req.has_format and not title_req.allows_square_brackets:
                            title = re.sub(r"\[.*?\]", "", title)
                        else:
                            if gender_token_in_title:
                                temp_marker = "__GENDER_TAG__"
                                title = title.replace(gender_token_in_title, temp_marker)
                                title = re.sub(r"\[.*?\]", "", title)
                                title = title.replace(temp_marker, gender_token_in_title)
                            else:
                                title = re.sub(r"\[.*?\]", "", title)

                        if title_req.has_format and not title_req.allows_parentheses:
                            title = re.sub(r"\([^)]*\)", "", title)

                    if content:
                        content = re.sub(r"\[.*?\]", "", content)

                except Exception as e:
                    safe_log_append(logs, f"Error during placeholder replacement: {str(e)}")

                if title != original_title or content != original_content:
                    safe_log_append(logs, f"Placeholders processed. Final title: {title[:100]}")

                # Enforce title format (preferred)
                if title_req.has_format and title_format_template and title:
                    wants_age = bool(title_req.wants_age)
                    wants_location = bool(title_req.wants_any_location)

                    gender_token_in_title = ""
                    if title_req.wants_gender_tag and gender_tag_bare:
                        if title_req.uses_square_brackets_for_gender:
                            gender_token_in_title = f"[{gender_tag_bare}]"
                        elif title_req.uses_parentheses_for_gender:
                            gender_token_in_title = f"({gender_tag_bare})"
                        else:
                            gender_token_in_title = str(gender_tag_raw or gender_tag_bare)

                    extracted_title_text = TitleFormatter.extract_title_text_from_ai_title(
                        title,
                        final_age=final_age,
                        rendered_gender_tag=gender_token_in_title,
                        location_hashtag=location_hashtag,
                        final_location=final_location,
                        wants_age=wants_age,
                        wants_location=wants_location,
                    )
                    final_title_text = extracted_title_text if title_req.wants_title_text else (title or "")
                    rebuilt = TitleFormatter.render(
                        title_format_template,
                        age=final_age,
                        gender_tag=(rendered_gender_tag or (gender_tag_bare or "")),
                        city=location_hashtag,
                        city_full=final_location,
                        location=final_location,
                        location_full=final_location,
                        title_text=final_title_text,
                    )
                    if rebuilt and rebuilt != title:
                        safe_log_append(logs, f"Title format enforced via title_format: '{title[:80]}' -> '{rebuilt[:80]}'")
                        title = rebuilt
                elif gender_tag_bare:
                    # Legacy enforcement
                    title_trimmed = title.strip()
                    expected_start = f"{final_age} [{gender_tag_bare}]"
                    if not title_trimmed.startswith(expected_start):
                        title = f"{final_age} [{gender_tag_bare}] {title_trimmed}"
                        safe_log_append(logs, "Title format corrected (legacy): Added age and gender tag at start")

                # Dedupe guard across accounts in same group/subreddit
                try:
                    if self._is_duplicate_recent_post(
                        subreddit_group=str(template.group or ""),
                        subreddit_name=subreddit_name,
                        title=title,
                        body=content,
                        limit=50,
                    ):
                        safe_log_append(logs, f"Duplicate detected for {subreddit_name} (attempt {attempt}); regenerating...")
                        continue
                except Exception as _dedupe_err:
                    # If dedupe check fails, do not block post generation
                    safe_log_append(logs, f"Warning: dedupe check failed: {_dedupe_err}")

                chosen_ai_response = ai_response
                chosen_title = title
                chosen_content = content
                break

            if not chosen_ai_response or not chosen_title or chosen_content is None:
                frappe.throw("Failed to generate a unique post (duplicate guard triggered)")

            # Use chosen outputs
            ai_response = chosen_ai_response
            title = chosen_title
            content = chosen_content

            safe_log_append(logs, "Creating Reddit Post doc")

            hashtags_from_ai = ai_response.get("hashtags", "") or ""

            # Flair priority: gender_tag > section_flair > available_flairs
            flair_value = None
            if gender_tag_bare:
                flair_value = gender_tag_bare
                safe_log_append(logs, f"Using gender_tag '{gender_tag_bare}' as flair")
            elif hasattr(template, "section_flair") and template.section_flair:
                flair_value = str(template.section_flair).strip()
                safe_log_append(logs, f"Using section_flair '{flair_value}' as flair")
            elif hasattr(template, "available_flairs") and template.available_flairs:
                available_flairs_list = [f.strip() for f in str(template.available_flairs).split("\n") if f.strip()]
                if available_flairs_list:
                    flair_value = available_flairs_list[0]
                    safe_log_append(logs, f"Using first available_flair '{flair_value}' as flair")

            final_hashtags = hashtags_from_ai
            if flair_value:
                if final_hashtags:
                    if flair_value not in final_hashtags:
                        final_hashtags = f"{final_hashtags}, {flair_value}" if final_hashtags else flair_value
                else:
                    final_hashtags = flair_value

                safe_log_append(logs, f"Flair '{flair_value}' added to hashtags: '{final_hashtags}'")
            else:
                safe_log_append(logs, "No flair found in template")

            new_post = frappe.get_doc(
                {
                    "doctype": "Reddit Post",
                    "title": title,
                    "post_type": ai_response.get("post_type"),
                    "url_to_share": ai_response.get("url_to_share"),
                    "body_text": content,
                    "hashtags": final_hashtags,
                    "flair": flair_value or "",
                    "subreddit_name": subreddit_name,
                    "subreddit_group": template.group,
                    "account": account_doc.name,
                    "account_username": account_username or "Unknown",
                    "status": "Created",
                    "template_used": template.name,
                }
            )

            new_post.insert(ignore_permissions=True)
            safe_log_append(logs, f"Reddit Post created: {new_post.name}")

            return {"status": "success", "post_name": new_post.name, "logs": logs}

        except AttributeError as e:
            log_error_safe("generate_post_from_template", logs, e)
            raise
        except Exception as e:
            log_error_safe("generate_post_from_template", logs, e)
            raise

    def generate_post_for_agent(self, agent_name: str):
        """
        API method: returns a new Reddit Post for the given agent.
        """
        logs: list[str] = []

        try:
            resp = getattr(frappe, "local", None)
            if resp is None:
                resp = frappe._dict()
                frappe.local = resp

            if hasattr(resp, "response") and resp.response is not None:
                response_obj = resp.response
            else:
                response_obj = frappe._dict()
                try:
                    resp.response = response_obj
                except Exception:
                    response_obj = None

            if response_obj is not None:
                headers = getattr(response_obj, "headers", None)
                if headers is None or not isinstance(headers, dict):
                    headers = {}
                    try:
                        response_obj.headers = headers
                    except Exception:
                        headers = None

                if headers is not None:
                    try:
                        headers["Access-Control-Allow-Origin"] = "*"
                        headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
                        headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Frappe-Site-Name"
                        headers["Access-Control-Max-Age"] = "3600"
                    except Exception:
                        pass
        except Exception as e:
            safe_log_append(logs, f"Warning: Could not set CORS headers: {str(e)}")

        if not agent_name:
            frappe.throw("Agent name is required.")

        safe_log_append(logs, f"Agent received: {agent_name}")

        account_name = frappe.db.get_value("Reddit Account", {"assistant_name": agent_name}, "name")
        if not account_name:
            account_name = frappe.db.get_value("Reddit Account", {"username": agent_name}, "name")
        if not account_name:
            frappe.throw(f"No Reddit Account found for agent '{agent_name}'.")

        safe_log_append(logs, f"Account resolved: {account_name}")

        account_doc = frappe.get_doc("Reddit Account", account_name)

        for _field in (
            "account_description",
            "posting_style",
            "assistant_name",
            "assistant_age",
            "assistant_profession",
            "assistant_location",
            "custom_prompt_instructions",
            "subreddit_group",
            "status",
            "is_posting_paused",
            "username",
        ):
            if not hasattr(account_doc, _field):
                if _field == "assistant_age":
                    setattr(account_doc, _field, None)
                elif _field in ("is_posting_paused",):
                    setattr(account_doc, _field, False)
                elif _field == "status":
                    setattr(account_doc, _field, "Inactive")
                else:
                    setattr(account_doc, _field, "")

        subreddit_group = account_doc.subreddit_group
        if not subreddit_group:
            frappe.throw(f"Account '{account_name}' has no subreddit group assigned.")
        safe_log_append(logs, f"Subreddit group: {subreddit_group}")

        last_post_row = frappe.db.sql(
            """
        SELECT name, posted_at
        FROM `tabReddit Post`
        WHERE subreddit_group = %s AND status = 'Posted' AND posted_at IS NOT NULL
        ORDER BY posted_at DESC
        LIMIT 1
        """,
            (subreddit_group,),
            as_dict=True,
        )

        last_posted_at = last_post_row[0]["posted_at"] if last_post_row else None
        last_post_name = last_post_row[0]["name"] if last_post_row else None
        safe_log_append(
            logs,
            f"Last posted in group: {last_posted_at} (post: {last_post_name})" if last_posted_at else "No posted items found in this group yet",
        )

        safe_log_append(logs, "Selecting template by group (oldest last_used, then usage_count)")
        template_row = frappe.db.sql(
            """
        SELECT name
        FROM `tabSubreddit Template`
        WHERE `group` = %s AND is_active = 1
        ORDER BY COALESCE(last_used, '1970-01-01') ASC, usage_count ASC
        LIMIT 1
        """,
            (subreddit_group,),
            as_dict=True,
        )

        if not template_row:
            frappe.throw(f"No active Subreddit Template found for group '{subreddit_group}'.")

        template_name = template_row[0]["name"]
        safe_log_append(logs, f"Template selected: {template_name}")

        try:
            result = self.generate_post_from_template(template_name, account_name=account_doc.name, agent_name=agent_name)
        except Exception as e:
            log_error_safe("generate_post_for_agent", logs, e)
            raise

        if result is None:
            frappe.throw("Failed to generate post from template")
        if not isinstance(result, dict):
            frappe.throw("Invalid result from generate_post_from_template")

        try:
            result_logs = result.get("logs", [])
            if result_logs and isinstance(result_logs, list):
                if logs is not None and isinstance(logs, list):
                    try:
                        logs.extend(result_logs)
                    except Exception:
                        pass
        except Exception:
            pass

        try:
            if isinstance(result, dict):
                result.update(
                    {
                        "agent_account": account_doc.name,
                        "agent_name": agent_name,
                        "subreddit_group": subreddit_group,
                        "template_used": template_name,
                        "last_region_post": {"name": last_post_name, "posted_at": last_posted_at},
                        "logs": logs if logs is not None and isinstance(logs, list) else [],
                    }
                )
            else:
                result = {
                    "agent_account": account_doc.name,
                    "agent_name": agent_name,
                    "subreddit_group": subreddit_group,
                    "template_used": template_name,
                    "last_region_post": {"name": last_post_name, "posted_at": last_posted_at},
                    "logs": logs if logs is not None and isinstance(logs, list) else [],
                }
        except Exception:
            result = {
                "agent_account": account_doc.name,
                "agent_name": agent_name,
                "subreddit_group": subreddit_group,
                "template_used": template_name,
                "last_region_post": {"name": last_post_name, "posted_at": last_posted_at},
                "logs": logs if logs is not None and isinstance(logs, list) else [],
            }

        return result
