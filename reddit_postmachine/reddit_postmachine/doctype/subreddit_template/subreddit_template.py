import frappe
from frappe.model.document import Document
from frappe.utils import strip_html
import json
import re
from openai import OpenAI

class SubredditTemplate(Document):
    pass

def extract_location_from_subreddit(subreddit_name):
    """
    Витягує назву міста/локації з назви сабредіту.
    Приклади: r/albany -> Albany, r/Ohior4r -> Ohio, r/newhaven -> New Haven, r/newyork -> New York
    """
    if not subreddit_name:
        return None
    
    # Прибираємо префікс r/ якщо є
    sub = subreddit_name.replace("r/", "").replace("R/", "").strip()
    
    # Видаляємо суфікси типу r4r, personals тощо
    sub = re.sub(r'(r4r|personals|meetup|dating|hookup)$', '', sub, flags=re.IGNORECASE)
    sub = sub.strip()
    
    if not sub:
        return None
    
    # Список відомих міст для правильного розділення
    known_cities = {
        "newhaven": "New Haven",
        "newyork": "New York",
        "losangeles": "Los Angeles",
        "sanfrancisco": "San Francisco",
        "newjersey": "New Jersey",
        "northcarolina": "North Carolina",
        "southcarolina": "South Carolina",
    }
    
    # Перевіряємо, чи це відоме місто
    sub_lower = sub.lower()
    if sub_lower in known_cities:
        return known_cities[sub_lower]
    
    # Розділяємо camelCase або слова з великої літери
    words = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?=[A-Z]|$)', sub)
    
    if words and len(words) > 1:
        # Об'єднуємо слова з правильною капіталізацією
        location = ' '.join(word.capitalize() for word in words)
        return location
    
    # Якщо всі літери малі і це одне слово, намагаємося знайти розділення
    # (наприклад, "newhaven" -> "New Haven")
    if sub.islower() and len(sub) > 4:
        # Шукаємо патерни типу "new" + "haven", "los" + "angeles" тощо
        # Простий підхід: розділяємо на слова по довжині
        # Якщо слово довше 6 символів, намагаємося розділити
        if len(sub) <= 6:
            return sub.capitalize()
        else:
            # Спробуємо розділити на дві частини (перші 3-4 символи + решта)
            # Це працює для багатьох міст типу "newhaven", "newyork" тощо
            mid_point = len(sub) // 2
            # Шукаємо найкращу точку розділення (найближчу до середини, але не менше 3 символів)
            for i in range(max(3, mid_point - 2), min(len(sub) - 2, mid_point + 3)):
                part1 = sub[:i].capitalize()
                part2 = sub[i:].capitalize()
                # Перевіряємо, чи виглядає як розумне розділення
                if len(part1) >= 3 and len(part2) >= 3:
                    return f"{part1} {part2}"
    
    # Якщо не вдалося розділити, просто капіталізуємо першу літеру
    return sub.capitalize()

def log_error_safe(title, logs, err):
    """Log error without raising secondary errors. Completely skip logging to avoid cascading errors."""
    # Do nothing - we don't want to risk cascading errors from frappe.log_error
    # The original error will still be raised and handled by the caller
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
        
        # ВАЖЛИВО: Встановлюємо дефолтні значення ОДРАЗУ після отримання account_doc
        # Це запобігає помилкам AttributeError при зверненні до неіснуючих полів
        # Включаємо posting_style, щоб уникнути помилок при серіалізації об'єкта Frappe
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

        # 4. Підготовка промпта (User Message)
        instructions = strip_html(template.prompt) if template.prompt else "Create viral content."
        rules = strip_html(template.rules) if template.rules else "No specific rules."
        exclusions = template.body_exclusion_words if template.body_exclusion_words else ""
        
        # 4.1 Підготовка інформації про агента/персону
        # Безпечно отримуємо всі значення з перевіркою типів
        # Використовуємо прямий доступ до полів з перевіркою
        agent_display_name = agent_name
        if not agent_display_name:
            if hasattr(account_doc, "assistant_name") and account_doc.assistant_name:
                agent_display_name = str(account_doc.assistant_name).strip()
            else:
                agent_display_name = account_username or "Unknown"
        
        if not agent_display_name or not isinstance(agent_display_name, str):
            agent_display_name = str(account_username) if account_username else "Unknown"
        
        # Читаємо age
        agent_age = None
        if hasattr(account_doc, "assistant_age") and account_doc.assistant_age is not None:
            try:
                agent_age = int(account_doc.assistant_age)
            except (ValueError, TypeError):
                agent_age = None
        
        # Читаємо profession
        agent_profession = ""
        if hasattr(account_doc, "assistant_profession") and account_doc.assistant_profession:
            agent_profession = str(account_doc.assistant_profession).strip()
        
        # Читаємо location
        agent_location_raw = ""
        if hasattr(account_doc, "assistant_location") and account_doc.assistant_location:
            agent_location_raw = str(account_doc.assistant_location).strip()
        
        # Читаємо custom instructions
        custom_instructions_raw = ""
        if hasattr(account_doc, "custom_prompt_instructions") and account_doc.custom_prompt_instructions:
            custom_instructions_raw = str(account_doc.custom_prompt_instructions).strip()
        
        try:
            agent_custom_instructions = strip_html(custom_instructions_raw) if custom_instructions_raw else ""
        except Exception:
            agent_custom_instructions = str(custom_instructions_raw) if custom_instructions_raw else ""
        
        # Логуємо прочитані дані для дебагу
        safe_log_append(logs, f"Raw agent data from DB - assistant_name: {getattr(account_doc, 'assistant_name', 'NOT FOUND')}, assistant_age: {getattr(account_doc, 'assistant_age', 'NOT FOUND')}, assistant_profession: {getattr(account_doc, 'assistant_profession', 'NOT FOUND')}, assistant_location: {getattr(account_doc, 'assistant_location', 'NOT FOUND')}")
        
        # Визначення локації: якщо "dynamic", витягуємо з назви сабредіту
        agent_location = None
        # Безпечна перевірка на "dynamic" - переконуємося, що agent_location_raw є рядком
        if agent_location_raw and isinstance(agent_location_raw, str) and agent_location_raw.lower() == "dynamic":
            agent_location = extract_location_from_subreddit(template.sub)
            safe_log_append(logs, f"Location extracted from subreddit '{template.sub}': {agent_location}")
        elif agent_location_raw:
            agent_location = str(agent_location_raw)  # Переконуємося, що це рядок
        
        # Логування даних агента для дебагу (безпечно)
        safe_log_append(logs, f"Agent data - Name: {agent_display_name}, Age: {agent_age}, Profession: {agent_profession}, Location: {agent_location}")
        
        # Формуємо блок інформації про агента для instructions
        agent_info_lines = []
        
        # Безпечно додаємо інформацію про агента
        try:
            # Переконуємося, що всі змінні є рядками або мають значення за замовчуванням
            # Використовуємо безпечні методи для отримання значень
            try:
                safe_display_name = str(agent_display_name) if agent_display_name is not None else "Unknown"
            except (AttributeError, TypeError):
                safe_display_name = "Unknown"
            
            try:
                safe_profession = str(agent_profession) if agent_profession is not None and agent_profession else ""
            except (AttributeError, TypeError):
                safe_profession = ""
            
            try:
                safe_location = str(agent_location) if agent_location is not None else ""
            except (AttributeError, TypeError):
                safe_location = ""
            
            try:
                safe_custom_instructions = str(agent_custom_instructions) if agent_custom_instructions is not None and agent_custom_instructions else ""
            except (AttributeError, TypeError):
                safe_custom_instructions = ""
            
            # Переконуємося, що agent_info_lines є списком
            if not isinstance(agent_info_lines, list):
                agent_info_lines = []
            
            agent_info_lines.append(f"Agent/Persona Name: {safe_display_name}")
            
            if agent_age:
                agent_info_lines.append(f"Age: {agent_age}")
            else:
                agent_info_lines.append("Age: [MUST INVENT A SPECIFIC AGE - use a number like 25, 30, 28, etc. NOT [Age] or placeholder]")
            
            if safe_profession:
                agent_info_lines.append(f"Profession/Hobby: {safe_profession}")
            else:
                agent_info_lines.append("Profession/Hobby: [MUST INVENT A SPECIFIC PROFESSION/HOBBY - use real text like 'software developer', 'yoga instructor', 'photographer', etc. NOT [Profession] or placeholder]")
            
            if safe_location:
                agent_info_lines.append(f"Location/City: {safe_location}")
            else:
                agent_info_lines.append("Location/City: [MUST INVENT A SPECIFIC CITY NAME - use real city name, NOT [City] or placeholder]")
            
            if safe_custom_instructions:
                agent_info_lines.append(f"Custom Instructions: {safe_custom_instructions}")
        except Exception as e:
            # Якщо виникла помилка, створюємо базовий список з мінімальною інформацією
            agent_info_lines = []
            try:
                agent_info_lines.append(f"Agent/Persona Name: {str(agent_display_name) if agent_display_name else 'Unknown'}")
            except Exception:
                agent_info_lines.append("Agent/Persona Name: Unknown")
            
            try:
                agent_info_lines.append(f"Age: {str(agent_age) if agent_age else 'Not specified'}")
            except Exception:
                agent_info_lines.append("Age: Not specified")
            
            try:
                agent_info_lines.append(f"Profession/Hobby: {str(agent_profession) if agent_profession else 'Not specified'}")
            except Exception:
                agent_info_lines.append("Profession/Hobby: Not specified")
            
            try:
                agent_info_lines.append(f"Location/City: {str(agent_location) if agent_location else 'Not specified'}")
            except Exception:
                agent_info_lines.append("Location/City: Not specified")
            
            if agent_custom_instructions:
                try:
                    agent_info_lines.append(f"Custom Instructions: {str(agent_custom_instructions)}")
                except Exception:
                    pass  # Ігноруємо помилки додавання custom instructions
        
        # Переконуємося, що agent_info_lines є списком і не порожній
        if not isinstance(agent_info_lines, list) or len(agent_info_lines) == 0:
            agent_info_lines = ["Agent information not available"]
        
        agent_info_block = "\n".join(agent_info_lines)
        # гарантуємо, що instructions — рядок
        if instructions is None:
            instructions = ""
        
        # Логуємо інформацію про агента для дебагу
        safe_log_append(logs, f"Agent info block: {agent_info_block}")
        safe_log_append(logs, f"Agent location (raw): {agent_location_raw}, Agent location (final): {agent_location}")
        safe_log_append(logs, f"Agent age: {agent_age}, Agent profession: {agent_profession}")
        
        # Додаємо інформацію про агента до instructions з чіткими інструкціями
        # Визначаємо тип поста на основі назви сабредіту
        subreddit_lower = template.sub.lower()
        is_r4r = "r4r" in subreddit_lower or "personals" in subreddit_lower
        
        post_type_context = ""
        if is_r4r:
            post_type_context = "\n\nPOST TYPE: This is an R4R (Redditor 4 Redditor) personal ad post. It MUST include:\n- Your age (use the exact age from AGENT/PERSONA INFORMATION)\n- Your gender/identity\n- What you're looking for (friendship, dating, hookup, etc.)\n- Your location/city (use the exact location from AGENT/PERSONA INFORMATION)\n- Your interests/hobbies (use profession/hobby from AGENT/PERSONA INFORMATION)\n- Your availability\n- Your boundaries/preferences\n\nThis is a PERSONAL AD, not a general discussion post."
        
        instructions = f"""{instructions}

AGENT/PERSONA INFORMATION (USE THESE EXACT VALUES IN THE POST):
{agent_info_block}
{post_type_context}

CRITICAL REQUIREMENTS:
1. You MUST use the actual values provided in AGENT/PERSONA INFORMATION above
2. If a value says "[MUST INVENT...]", you must create a specific, realistic value (like "25" for age, "Miami" for city, "photographer" for profession)
3. NEVER use bracketed placeholders like [Age], [Gender], [City], [Location], [Type of Relationship], [Type of Connection], [insert interests], etc. in the final post
4. Always write natural, complete sentences with real values
5. The post must reflect the persona described above - use their age, location, profession/hobby in the content
6. Make it personal and authentic - write as if you ARE this person"""
        
        # 4.2 Підготовка контексту акаунту (System Message Context)
        # Формуємо явні значення для заміни
        final_age = str(agent_age) if agent_age else "28"
        final_location = agent_location if agent_location else "New Haven"
        final_profession = agent_profession if agent_profession else "photographer"
        final_name = agent_display_name if agent_display_name else account_username
        
        system_content = f"""You are a Reddit expert creating posts for r/{template.sub} (Group: {template.group}).

You are writing AS the persona described below. You must embody this character completely.

IDENTITY CONTEXT:
- Reddit username: {account_username}
- Persona/Character name: {final_name}"""
        
        if agent_age:
            system_content += f"\n- Character age: {agent_age} years old"
        else:
            system_content += f"\n- Character age: {final_age} years old (use this exact value)"
        
        if agent_profession:
            system_content += f"\n- Character profession/hobby: {agent_profession}"
        else:
            system_content += f"\n- Character profession/hobby: {final_profession} (use this exact value)"
        
        if agent_location:
            system_content += f"\n- Character location/city: {agent_location}"
        else:
            system_content += f"\n- Character location/city: {final_location} (use this exact value)"
        
        if agent_custom_instructions:
            system_content += f"\n- Custom writing instructions: {agent_custom_instructions}"
        
        system_content += f"""

CRITICAL RULES - VIOLATION WILL RESULT IN REJECTION:
1. NEVER use ANY text in square brackets [like this] in the title or content
2. NEVER use placeholders like [Age], [Gender], [City], [Location], [Connection Type], [describe interests], [list limits], [mention availability]
3. ALWAYS use REAL VALUES from the IDENTITY CONTEXT above
4. If age is "{final_age}", write "{final_age}" - NOT "[Age]" or "[age]"
5. If location is "{final_location}", write "{final_location}" - NOT "[City]" or "[City name]"
6. If profession is "{final_profession}", write "{final_profession}" - NOT "[Profession]" or "[specific interests]"
7. Write complete, natural sentences with ACTUAL information - no brackets, no placeholders, no templates

IMPORTANT: Write the post AS THIS PERSON. Use their exact age ({final_age}), location ({final_location}), and profession/hobby ({final_profession}). Make it authentic and personal."""
            
        safe_log_append(logs, "Prompt prepared: Account and agent info added to System message and instructions")

        # 5. JSON Schema
        json_schema = {
            "name": "reddit_post_response",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "title": { "type": "string", "description": "Engaging title" },
                    "post_type": { "type": "string", "enum": ["Text", "Link"] },
                    "url_to_share": { "type": "string", "description": "URL if Link type, else empty" },
                    "content": { "type": "string", "description": "Body text" },
                    "hashtags": { "type": "string", "description": "Relevant hashtags" }
                },
                "required": ["title", "post_type", "url_to_share", "content", "hashtags"],
                "additionalProperties": False
            }
        }

        # 6. Запит до AI
        safe_log_append(logs, "Sending request to OpenAI")
        
        # Формуємо детальний user message з явними прикладами та few-shot examples
        # Використовуємо вже визначені final_age, final_location, final_profession, final_name
        
        user_message_content = f"""Generate a Reddit post for r/{template.sub} with the following requirements:

Account username: {account_username or 'Unknown'}

PROMPT/TEMPLATE INSTRUCTIONS:
{instructions}

RULES TO FOLLOW:
{rules}

WORDS TO AVOID:
{exclusions}

ABSOLUTE REQUIREMENTS - VIOLATION WILL RESULT IN REJECTION:

1. FORBIDDEN: Any text in square brackets [like this] is ABSOLUTELY FORBIDDEN in title or content.
   - NEVER write: [Age], [Gender], [City], [Location], [Connection Type], [describe interests], [list limits], [mention availability]
   - NEVER write: [age], [gender], [city], [City name], [Kind of Connection], [specific interests]
   - NEVER write: ANY text between square brackets

2. REQUIRED VALUES TO USE:
   - Age: Use "{final_age}" (exactly this value, NOT "[Age]" or "[age]")
   - Location: Use "{final_location}" (exactly this value, NOT "[City]" or "[City name]")
   - Profession/Hobby: Use "{final_profession}" (exactly this value, NOT "[Profession]" or "[specific interests]")
   - Name: Use "{final_name}" (exactly this value)

3. EXAMPLES OF CORRECT vs INCORRECT:
   CORRECT TITLE: "{final_age}M looking for friendship in {final_location}"
   INCORRECT TITLE: "[Gender][Age] Searching for [Kind of Connection] Nearby [City name]"
   
   CORRECT CONTENT: "Hey! I'm {final_name}, a {final_age}-year-old {final_profession} based in {final_location}."
   INCORRECT CONTENT: "Hey! I'm a [age] [gender] looking to connect..."
   
   CORRECT: "I'm a {final_profession} who loves hiking and coffee shops"
   INCORRECT: "I'm into [specific interests]"
   
   CORRECT: "Available evenings and weekends"
   INCORRECT: "[mention your availability]"

4. Write natural, complete sentences with REAL information - no brackets, no placeholders, no templates.

5. The title and body must be READY TO POST IMMEDIATELY - no editing needed, no placeholders to fill.

6. Use the EXACT values specified above:
   - Age: "{final_age}" (write this number, not "[Age]")
   - Location: "{final_location}" (write this city name, not "[City]")
   - Profession: "{final_profession}" (write this profession, not "[Profession]")

7. Make it personal and authentic - write as if you ARE this person ({final_name}), using their exact details.

REMEMBER: If you use ANY square brackets [like this] in your response, it will be REJECTED. Write ONLY real values, no placeholders."""
        
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

        # Безпечно парсимо відповідь від OpenAI
        try:
            response_content = completion.choices[0].message.content
            if not response_content:
                frappe.throw("Empty response from OpenAI")
            ai_response = json.loads(response_content)
            if not isinstance(ai_response, dict):
                frappe.throw("Invalid response format from OpenAI")
        except (json.JSONDecodeError, KeyError, AttributeError) as e:
            frappe.throw(f"Failed to parse OpenAI response: {str(e)}")
        
        safe_log_append(logs, "OpenAI response received")
        
        # Валідація та автоматична заміна плейсхолдерів
        # Безпечно отримуємо title та content з перевірками
        title = ai_response.get("title") if ai_response else None
        content = ai_response.get("content") if ai_response else None
        
        # Переконуємося, що title та content є рядками
        if title is None:
            title = ""
        if not isinstance(title, str):
            title = str(title) if title else ""
        
        if content is None:
            content = ""
        if not isinstance(content, str):
            content = str(content) if content else ""
        
        # Словник замін плейсхолдерів на реальні значення
        placeholder_replacements = {
            r'\[Age\]': final_age,
            r'\[age\]': final_age,
            r'\[AGE\]': final_age,
            r'\[Gender\]': 'M',  # За замовчуванням, можна змінити
            r'\[gender\]': 'M',
            r'\[GENDER\]': 'M',
            r'\[City\]': final_location,
            r'\[city\]': final_location,
            r'\[CITY\]': final_location,
            r'\[City name\]': final_location,
            r'\[city name\]': final_location,
            r'\[Location\]': final_location,
            r'\[location\]': final_location,
            r'\[LOCATION\]': final_location,
            r'\[Connection Type\]': 'friendship',
            r'\[connection type\]': 'friendship',
            r'\[Kind of Connection\]': 'friendship',
            r'\[kind of connection\]': 'friendship',
            r'\[Type of Connection\]': 'friendship',
            r'\[type of connection\]': 'friendship',
            r'\[describe interests\]': final_profession,
            r'\[specific interests\]': final_profession,
            r'\[list limits\]': 'Respectful boundaries',
            r'\[mention your availability\]': 'Available evenings and weekends',
            r'\[mention availability\]': 'Available evenings and weekends',
        }
        
        # Автоматична заміна плейсхолдерів
        import re
        original_title = title
        original_content = content
        
        # Переконуємося, що final_age, final_location, final_profession є рядками
        safe_final_age = str(final_age) if final_age else "28"
        safe_final_location = str(final_location) if final_location else "New Haven"
        safe_final_profession = str(final_profession) if final_profession else "photographer"
        
        # Оновлюємо словник замін з безпечними значеннями
        placeholder_replacements[r'\[Age\]'] = safe_final_age
        placeholder_replacements[r'\[age\]'] = safe_final_age
        placeholder_replacements[r'\[AGE\]'] = safe_final_age
        placeholder_replacements[r'\[City\]'] = safe_final_location
        placeholder_replacements[r'\[city\]'] = safe_final_location
        placeholder_replacements[r'\[CITY\]'] = safe_final_location
        placeholder_replacements[r'\[City name\]'] = safe_final_location
        placeholder_replacements[r'\[city name\]'] = safe_final_location
        placeholder_replacements[r'\[Location\]'] = safe_final_location
        placeholder_replacements[r'\[location\]'] = safe_final_location
        placeholder_replacements[r'\[LOCATION\]'] = safe_final_location
        placeholder_replacements[r'\[describe interests\]'] = safe_final_profession
        placeholder_replacements[r'\[specific interests\]'] = safe_final_profession
        
        try:
            for pattern, replacement in placeholder_replacements.items():
                if title:
                    title = re.sub(pattern, str(replacement), title, flags=re.IGNORECASE)
                if content:
                    content = re.sub(pattern, str(replacement), content, flags=re.IGNORECASE)
            
            # Замінюємо будь-які інші квадратні дужки на порожній рядок (якщо не знайдено відповідності)
            if title:
                title = re.sub(r'\[.*?\]', '', title)
            if content:
                content = re.sub(r'\[.*?\]', '', content)
        except Exception as e:
            safe_log_append(logs, f"Error during placeholder replacement: {str(e)}")
            # Продовжуємо з оригінальними значеннями
        
        # Оновлюємо відповідь з виправленими значеннями
        if ai_response and isinstance(ai_response, dict):
            if title != original_title or content != original_content:
                safe_log_append(logs, f"WARNING: Placeholders found and replaced in AI response")
                safe_log_append(logs, f"Original title: {original_title[:100] if original_title else 'None'}")
                safe_log_append(logs, f"Fixed title: {title[:100] if title else 'None'}")
            try:
                ai_response["title"] = title
                ai_response["content"] = content
            except Exception as e:
                safe_log_append(logs, f"Error updating ai_response: {str(e)}")
                # Створюємо новий словник, якщо не вдалося оновити
                ai_response = {
                    "title": title,
                    "content": content,
                    "post_type": ai_response.get("post_type", "Text"),
                    "url_to_share": ai_response.get("url_to_share", ""),
                    "hashtags": ai_response.get("hashtags", ""),
                }

        # 7. Створення нового поста
        safe_log_append(logs, "Creating Reddit Post doc")
        # Перевірка що template.sub містить правильну назву сабредіту
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
    
    # Встановлюємо CORS заголовки (обережно, щоб не впасти на None)
    try:
        resp = getattr(frappe, "local", None)
        if resp is None:
            resp = frappe._dict()
            frappe.local = resp
        
        # Безпечно отримуємо або створюємо response_obj
        if not hasattr(resp, "response") or resp.response is None:
            response_obj = frappe._dict()
            try:
                resp.response = response_obj
            except Exception:
                # Якщо не вдалося встановити, просто пропускаємо CORS заголовки
                response_obj = None
        
        if response_obj is not None:
            # Безпечно отримуємо або створюємо headers
            headers = getattr(response_obj, "headers", None)
            if headers is None or not isinstance(headers, dict):
                headers = {}
                try:
                    response_obj.headers = headers
                except Exception:
                    # Якщо не вдалося встановити, просто пропускаємо CORS заголовки
                    headers = None
            
            if headers is not None:
                try:
                    headers["Access-Control-Allow-Origin"] = "*"
                    headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
                    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Frappe-Site-Name"
                    headers["Access-Control-Max-Age"] = "3600"
                except Exception:
                    pass  # Ігноруємо помилки встановлення заголовків
    except Exception as e:
        # Безпечно додаємо до logs
        safe_log_append(logs, f"Warning: Could not set CORS headers: {str(e)}")
    if not agent_name:
        frappe.throw("Agent name is required.")
    
    # Безпечно додаємо до logs
    safe_log_append(logs, f"Agent received: {agent_name}")

    # 1. Знаходимо акаунт агента
    account_name = frappe.db.get_value(
        "Reddit Account", {"assistant_name": agent_name}, "name"
    )
    if not account_name:
        account_name = frappe.db.get_value(
            "Reddit Account", {"username": agent_name}, "name"
        )
    if not account_name:
        frappe.throw(f"No Reddit Account found for agent '{agent_name}'.")
    
    # Безпечно додаємо до logs
    safe_log_append(logs, f"Account resolved: {account_name}")

    account_doc = frappe.get_doc("Reddit Account", account_name)
    
    # ВАЖЛИВО: Встановлюємо дефолтні значення ОДРАЗУ після отримання account_doc
    # Це запобігає помилкам AttributeError при зверненні до неіснуючих полів
    # Включаємо posting_style, щоб уникнути помилок при серіалізації об'єкта Frappe
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
    
    # Безпечно отримуємо subreddit_group
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

    # Безпечно обробляємо result
    if result is None:
        frappe.throw("Failed to generate post from template")
    
    # Переконуємося, що result є словником
    if not isinstance(result, dict):
        frappe.throw("Invalid result from generate_post_from_template")
    
    # Безпечно додаємо logs з result
    try:
        result_logs = result.get("logs", [])
        if result_logs and isinstance(result_logs, list):
            if logs is not None and isinstance(logs, list):
                try:
                    logs.extend(result_logs)
                except Exception:
                    pass  # Ігноруємо помилки extend
    except Exception:
        pass  # Ігноруємо помилки обробки logs
    
    # Безпечно оновлюємо result
    try:
        # Переконуємося, що result є словником перед викликом update
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
            # Якщо result не є словником, створюємо новий словник
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
        # Якщо update не вдався, створюємо новий словник
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