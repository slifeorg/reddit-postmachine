import frappe
from frappe.model.document import Document
from frappe.utils import strip_html
import json
import re
from openai import OpenAI
from .title_format import TitleFormatter, TitleFormatRequirements, sanitize_hashtag_token

class SubredditTemplate(Document):
    pass


def _safe_strip_html(val: str) -> str:
    try:
        return strip_html(val) if val else ""
    except Exception:
        return str(val) if val else ""


def _parse_title_examples(raw: str):
    """
    title_example can be:
    - plain text with one example per line
    - a JSON list string like ["...", "..."]
    """
    if not raw:
        return []
    raw = raw.strip()
    if not raw:
        return []

    # Try JSON list first
    if raw.startswith("[") and raw.endswith("]"):
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                out = []
                for x in parsed:
                    if x is None:
                        continue
                    s = str(x).strip()
                    if s:
                        out.append(s)
                if out:
                    return out
        except Exception:
            pass

    # Fallback: split lines
    lines = []
    for line in raw.splitlines():
        s = line.strip().strip('"').strip("'").strip()
        if s:
            lines.append(s)
    return lines


def extract_format_from_example(example: str) -> str:
    """
    Attempts to convert a literal example like '26 [F4M] #Orlando - Text'
    into a format template like '{age} [{gender_tag}] #{city} - {title_text}'.
    """
    if not example or "{" in example:
        return example
        
    f = example
    
    # Identify Age (2 digits at start or near start)
    m_age = re.search(r'\b(\d{2})\b', f)
    if m_age:
        # Only replace if it's the ONLY 2-digit number or clearly the age
        f = f.replace(m_age.group(1), "{age}", 1)
        
    # Identify Gender Tag [F4M], [M4F], [r4r], (F4M), etc.
    m_tag = re.search(r'[\[\(]?\b[FMTfmt]{1,3}4[FMfmAa]{1,3}\b[\]\)]?', f)
    if m_tag:
        tag_str = m_tag.group(0)
        # Preserve original brackets if they existed
        if "[" in tag_str: f = f.replace(tag_str, "[{gender_tag}]", 1)
        elif "(" in tag_str: f = f.replace(tag_str, "({gender_tag})", 1)
        else: f = f.replace(tag_str, "{gender_tag}", 1)
    else:
        # Also catch [r4r] or r4r
        m_r4r = re.search(r'[\[\(]?\br4r\b[\]\)]?', f, flags=re.IGNORECASE)
        if m_r4r:
            tag_str = m_r4r.group(0)
            if "[" in tag_str: f = f.replace(tag_str, "[{gender_tag}]", 1)
            else: f = f.replace(tag_str, "{gender_tag}", 1)

    # Identifiy City with optionally existing hash
    # Look for known examples first to avoid greediness
    common_ex = ['Orlando', 'Atlanta', 'Boston', 'Chicago', 'Columbus', 'Miami', 'New York', 'NYC', 'Tampa', 'Michigan', 'Detroit']
    loc_found = False
    for ex in common_ex:
        m_ex = re.search(rf'(#\s*)?\b{ex}\b', f, flags=re.IGNORECASE)
        if m_ex:
            prefix = m_ex.group(1) or ""
            f = f.replace(m_ex.group(0), f"{prefix}{{city}}", 1)
            loc_found = True
            break
            
    if not loc_found:
        # Identify City with hash #City (Priority)
        m_hash_city = re.search(r'#\s*([A-Z][a-z]+(?:[A-Z][a-z]+)*)', f)
        if m_hash_city:
            f = f.replace(f"#{m_hash_city.group(1)}", "#{city}", 1)
        else:
            # Identify obvious city/location (Capitalized word between tags/age and dash)
            m_loc = re.search(r'(?:\{age\}|\])\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[-–—:]', f)
            if m_loc:
                f = f.replace(m_loc.group(1), "{city}", 1)
        
    # If there is a dash, everything after is title_text
    if " - " in f:
        parts = f.split(" - ", 1)
        f = f"{parts[0]} - {{title_text}}"
    elif " – " in f: # en dash
        parts = f.split(" – ", 1)
        f = f"{parts[0]} – {{title_text}}"
    elif " : " in f:
        parts = f.split(" : ", 1)
        f = f"{parts[0]} : {{title_text}}"
    
    return f
    
    return f
    
    return f


def _render_title_format(fmt: str, context: dict) -> str:
    """
    Render a title format using TitleFormatter.
    """
    if not fmt:
        return ""

    # Prepare data for TitleFormatter
    # context usually contains: final_age, gender, final_location, city, location, etc.
    
    # city_full / location_full are plain names
    city_full = context.get("city_full") or context.get("final_location") or context.get("city") or context.get("location") or ""
    location_full = context.get("location_full") or context.get("final_location") or context.get("location") or context.get("city") or ""
    
    # city / location in hashtag context (sanitized)
    city_hashtag = sanitize_hashtag_token(city_full)
    location_hashtag = sanitize_hashtag_token(location_full)
    
    # gender_tag handled by caller or default
    gender_tag = context.get("gender") or "M"
    
    rendered = TitleFormatter.render(
        fmt,
        age=str(context.get("final_age") or context.get("age") or ""),
        gender_tag=gender_tag,
        city=city_hashtag,
        city_full=city_full,
        location=location_hashtag,
        location_full=location_full,
        title_text=context.get("title_text", "{title_text}") # Keep placeholder if not provided yet
    )
    
    return rendered


def _build_strict_title(template, rules: str, context: dict, logs: list):
    """
    Priority:
    1) template.title_format (strictest)
    2) first line/example from template.title_example
    3) None (caller can fallback to AI title)
    """
    # title_format may exist in DB even if the doctype JSON in repo doesn't include it yet.
    title_format_raw = _safe_strip_html(getattr(template, "title_format", "") or "")
    if title_format_raw:
        strict = _render_title_format(title_format_raw, context)
        safe_log_append(logs, f"Strict title built from title_format: {strict[:120]}")
        return strict

    title_example_raw = _safe_strip_html(getattr(template, "title_example", "") or "")
    examples = _parse_title_examples(title_example_raw)
    if examples:
        # Try to infer format from literal example if no placeholders present
        fmt = extract_format_from_example(examples[0])
        strict = _render_title_format(fmt, context)
        safe_log_append(logs, f"Strict title built from first title_example (inferred fmt: {fmt}): {strict[:120]}")
        return strict

    # Fallback: sometimes rules contains "Title: ...."
    try:
        m_title = re.search(r'(?im)^\s*title\s*:\s*(.+)\s*$', rules or "")
        if m_title:
            strict = _render_title_format(_safe_strip_html(m_title.group(1) or ""), context)
            if strict:
                safe_log_append(logs, f"Strict title built from rules Title: line: {strict[:120]}")
                return strict
    except Exception:
        pass

    return None

def extract_location_from_subreddit(subreddit_name):
    """
    Витягує назву міста/локації з назви сабредіту.
    Покращена версія: коректно обробляє NJ_Lifestyle, Floridar4r, OrlandoSex
    """
    if not subreddit_name:
        return None
    
    # 1. Strip r/ prefix
    sub = re.sub(r'^r/', '', subreddit_name, flags=re.IGNORECASE).strip()
    
    # 2. Strip trailing noise (digits, underscores, etc.) repeatedly
    while sub and (sub[-1].isdigit() or sub[-1] in '_- '):
        sub = sub[:-1]
    
    # 3. Strip common suffixes - INCLUDING middle patterns like "r4r"
    suffixes = [
        'r4r', 'personals', 'meetups?', 'meetings?', 'dating', 'hookups?', 'hookup', 'sex', 'gw', 
        'gonewild', 'hotties', 'sluts', 'baddies', 'nsfw', 'casual', 'singles', 
        'only', 'encounters', 'personals', 'girls', 'boys', 'milf', 'hotties',
        'lifestyle', 'dirty', 'naughty', 'kinky', 'adult', 'xxx'
    ]
    
    # Create pattern that matches suffixes at the end OR preceded by underscore/hyphen
    suffix_pattern = re.compile(f"([_-])?({'|'.join(suffixes)})$", re.IGNORECASE)
    
    # Repeatedly strip suffixes
    max_iterations = 10
    iteration = 0
    while iteration < max_iterations:
        new_sub = suffix_pattern.sub('', sub).strip()
        if new_sub == sub or not new_sub:
            break
        sub = new_sub
        # Re-strip trailing noise
        while sub and sub[-1] in '_- ':
            sub = sub[:-1]
        iteration += 1

    if not sub:
        return None
    
    known_cities = {
        "newhaven": "New Haven",
        "newyork": "New York",
        "losangeles": "Los Angeles",
        "sanfrancisco": "San Francisco",
        "newjersey": "New Jersey",
        "northcarolina": "North Carolina",
        "southcarolina": "South Carolina",
        "nyc": "NYC",
        "ct": "CT",
        "nj": "NJ",
        "va": "VA",
        "md": "MD",
        "ga": "GA",
        "tx": "Texas",
        "ca": "California",
        "mi": "Michigan",
        "fl": "Florida",
        "fla": "Florida",
    }
    
    sub_lower = sub.lower()
    if sub_lower in known_cities:
        return known_cities[sub_lower]
    
    # Splitting into words by camel case and punctuation
    sub_for_split = sub.replace('_', ' ').replace('-', ' ').strip()
    words = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?=[A-Z\s]|$)', sub_for_split)
    
    if words:
        raw_combined = "".join(words).upper()
        if raw_combined in ["NYC", "CT", "NJ", "VA", "MD", "GA", "TX", "CA", "MI", "FL"]:
            return raw_combined
            
        if len(words) > 1:
            return ' '.join(word.capitalize() for word in words)
    
    if sub.islower() and len(sub) > 4:
        if len(sub) <= 7:
            return sub.capitalize()
        else:
            # Better CamelCase detection for lowercase strings
            # Try to find known multi-word patterns
            known_parts = ["newyork", "sanfrancisco", "losangeles", "northcarolina", "southcarolina", "westvirginia"]
            for kp in known_parts:
                if kp in sub.lower():
                    # This is just an example, the real logic should be more robust
                    pass
            return sub.capitalize()
    
    final_sub = sub.strip()
    if final_sub.upper() in ["NYC", "CT", "NJ", "VA", "MD", "GA", "TX", "CA", "MI", "FL"]:
        return final_sub.upper()

    return final_sub.capitalize()

def log_error_safe(title, logs, err):
    """Log error without raising secondary errors. Completely skip logging to avoid cascading errors."""
    pass

def safe_log_append(logs, message):
    """Safely append message to logs list."""
    try:
        if logs is not None and isinstance(logs, list):
            logs.append(str(message))
    except Exception:
        pass  # Ignore any errors

@frappe.whitelist()
def generate_post_from_template(template_name, account_name=None, agent_name=None):
    """
    Генерує та створює новий документ Reddit Post (викликається з кнопки на шаблоні або через API)
    """
    # Ініціалізуємо logs як список
    logs = []
    
    # Переконаємося, що frappe.local.response ініціалізований
    try:
        if not hasattr(frappe, 'local') or frappe.local is None:
            frappe.local = frappe._dict()
        if not hasattr(frappe.local, 'response') or getattr(frappe.local, 'response', None) is None:
            frappe.local.response = frappe._dict()
    except Exception:
        pass  # Ігноруємо помилки ініціалізації
    
    try:
        # 1. Перевірка шаблону
        if not frappe.db.exists("Subreddit Template", template_name):
            frappe.throw(f"Template '{template_name}' not found")
        safe_log_append(logs, f"Template found: {template_name}")
        
        template = frappe.get_doc("Subreddit Template", template_name)
        safe_log_append(logs, f"Subreddit: {template.sub}, Group: {template.group}")

        # 2. ОТРИМАННЯ API KEY З DOCTYPE "KEYS"
        key_doc_name = frappe.db.get_value("Keys", {}, "name")
        if not key_doc_name:
            frappe.throw("No 'Keys' record found. Please create one.")
        safe_log_append(logs, "Keys document found")
            
        api_key = frappe.get_doc("Keys", key_doc_name).get_password("api_key")
        
        if not api_key:
             frappe.throw("The API Key field is empty in the 'Keys' document.")
        safe_log_append(logs, "API key retrieved")

        client = OpenAI(api_key=api_key)

        # 3. Визначення акаунту
        if account_name:
            if not frappe.db.exists("Reddit Account", account_name):
                frappe.throw(f"Account '{account_name}' not found")
            account_doc = frappe.get_doc("Reddit Account", account_name)
        else:
            account_value = frappe.db.get_value("Reddit Account", {"status": "Active", "is_posting_paused": 0}, "name")
            if not account_value:
                account_value = frappe.db.get_value("Reddit Account", {}, "name")
            if not account_value:
                frappe.throw("No Reddit Account found in system to assign to this post.")
            account_doc = frappe.get_doc("Reddit Account", account_value)
    
        for _field in ("account_description", "posting_style", "assistant_name", "assistant_age", 
                      "assistant_profession", "assistant_location", "custom_prompt_instructions", 
                      "status", "is_posting_paused", "username"):
            if not hasattr(account_doc, _field):
                if _field == "assistant_age":
                    setattr(account_doc, _field, None)
                elif _field in ("is_posting_paused",):
                    setattr(account_doc, _field, False)
                elif _field == "status":
                    setattr(account_doc, _field, "Inactive")
                else:
                    setattr(account_doc, _field, "")
        
        # Тепер безпечно перевіряємо статус
        if account_doc.status != "Active" or account_doc.is_posting_paused:
            account_name_str = getattr(account_doc, "name", "Unknown")
            frappe.throw(f"Account '{account_name_str}' is inactive or paused.")
        
        if account_name:
            safe_log_append(logs, f"Account fixed by input: {account_doc.name}")
        else:
            safe_log_append(logs, f"Account auto-selected: {account_doc.name}")
        
        # Безпечно отримуємо username
        account_username = account_doc.username

        # 4. Agent Data Extraction
        agent_display_name = agent_name
        if not agent_display_name:
            if hasattr(account_doc, "assistant_name") and account_doc.assistant_name:
                agent_display_name = str(account_doc.assistant_name).strip()
            else:
                agent_display_name = account_username or "Unknown"
        
        if not agent_display_name or not isinstance(agent_display_name, str):
            agent_display_name = str(account_username) if account_username else "Unknown"
        
        agent_age = None
        if hasattr(account_doc, "assistant_age") and account_doc.assistant_age is not None:
            try:
                agent_age = int(account_doc.assistant_age)
            except (ValueError, TypeError):
                agent_age = None
        
        agent_profession = ""
        if hasattr(account_doc, "assistant_profession") and account_doc.assistant_profession:
            agent_profession = str(account_doc.assistant_profession).strip()
        
        agent_location_raw = ""
        if hasattr(account_doc, "assistant_location") and account_doc.assistant_location:
            agent_location_raw = str(account_doc.assistant_location).strip()
        
        custom_instructions_raw = ""
        if hasattr(account_doc, "custom_prompt_instructions") and account_doc.custom_prompt_instructions:
            custom_instructions_raw = str(account_doc.custom_prompt_instructions).strip()
        
        try:
            agent_custom_instructions = strip_html(custom_instructions_raw) if custom_instructions_raw else ""
        except Exception:
            agent_custom_instructions = str(custom_instructions_raw) if custom_instructions_raw else ""
        
        agent_location = None
        if agent_location_raw and isinstance(agent_location_raw, str) and agent_location_raw.lower() == "dynamic":
            agent_location = extract_location_from_subreddit(template.sub)
            safe_log_append(logs, f"Location extracted from subreddit '{template.sub}': {agent_location}")
        elif agent_location_raw:
            agent_location = str(agent_location_raw)  
        
        final_age = str(agent_age) if agent_age is not None else "28"
        final_location = str(agent_location) if agent_location else "New Haven"
        final_profession = str(agent_profession) if agent_profession else "photographer"
        final_name = str(agent_display_name) if agent_display_name else (str(account_username) if account_username else "Unknown")

        agent_info_block = f"Name: {final_name}\nAge: {final_age}\nProfession: {final_profession}\nLocation: {final_location}"
        if agent_custom_instructions:
            agent_info_block += f"\nCustom Instructions: {agent_custom_instructions}"

        subreddit_lower = template.sub.lower()
        r4r_keywords = ["r4r", "personals", "gone wild", "gonewild", "gw", "nsfw", "hookup", "dating", "meetup", "casual"]
        is_r4r = any(k in subreddit_lower for k in r4r_keywords) or any(k in (template.group or "").lower() for k in r4r_keywords)
        location_hashtag = sanitize_hashtag_token(final_location)

        # 5. Gender Inference
        inferred_gender = "F"
        full_gender_tag = "F4M"
        try:
            hint_src = f"{template.title_format or ''} {template.title_example or ''} {template.title_prompt or ''}"
            m = re.search(r'\[?([FMfm])4([FMfmAa])\]?', hint_src)
            if m:
                inferred_gender = m.group(1).upper()
                full_gender_tag = f"{inferred_gender}4{m.group(2).upper()}"
            else:
                m2 = re.search(r'\[([FMfm])\]', hint_src)
                if m2:
                    inferred_gender = m2.group(1).upper()
                    full_gender_tag = inferred_gender
        except Exception: pass
        
        gender_tag = full_gender_tag if (is_r4r or "4" in full_gender_tag) else inferred_gender

        def pre_replace(text):
            if not text: return ""
            t = str(text).replace("{age}", final_age).replace("[age]", final_age).replace("[Age]", final_age)
            t = t.replace("{city}", final_location).replace("[city]", final_location).replace("[City]", final_location)
            t = t.replace("#{city}", f"#{location_hashtag}").replace("{gender_tag}", gender_tag).replace("[gender]", gender_tag).replace("[Gender]", gender_tag)
            return t

        instructions = pre_replace(_safe_strip_html(template.prompt) or "Create viral content.")
        rules = pre_replace(_safe_strip_html(template.rules) or "No specific rules.")
        exclusions = pre_replace(template.body_exclusion_words or "")

        # 6. Writing Rules
        try:
            bracket_hint = f"{template.title_prompt or ''}\n{template.title_example or ''}\n{rules}".strip()
            allow_brackets = bool(re.search(r'\[[^\]]+\]', bracket_hint)) or is_r4r
        except Exception:
            allow_brackets = bool(is_r4r)
        
        bracket_rule = "Square brackets [] are ONLY allowed for gender tags (e.g. [F4M]). NEVER use placeholder brackets." if allow_brackets else "NEVER use square brackets [like this] in the post."

        title_ctx = {
            "final_age": final_age, "age": final_age,
            "final_location": final_location, "location": final_location, "city": final_location,
            "final_profession": final_profession, "profession": final_profession,
            "name": final_name, "gender": gender_tag, "subreddit": template.sub,
        }

        strict_title = _build_strict_title(template, rules, title_ctx, logs)
        if is_r4r and not strict_title:
            strict_title = f"{final_age} [{gender_tag}] #{location_hashtag} - {{title_text}}"

        dynamic_example = ""
        if strict_title:
            dynamic_example = strict_title.replace("{title_text}", "Looking for connection")
            for k, v in title_ctx.items():
                if isinstance(v, str): dynamic_example = dynamic_example.replace(f"{{{k}}}", v)
        else:
            dynamic_example = f"{final_age} [{gender_tag}] #{location_hashtag} - Looking for connection"

        system_content = f"Expert Reddit Post Assistant. Embody persona:\n{agent_info_block}\nRULE: {bracket_rule}\nWrite natural sentences, NO placeholders."
        
        fixed_title_hint = ""
        if strict_title:
            if "{title_text}" in strict_title:
                fixed_title_hint = f"\nREQUIRED FORMAT: {strict_title}\nONLY generate content for the {{title_text}} part."
            else:
                fixed_title_hint = f"\nUSE EXACT TITLE: {strict_title}"

        user_message_content = f"Generate post for r/{template.sub}:\n\nPROMPT: {instructions}\nRULES: {rules}\n{fixed_title_hint}\n\nEXAMPLE CORRECT TITLE: \"{dynamic_example}\"\nWrite now."

        json_schema = {
            "name": "reddit_post_response",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "title": { "type": "string", "description": "Title" },
                    "post_type": { "type": "string", "enum": ["Text", "Link"] },
                    "url_to_share": { "type": "string", "description": "URL" },
                    "content": { "type": "string", "description": "Body" },
                    "hashtags": { "type": "string", "description": "Hashtags" }
                },
                "required": ["title", "post_type", "url_to_share", "content", "hashtags"],
                "additionalProperties": False
            }
        }
        
        completion = client.chat.completions.create(
            model="gpt-4o-2024-08-06",
            messages=[
                {
                    "role": "system", 
                    "content": system_content 
                },
                {
                    "role": "user", 
                    "content": user_message_content
                }
            ],
            response_format={
                "type": "json_schema",
                "json_schema": json_schema
            }
        )

        if not completion or not completion.choices or len(completion.choices) == 0:
            frappe.throw("No response from OpenAI")
        
        response_content = completion.choices[0].message.content
        if not response_content:
            frappe.throw("Empty response from OpenAI")
        
        # Validate response is not corrupted before parsing
        def is_corrupted_text(text):
            """Detect obviously corrupted text with random character sequences"""
            if not text or len(text) < 20:
                return False
            # Check for excessive punctuation or random character patterns
            punct_ratio = len([c for c in text if not c.isalnum() and not c.isspace()]) / len(text)
            if punct_ratio > 0.4:  # More than 40% non-alphanumeric
                return True
            # Check for random character sequences (low vowel ratio)
            alpha_chars = [c for c in text.lower() if c.isalpha()]
            if alpha_chars:
                vowel_ratio = len([c for c in alpha_chars if c in 'aeiou']) / len(alpha_chars)
                if vowel_ratio < 0.15:  # Less than 15% vowels suggests corruption
                    return True
            return False
        
        if is_corrupted_text(response_content):
            safe_log_append(logs, f"ERROR: Detected corrupted OpenAI response: {response_content[:200]}")
            frappe.throw("OpenAI returned corrupted response. Please try again.")
        
        try:
            ai_response = json.loads(response_content)
        except json.JSONDecodeError as e:
            safe_log_append(logs, f"JSON Parse Error: {str(e)}")
            safe_log_append(logs, f"Response preview: {response_content[:500]}")
            frappe.throw(f"Invalid JSON response from OpenAI: {str(e)}")
        
        if not isinstance(ai_response, dict):
            frappe.throw("Invalid response format from OpenAI")
        
        # Validate individual fields for corruption
        for field in ['title', 'content']:
            if field in ai_response and is_corrupted_text(ai_response.get(field, "")):
                safe_log_append(logs, f"ERROR: Corrupted {field}: {ai_response[field][:200]}")
                frappe.throw(f"OpenAI returned corrupted {field}. Please try again.")
        
        safe_log_append(logs, "OpenAI response received and validated")
        
        title = ai_response.get("title", "") or ""
        content = ai_response.get("content", "") or ""
        
        if not isinstance(title, str):
            title = str(title) if title else ""
        if not isinstance(content, str):
            content = str(content) if content else ""
        
        safe_final_age = str(final_age) if final_age else "28"
        safe_final_location = str(final_location) if final_location else "New Haven"
        safe_final_profession = str(final_profession) if final_profession else "photographer"
        

        placeholder_replacements = {
            r'\[Age\]': safe_final_age,
            r'\[age\]': safe_final_age,
            r'\[AGE\]': safe_final_age,
            r'\[Gender\]': f"[{gender_tag}]",
            r'\[gender\]': f"[{gender_tag}]",
            r'\[GENDER\]': f"[{gender_tag}]",
            r'\[City\]': safe_final_location,
            r'\[city\]': safe_final_location,
            r'\[CITY\]': safe_final_location,
            r'\[City name\]': safe_final_location,
            r'\[city name\]': safe_final_location,
            r'\[Location\]': safe_final_location,
            r'\[location\]': safe_final_location,
            r'\[LOCATION\]': safe_final_location,
            r'\[describe interests\]': safe_final_profession,
            r'\[specific interests\]': safe_final_profession,
            r'\[list limits\]': 'Respectful boundaries',
            r'\[mention your availability\]': 'Available evenings and weekends',
            r'\[mention availability\]': 'Available evenings and weekends',
        }
        
        original_title = title
        original_content = content
        
        try:
            # 1. Standard replacements
            for pattern, replacement in placeholder_replacements.items():
                if title:
                    title = re.sub(pattern, str(replacement), title, flags=re.IGNORECASE)
                if content:
                    content = re.sub(pattern, str(replacement), content, flags=re.IGNORECASE)
            
            # 2. Specific curly brace/hashtag placeholders (leaked from hints)
            # Handle both literal {city} and leaked results like #{CityName} or {CityName}
            if title:
                title = title.replace("{age}", safe_final_age)
                title = title.replace("{gender_tag}", gender_tag)
                title = title.replace("{city}", safe_final_location)
                title = title.replace("{location}", safe_final_location)
                title = re.sub(r'#\s*\{' + re.escape(safe_final_location) + r'\}', f"#{location_hashtag}", title, flags=re.IGNORECASE)
                title = re.sub(r'\{' + re.escape(safe_final_location) + r'\}', safe_final_location, title, flags=re.IGNORECASE)
                
                if is_r4r:
                    title = re.sub(r'\[r4r\]', f"[{gender_tag}]", title, flags=re.IGNORECASE)
                    title = re.sub(r'\(r4r\)', f"({gender_tag})", title, flags=re.IGNORECASE)

                if safe_final_location:
                    title = title.replace(f"{{{safe_final_location}}}", safe_final_location)
                    title = title.replace(f"{{#{safe_final_location}}}", f"#{location_hashtag}")
            
            if content:
                content = content.replace("{age}", safe_final_age)
                content = content.replace("{gender_tag}", gender_tag)
                content = content.replace("{city}", safe_final_location)
                content = content.replace("{location}", safe_final_location)
                content = re.sub(r'#\s*\{' + re.escape(safe_final_location) + r'\}', f"#{location_hashtag}", content, flags=re.IGNORECASE)
                content = re.sub(r'\{' + re.escape(safe_final_location) + r'\}', safe_final_location, content, flags=re.IGNORECASE)

            # Final cleanup:
            # placeholder_leak_re now catches {title_text}, etc.
            placeholder_leak_re = r'[\{\[]\s*(?:age|gender|city|location|connection type|kind of connection|type of connection|connection|describe interests|specific interests|list limits|mention your availability|mention availability|title_text)[^\]\}]*[\}\]]'
            
            if title:
                if allow_square_brackets:
                    # Strip placeholders, keep [F4M]
                    title = re.sub(placeholder_leak_re, '', title, flags=re.IGNORECASE)
                    # Also strip ANY curly braces left over as they are NEVER valid in final output
                    title = re.sub(r'\{.*?\}', '', title)
                else:
                    # Strip any generic brackets if not allowed
                    title = re.sub(r'\[.*?\]', '', title)
                    title = re.sub(r'\{.*?\}', '', title)
            
            if content:
                if allow_square_brackets:
                    content = re.sub(placeholder_leak_re, '', content, flags=re.IGNORECASE)
                    content = re.sub(r'\{.*?\}', '', content)
                else:
                    content = re.sub(r'\[.*?\]', '', content)
                    content = re.sub(r'\{.*?\}', '', content)

            # Heuristic enforcement of title format based on template hints.
            # If a template requires a tag like [F4M]/[M4F] and/or an age token, and the model omitted it,
            # we prepend it to the title to satisfy subreddit rules.
            try:
                hint_src = f"{getattr(template, 'title_prompt', '') or ''}\n{getattr(template, 'title_example', '') or ''}\n{rules or ''}"

                # Detect partner-tag tokens from examples/rules.
                tag = None
                m_tag = re.search(r'\[([A-Za-z]{1,3}4[A-Za-z]{1,3})\]', hint_src, flags=re.IGNORECASE)
                if m_tag:
                    tag = (m_tag.group(1) or "").upper()
                else:
                    m_tag2 = re.search(r'\b([A-Za-z]{1,3}4[A-Za-z]{1,3})\b', hint_src, flags=re.IGNORECASE)
                    if m_tag2:
                        tag = (m_tag2.group(1) or "").upper()

                requires_age = bool(re.search(r'\[(?:age|AGE|Age)\]', hint_src)) or bool(
                    re.search(r'(?im)^\s*title\s*:\s*.*\bage\b', hint_src)
                )
                has_age = bool(re.search(r'\b\d{2}\b', title or ""))

                needs_tag = False
                if allow_square_brackets and tag:
                    tag_re = re.compile(rf'(\[{re.escape(tag)}\]|\b{re.escape(tag)}\b)', flags=re.IGNORECASE)
                    needs_tag = not bool(tag_re.search(title or ""))

                prefix_parts = []
                if requires_age and not has_age:
                    prefix_parts.append(safe_final_age)
                if needs_tag and tag:
                    prefix_parts.append(f"[{tag}]")

                if prefix_parts:
                    title = f"{' '.join(prefix_parts)} {title}".strip()
            except Exception:
                pass

            # Strict override: if template defines title_format/title_example, ALWAYS enforce it.
            if strict_title and "{title_text}" in strict_title:
                # AI was instructed to generate ONLY title_text, so use it directly
                if ai_should_generate_only_title_text:
                    extracted_headline = title.strip()
                    safe_log_append(logs, f"AI returned title_text (before cleanup): {extracted_headline[:80]}")
                    
                    # CRITICAL: Even though AI was instructed to generate ONLY title_text,
                    # it sometimes still includes gender tags, age, location - strip them aggressively
                    
                    # Infer gender tag for stripping
                    gender_tag_for_cleanup = "F4M"  # Default
                    try:
                        title_format_source = getattr(template, "title_format", "") or ""
                        gender_match = re.search(r'\[([FMfm])4([FMfmAa])\]', title_format_source)
                        if gender_match:
                            gender_tag_for_cleanup = f"{gender_match.group(1).upper()}4{gender_match.group(2).upper()}"
                    except Exception:
                        pass
                    
                    # Strip gender tags like [F4M], [M4F], (F4M), etc from the beginning
                    extracted_headline = re.sub(r'^\s*[\[\(]?\s*[FMTfmt]{1,3}4[FMfmAa]{1,3}\s*[\]\)]?\s*[-–—:|]*\s*', '', extracted_headline, flags=re.IGNORECASE)
                    
                    # Strip age numbers from the beginning (e.g. "26 Ready..." -> "Ready...")
                    extracted_headline = re.sub(r'^\s*\d{1,2}\s+', '', extracted_headline)
                    
                    # Strip hashtag locations from the beginning (e.g. "#Orlando Ready..." -> "Ready...")
                    extracted_headline = re.sub(r'^\s*#\w+\s*[-–—:|]*\s*', '', extracted_headline)
                    
                    # Strip plain location names if they match (case-insensitive)
                    if final_location:
                        loc_pattern = re.escape(final_location)
                        extracted_headline = re.sub(rf'^\s*{loc_pattern}\s*[-–—:|]*\s*', '', extracted_headline, flags=re.IGNORECASE)
                    
                    # Strip any remaining leading separators
                    extracted_headline = re.sub(r'^\s*[-–—:|]+\s*', '', extracted_headline).strip()
                    
                    safe_log_append(logs, f"Using AI title as title_text (after cleanup): {extracted_headline[:80]}")
                else:
                    # Fallback: extract from full title if AI didn't follow instructions
                    reqs = TitleFormatRequirements.from_template(getattr(template, "title_format", ""))
                    location_hashtag = sanitize_hashtag_token(final_location)
                    
                    # Infer gender tag for extraction
                    gender_tag_for_extraction = "F4M"  # Default
                    try:
                        title_format_source = getattr(template, "title_format", "") or ""
                        gender_match = re.search(r'\[([FMfm])4([FMfmAa])\]', title_format_source)
                        if gender_match:
                            gender_tag_for_extraction = f"{gender_match.group(1).upper()}4{gender_match.group(2).upper()}"
                    except Exception:
                        pass
                    
                    prefix_hint = _render_title_format(getattr(template, "title_format", ""), {
                        "final_age": final_age,
                        "gender": inferred_gender,
                        "final_location": final_location,
                        "location": final_location,
                        "city": final_location,
                        "title_text": "___EXTRACT_HERE___"
                    })
                    prefix_hint = prefix_hint.split("___EXTRACT_HERE___")[0].strip()

                    extracted_headline = TitleFormatter.extract_title_text_from_ai_title(
                        title,
                        final_age=final_age,
                        rendered_gender_tag=gender_tag_for_extraction,
                        location_hashtag=location_hashtag,
                        final_location=final_location,
                        wants_age=reqs.wants_age,
                        wants_location=reqs.wants_any_location,
                        prefix_to_strip=prefix_hint
                    )
                    safe_log_append(logs, f"Extracted title_text from AI response: {extracted_headline[:80]}")

                # Re-render with the extracted headline using deduplicated context
                title = _render_title_format(getattr(template, "title_format", "") or getattr(template, "title_example", ""), {
                    "final_age": final_age,
                    "gender": inferred_gender,
                    "final_location": final_location,
                    "location": final_location,
                    "city": final_location,
                    "location_full": final_location,
                    "city_full": final_location,
                    "title_text": extracted_headline
                })
                safe_log_append(logs, f"Final formatted title: {title[:120]}")
                
        except Exception as e:
            safe_log_append(logs, f"Error during TitleFormatter integration: {str(e)}")
        
        if title != original_title or content != original_content:
            safe_log_append(logs, f"WARNING: Placeholders or duplicate prefixes resolved in AI response")
            safe_log_append(logs, f"Original title: {original_title[:100]}")
            safe_log_append(logs, f"Fixed title: {title[:100]}")
            
        if isinstance(ai_response, dict):
            ai_response["title"] = title
            ai_response["content"] = content
        else:
            safe_log_append(logs, f"ERROR: ai_response is not a dict, cannot update")

        safe_log_append(logs, "Creating Reddit Post doc")
        subreddit_name = template.sub.strip()
        if not subreddit_name.startswith("r/"):
            subreddit_name = f"r/{subreddit_name}"
        safe_log_append(logs, f"Subreddit name for post: {subreddit_name}")
        
        new_post = frappe.get_doc({
            "doctype": "Reddit Post",
            "title": ai_response.get("title"),
            "post_type": ai_response.get("post_type"),
            "url_to_share": ai_response.get("url_to_share"),
            "body_text": ai_response.get("content"),
            "hashtags": ai_response.get("hashtags"),
            "subreddit_name": subreddit_name,
            "subreddit_group": template.group,
            "account": account_doc.name,
            "account_username": account_username or "Unknown",
            "status": "Created",
            "template_used": template.name
        })
        
        new_post.insert(ignore_permissions=True)
        safe_log_append(logs, f"Reddit Post created: {new_post.name}")
        
        return {
            "status": "success",
            "post_name": new_post.name,
            "logs": logs
        }

    except AttributeError as e:
        log_error_safe("generate_post_from_template", logs, e)
        raise
    except Exception as e:
        log_error_safe("generate_post_from_template", logs, e)
        raise


@frappe.whitelist()
def generate_post_for_agent(agent_name):
    """
    API-метод: повертає новий Reddit Post для вказаного агента.
    """
    logs = []
    
    try:
        resp = getattr(frappe, "local", None)
        if resp is None:
            resp = frappe._dict()
            frappe.local = resp
        
        if not hasattr(resp, "response") or resp.response is None:
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

    account_name = frappe.db.get_value(
        "Reddit Account", {"assistant_name": agent_name}, "name"
    )
    if not account_name:
        account_name = frappe.db.get_value(
            "Reddit Account", {"username": agent_name}, "name"
        )
    if not account_name:
        frappe.throw(f"No Reddit Account found for agent '{agent_name}'.")
    
    safe_log_append(logs, f"Account resolved: {account_name}")

    account_doc = frappe.get_doc("Reddit Account", account_name)

    for _field in ("account_description", "posting_style", "assistant_name", "assistant_age", 
                  "assistant_profession", "assistant_location", "custom_prompt_instructions", 
                  "subreddit_group", "status", "is_posting_paused", "username"):
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
        f"Last posted in group: {last_posted_at} (post: {last_post_name})"
        if last_posted_at
        else "No posted items found in this group yet"
    )

    # 3. Вибираємо шаблон по групі з найстарішим використанням
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
        frappe.throw(
            f"No active Subreddit Template found for group '{subreddit_group}'."
        )

    template_name = template_row[0]["name"]
    safe_log_append(logs, f"Template selected: {template_name}")

    try:
        result = generate_post_from_template(
            template_name, account_name=account_doc.name, agent_name=agent_name
        )
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
                    "last_region_post": {
                        "name": last_post_name,
                        "posted_at": last_posted_at,
                    },
                    "logs": logs if logs is not None and isinstance(logs, list) else [],
                }
            )
        else:
            result = {
                "agent_account": account_doc.name,
                "agent_name": agent_name,
                "subreddit_group": subreddit_group,
                "template_used": template_name,
                "last_region_post": {
                    "name": last_post_name,
                    "posted_at": last_posted_at,
                },
                "logs": logs if logs is not None and isinstance(logs, list) else [],
            }
    except Exception as e:
        result = {
            "agent_account": account_doc.name,
            "agent_name": agent_name,
            "subreddit_group": subreddit_group,
            "template_used": template_name,
            "last_region_post": {
                "name": last_post_name,
                "posted_at": last_posted_at,
            },
            "logs": logs if logs is not None and isinstance(logs, list) else [],
        }
    
    return result