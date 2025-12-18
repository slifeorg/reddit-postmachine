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
    
    sub = subreddit_name.replace("r/", "").replace("R/", "").strip()
    
    sub = re.sub(r'(r4r|personals|meetup|dating|hookup)$', '', sub, flags=re.IGNORECASE)
    sub = sub.strip()
    
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
    }
    
    sub_lower = sub.lower()
    if sub_lower in known_cities:
        return known_cities[sub_lower]
    
    words = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?=[A-Z]|$)', sub)
    
    if words and len(words) > 1:
        location = ' '.join(word.capitalize() for word in words)
        return location
 
    if sub.islower() and len(sub) > 4:
        if len(sub) <= 6:
            return sub.capitalize()
        else:
            mid_point = len(sub) // 2
            for i in range(max(3, mid_point - 2), min(len(sub) - 2, mid_point + 3)):
                part1 = sub[:i].capitalize()
                part2 = sub[i:].capitalize()
                if len(part1) >= 3 and len(part2) >= 3:
                    return f"{part1} {part2}"
    
    # Якщо не вдалося розділити, просто капіталізуємо першу літеру
    return sub.capitalize()

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

        # 4. Підготовка промпта (User Message)
        instructions = strip_html(template.prompt) if template.prompt else "Create viral content."
        rules = strip_html(template.rules) if template.rules else "No specific rules."
        exclusions = template.body_exclusion_words if template.body_exclusion_words else ""
    
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
        
        custom_instructions_raw = ""
        if hasattr(account_doc, "custom_prompt_instructions") and account_doc.custom_prompt_instructions:
            custom_instructions_raw = str(account_doc.custom_prompt_instructions).strip()
        
        try:
            agent_custom_instructions = strip_html(custom_instructions_raw) if custom_instructions_raw else ""
        except Exception:
            agent_custom_instructions = str(custom_instructions_raw) if custom_instructions_raw else ""
        
        safe_log_append(logs, f"Raw agent data from DB - assistant_name: {getattr(account_doc, 'assistant_name', 'NOT FOUND')}, assistant_age: {getattr(account_doc, 'assistant_age', 'NOT FOUND')}, assistant_profession: {getattr(account_doc, 'assistant_profession', 'NOT FOUND')}, assistant_location: {getattr(account_doc, 'assistant_location', 'NOT FOUND')}")
        
        agent_location = None
        # Спочатку перевіряємо поле location з шаблону
        template_location = getattr(template, "location", None) if hasattr(template, "location") else None
        if template_location and isinstance(template_location, str) and template_location.strip():
            if template_location.lower() == "dynamic":
                # Використовуємо template.sub з документа шаблону для визначення локації
                if hasattr(template, "sub") and template.sub:
                    agent_location = extract_location_from_subreddit(template.sub)
                    safe_log_append(logs, f"Location extracted from subreddit '{template.sub}' (template.location='dynamic'): {agent_location}")
                else:
                    safe_log_append(logs, f"WARNING: template.sub is empty, cannot extract location dynamically")
            else:
                agent_location = str(template_location).strip()
                safe_log_append(logs, f"Location from template: {agent_location}")
        # Якщо в шаблоні не встановлено, використовуємо значення з акаунту
        elif agent_location_raw and isinstance(agent_location_raw, str) and agent_location_raw.lower() == "dynamic":
            agent_location = extract_location_from_subreddit(template.sub)
            safe_log_append(logs, f"Location extracted from subreddit '{template.sub}' (account.location='dynamic'): {agent_location}")
        elif agent_location_raw:
            agent_location = str(agent_location_raw)  
        
        safe_log_append(logs, f"Agent data - Name: {agent_display_name}, Age: {agent_age}, Profession: {agent_profession}, Location: {agent_location}")
        
        agent_info_lines = []
        
        try:
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
                    pass  
        
        if not isinstance(agent_info_lines, list) or len(agent_info_lines) == 0:
            agent_info_lines = ["Agent information not available"]
        
        agent_info_block = "\n".join(agent_info_lines)
        if instructions is None:
            instructions = ""
        
        # Логуємо інформацію про агента для дебагу
        safe_log_append(logs, f"Agent info block: {agent_info_block}")
        safe_log_append(logs, f"Agent location (raw): {agent_location_raw}, Agent location (final): {agent_location}")
        safe_log_append(logs, f"Agent age: {agent_age}, Agent profession: {agent_profession}")

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
        
        # --- 1. ПІДГОТОВКА ФІНАЛЬНИХ ЗНАЧЕНЬ ---
        final_age = str(agent_age) if agent_age is not None else "25"
        final_location = str(agent_location) if agent_location else "New Haven"
        final_profession = str(agent_profession) if agent_profession else "photographer"
        final_name = str(agent_display_name) if agent_display_name else (str(account_username) if account_username else "Unknown")
        
        # Отримуємо стиль, якщо він є в акаунті
        agent_style = getattr(account_doc, "posting_style", "Casual and authentic")
        
        # Підготовлюємо city для title (без пробілів та спеціальних символів для хештегу)
        city_for_title = re.sub(r'[^a-zA-Z0-9]', '', final_location)
        if not city_for_title:
            city_for_title = "City"  # Fallback якщо локація порожня
        
        # Отримуємо gender tag з шаблону
        gender_tag_raw = None
        
        # Спосіб 1: через template.get() (найнадійніший)
        try:
            gender_tag_raw = template.get("gender_tag")
        except Exception:
            pass
        
        # Спосіб 2: через getattr
        if not gender_tag_raw and hasattr(template, "gender_tag"):
            gender_tag_raw = getattr(template, "gender_tag", None)
        
        # Спосіб 3: через DB
        if not gender_tag_raw:
            try:
                gender_tag_raw = frappe.db.get_value("Subreddit Template", template.name, "gender_tag")
            except Exception:
                pass
        
        # Дефолт
        if not gender_tag_raw or not str(gender_tag_raw).strip():
            gender_tag_raw = "[r4r]"
        else:
            gender_tag_raw = str(gender_tag_raw).strip()
        
        safe_log_append(logs, f"Gender tag from template: '{gender_tag_raw}' (template name: {template.name})")
        
        # Отримуємо title_example з шаблону (для визначення формату, якщо title_format не вказано)
        # Спробуємо кілька способів отримання поля
        title_examples_str = None
        
        # Спосіб 1: через template.get() (найнадійніший для Frappe документів)
        try:
            title_examples_str = template.get("title_example")
        except Exception:
            pass
        
        # Спосіб 2: через getattr
        if not title_examples_str and hasattr(template, "title_example"):
            try:
                title_examples_str = getattr(template, "title_example", None)
            except Exception:
                pass
        
        # Спосіб 3: через пряме звернення до атрибута
        if not title_examples_str and hasattr(template, "__dict__"):
            try:
                title_examples_str = template.__dict__.get("title_example", None)
            except Exception:
                pass
        
        # Спосіб 4: через frappe.db.get_value (якщо інші не спрацювали)
        if not title_examples_str:
            try:
                title_examples_str = frappe.db.get_value("Subreddit Template", template.name, "title_example")
            except Exception as e:
                safe_log_append(logs, f"Could not get title_example from DB: {str(e)}")
        
        # Конвертуємо в рядок, якщо потрібно
        if title_examples_str is None:
            title_examples_str = ""
        elif not isinstance(title_examples_str, str):
            title_examples_str = str(title_examples_str)
        
        safe_log_append(logs, f"Raw title_example from template (length: {len(title_examples_str)}): '{title_examples_str[:200] if title_examples_str else 'EMPTY'}'")
        
        title_examples_list = []
        if title_examples_str and title_examples_str.strip():
            # Розділяємо по рядках та очищаємо
            title_examples_list = [ex.strip() for ex in title_examples_str.split("\n") if ex.strip()]
            safe_log_append(logs, f"Successfully parsed {len(title_examples_list)} title examples: {title_examples_list[:3]}")
        else:
            safe_log_append(logs, f"WARNING: title_example is empty or not found in template. Template name: {template.name}, Has attr: {hasattr(template, 'title_example')}")
        
        # Отримуємо формат title з шаблону (якщо вказано)
        # ПРИКЛАДИ ВИКОРИСТАННЯ title_format для різних типів сабредітів:
        # Тип 1 (класичний R4R): "{age} [{gender_tag}] {location} - {title_text}"
        #    Результат: "25 [F4M] New York - Looking for fun"
        # Тип 2 (з хештегами): "{age} [r4r] #{city} - {title_text}"
        #    Результат: "30 [r4r] #Jacksonville - Seeking friends"
        # Тип 3 (без дужок, великі літери): "{age} R4R {location} {title_text}"
        #    Результат: "22 R4R Riverside looking for friends"
        # Тип 4 (круглі дужки): "({age}) {gender_tag} - {title_text} [{location}]"
        #    Результат: "(25) F4M - Looking for fun [New York]"
        title_format_template = getattr(template, "title_format", None) if hasattr(template, "title_format") else None
        title_format_from_template = title_format_template and title_format_template.strip()
        
        if not title_format_template or not title_format_template.strip():
            # Якщо title_format не вказано, намагаємося визначити з title_example
            if title_examples_list:
                # Беремо перший приклад і намагаємося визначити формат
                first_example = title_examples_list[0]
                safe_log_append(logs, f"title_format not specified, trying to infer from example: {first_example}")
                # Простий парсинг: замінюємо числа на {age}, локації на {location}, решту на {title_text}
                inferred_format = first_example
                # Замінюємо числа на початку на {age}
                inferred_format = re.sub(r'^\d+\s+', '{age} ', inferred_format)
                # Замінюємо R4R, F4M, M4F тощо на {gender_tag}
                inferred_format = re.sub(r'\b(R4R|r4r|F4M|M4F|F4F|M4M|F4A|M4A|F4MF|M4MF)\b', '{gender_tag}', inferred_format, flags=re.IGNORECASE)
                # Замінюємо локації (великі слова після gender_tag) на {location}
                # Це простий підхід, можна покращити
                if '{location}' not in inferred_format:
                    # Шукаємо слово після gender_tag
                    inferred_format = re.sub(r'\{gender_tag\}\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', r'{gender_tag} {location}', inferred_format, count=1)
                # Решту замінюємо на {title_text}
                if '{title_text}' not in inferred_format:
                    # Знаходимо де починається опис (після локації або дефісу)
                    parts = inferred_format.split(' - ', 1)
                    if len(parts) == 2:
                        inferred_format = parts[0] + ' - {title_text}'
                    else:
                        # Якщо немає дефісу, додаємо {title_text} в кінці
                        if '{location}' in inferred_format:
                            inferred_format = inferred_format.replace('{location}', '{location} {title_text}', 1)
                        else:
                            inferred_format += ' {title_text}'
                
                title_format_template = inferred_format
                safe_log_append(logs, f"Inferred title_format: {title_format_template}")
            else:
                # Дефолтний формат з gender_tag
                title_format_template = "{age} {gender_tag} #{city} - {title_text}"
        
        # Визначаємо, як форматувати gender_tag на основі формату title
        # Аналізуємо title_format_template, щоб визначити потрібний формат
        gender_tag = gender_tag_raw
        
        # Перевіряємо формат дужок у title_format_template
        has_square_brackets = "[" in title_format_template and "]" in title_format_template
        has_round_brackets = "(" in title_format_template and ")" in title_format_template
        has_uppercase_r4r = "R4R" in title_format_template.upper() and "r4r" not in title_format_template.lower()
        
        # Форматуємо gender_tag відповідно до вимог формату
        if "{gender_tag}" in title_format_template:
            # Якщо формат вимагає круглі дужки
            if has_round_brackets and not has_square_brackets:
                gender_tag = gender_tag_raw.replace("[", "(").replace("]", ")")
            # Якщо формат вимагає великі літери без дужок
            elif has_uppercase_r4r and not has_square_brackets and not has_round_brackets:
                gender_tag = gender_tag_raw.replace("[", "").replace("]", "").replace("(", "").replace(")", "").upper()
            # Якщо формат вимагає малі літери без дужок
            elif "r4r" in title_format_template.lower() and not has_square_brackets and not has_round_brackets:
                gender_tag = gender_tag_raw.replace("[", "").replace("]", "").replace("(", "").replace(")", "").lower()
            # Інакше використовуємо як є (зазвичай квадратні дужки)
            else:
                gender_tag = gender_tag_raw
        
        # Замінюємо {gender_tag} у форматі, якщо він є
        if "{gender_tag}" in title_format_template:
            title_format_template = title_format_template.replace("{gender_tag}", gender_tag)
        
        # Визначаємо формат локації на основі формату title
        # Якщо формат містить {location} (без хештегу), використовуємо Capitalized формат
        use_location_capitalized = "{location}" in title_format_template or "{location_full}" in title_format_template
        if use_location_capitalized:
            # Форматуємо локацію: перша літера велика, решта малі (Capitalized)
            location_formatted = final_location.title() if final_location else "City"
        else:
            # Використовуємо city без пробілів для хештегу
            location_formatted = city_for_title
        
        # Визначаємо flair на основі вимог шаблону
        selected_flair = None
        requires_flair = getattr(template, "requires_flair", False) if hasattr(template, "requires_flair") else False
        flair_selection_mode = getattr(template, "flair_selection_mode", "none") if hasattr(template, "flair_selection_mode") else "none"
        available_flairs_str = getattr(template, "available_flairs", "") if hasattr(template, "available_flairs") else ""
        
        # Функція для вибору першого доступного flair (крім "No flair")
        def get_first_available_flair(flairs_list):
            """Повертає перший доступний flair, крім 'No flair'"""
            for flair in flairs_list:
                if flair.lower() != "no flair":
                    return flair
            # Якщо всі flair - "No flair", повертаємо перший
            return flairs_list[0] if flairs_list else None
        
        if requires_flair:
            if flair_selection_mode == "auto":
                # Автоматично вибираємо flair на основі локації
                # Але якщо є список available_flairs, спробуємо знайти збіг
                if available_flairs_str:
                    available_flairs_list = [f.strip() for f in available_flairs_str.split("\n") if f.strip()]
                    location_lower = final_location.lower()
                    
                    # Шукаємо точний збіг
                    for flair in available_flairs_list:
                        if flair.lower() == location_lower:
                            selected_flair = flair
                            break
                    
                    # Якщо не знайдено, використовуємо перший доступний
                    if not selected_flair:
                        selected_flair = get_first_available_flair(available_flairs_list)
                        safe_log_append(logs, f"Flair auto-selected (no match found): {selected_flair} (from location: {final_location})")
                    else:
                        safe_log_append(logs, f"Flair auto-selected from location: {selected_flair}")
                else:
                    # Якщо немає списку, використовуємо саму локацію
                    selected_flair = final_location
                    safe_log_append(logs, f"Flair auto-selected from location: {selected_flair}")
                    
            elif flair_selection_mode == "manual" and available_flairs_str:
                # Вибираємо flair зі списку available_flairs
                available_flairs_list = [f.strip() for f in available_flairs_str.split("\n") if f.strip()]
                
                # Покращений пошук flair за локацією
                selected_flair = None
                location_lower = final_location.lower()
                
                # Спочатку шукаємо точний збіг
                for flair in available_flairs_list:
                    if flair.lower() == location_lower:
                        selected_flair = flair
                        break
                
                # Якщо не знайдено, шукаємо частковий збіг (наприклад, OrlandoCasual -> Orlando)
                if not selected_flair:
                    # Видаляємо слова типу "Casual", "R4R" з локації для пошуку
                    location_clean = re.sub(r'\s*(casual|r4r|personals|meetup|dating|hookup)\s*', '', location_lower, flags=re.IGNORECASE)
                    for flair in available_flairs_list:
                        flair_lower = flair.lower()
                        # Перевіряємо чи локація міститься у flair або навпаки
                        if location_clean in flair_lower or flair_lower in location_clean:
                            selected_flair = flair
                            break
                        # Перевіряємо чи є спільні слова
                        location_words = set(location_clean.split())
                        flair_words = set(flair_lower.split())
                        if location_words & flair_words:  # Перетин множин
                            selected_flair = flair
                            break
                
                # Якщо все ще не знайдено, використовуємо перший доступний (але не "No flair")
                if not selected_flair:
                    selected_flair = get_first_available_flair(available_flairs_list)
                    safe_log_append(logs, f"Flair selected (no match found, using first available): {selected_flair} (from location: {final_location})")
                else:
                    safe_log_append(logs, f"Flair selected from available list: {selected_flair} (from location: {final_location})")
                    
            elif requires_flair and available_flairs_str:
                # Якщо requires_flair=True, але mode=none або manual без списку, все одно вибираємо flair
                available_flairs_list = [f.strip() for f in available_flairs_str.split("\n") if f.strip()]
                if available_flairs_list:
                    # Шукаємо за локацією або використовуємо перший доступний
                    selected_flair = None
                    location_lower = final_location.lower()
                    for flair in available_flairs_list:
                        if location_lower in flair.lower() or flair.lower() in location_lower:
                            selected_flair = flair
                            break
                    if not selected_flair:
                        selected_flair = get_first_available_flair(available_flairs_list)
                    safe_log_append(logs, f"Flair auto-selected (required, mode=none): {selected_flair}")
        
        # Якщо flair обов'язковий, але не вибрано - викидаємо помилку
        if requires_flair and not selected_flair:
            frappe.throw(f"Flair is required for subreddit r/{template.sub}, but no flair could be determined. Please configure available_flairs in the template.")
        
        safe_log_append(logs, f"Final Context for AI: Age={final_age}, Loc={final_location}, CityTag={city_for_title}, LocationFormatted={location_formatted}, GenderTag={gender_tag}, Job={final_profession}, TitleFormat={title_format_template}, Flair={selected_flair}")

        # --- 2. SYSTEM CONTENT (СТВОРЮЄМО КОНТЕКСТ І ПРАВИЛА) ---
        system_content = f"""You are a Reddit expert writing AS a specific persona.
Complete immersion is required.

IDENTITY CONTEXT:
- Persona Name: {final_name}
- Age: {final_age}
- Location: {final_location}
- Profession/Hobby: {final_profession}
- Writing Style: {agent_style}"""
        
        if agent_custom_instructions:
            system_content += f"\n- Custom Instructions: {agent_custom_instructions}"
        
        # Формуємо приклад title на основі шаблону
        # Створюємо копію шаблону для форматування (gender_tag вже замінений)
        example_format = title_format_template
        try:
            example_title = example_format.format(
                age=final_age,
                city=city_for_title,
                city_full=final_location,
                location=location_formatted,
                location_full=location_formatted,
                title_text="Looking for fun and connection"
            )
        except KeyError:
            # Якщо є інші плейсхолдери, просто замінюємо основні
            example_title = example_format.replace("{age}", str(final_age))
            example_title = example_title.replace("{city}", city_for_title)
            example_title = example_title.replace("{city_full}", final_location)
            example_title = example_title.replace("{location}", location_formatted)
            example_title = example_title.replace("{location_full}", location_formatted)
            example_title = example_title.replace("{title_text}", "Looking for fun and connection")
        
        # Використовуємо вже отриманий title_examples_list (отримано вище при визначенні формату)
        if title_examples_list:
            safe_log_append(logs, f"Using {len(title_examples_list)} title examples from template for AI instructions")
        
        # Формуємо опис плейсхолдерів для інструкцій
        placeholder_descriptions = []
        if "{age}" in title_format_template:
            placeholder_descriptions.append(f"- {{age}} = {final_age} (use this exact number)")
        if "{city}" in title_format_template:
            placeholder_descriptions.append(f"- {{city}} = {city_for_title} (city name without spaces, for hashtag)")
        if "{city_full}" in title_format_template:
            placeholder_descriptions.append(f"- {{city_full}} = {final_location} (full city name with spaces)")
        if "{location}" in title_format_template or "{location_full}" in title_format_template:
            placeholder_descriptions.append(f"- {{location}} or {{location_full}} = {location_formatted} (location name, Capitalized)")
        if "{title_text}" in title_format_template:
            placeholder_descriptions.append(f"- {{title_text}} = Your engaging title text (5-10 words)")
        
        placeholder_desc_text = "\n".join(placeholder_descriptions) if placeholder_descriptions else f"- Use the exact format shown in the template"
        
        # Формуємо блок з прикладами - ОБОВ'ЯЗКОВО додаємо, якщо вони є
        examples_section = ""
        if title_examples_list:
            examples_text = "\n".join([f"  - {ex}" for ex in title_examples_list[:5]])  # Максимум 5 прикладів
            
            # Аналізуємо приклади для визначення pattern
            example_gender_tags = []
            example_locations = []
            for ex in title_examples_list[:5]:
                # Шукаємо gender tags в прикладах
                gender_match = re.search(r'\[([A-Z]\d+[A-Z]+)\]|\(([A-Z]\d+[A-Z]+)\)|([A-Z]\d+[A-Z]+)', ex)
                if gender_match:
                    tag = gender_match.group(1) or gender_match.group(2) or gender_match.group(3)
                    if tag and tag not in example_gender_tags:
                        example_gender_tags.append(tag)
                
                # Шукаємо локації (після gender tag або після #)
                location_match = re.search(r'#([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)|\[[A-Z]\d+[A-Z]+\]\s+#?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', ex)
                if location_match:
                    loc = location_match.group(1) or location_match.group(2)
                    if loc and loc not in example_locations:
                        example_locations.append(loc)
            
            # Формуємо додаткові інструкції на основі прикладів
            examples_analysis = ""
            if example_gender_tags:
                unique_tags = list(set(example_gender_tags))
                examples_analysis += f"\n- Gender tags used in examples: {', '.join(unique_tags)}"
            if example_locations:
                unique_locs = list(set(example_locations))
                examples_analysis += f"\n- Locations used in examples: {', '.join(unique_locs[:5])}"
            
            examples_section = f"""

REAL EXAMPLES FROM r/{template.sub} (USE THESE AS REFERENCE - THEY SHOW THE EXACT FORMAT REQUIRED):
{examples_text}{examples_analysis}

CRITICAL INSTRUCTIONS:
1. Your title MUST match the EXACT format shown in these examples
2. Use the SAME gender tag format as in the examples (e.g., if examples show [F4M], use [F4M], NOT [r4r])
3. Use the SAME location format as in the examples (e.g., if examples show #Brighton Park, use a specific neighborhood, NOT just #Chicago)
4. Follow the EXACT capitalization, brackets, hashtags, and separators from the examples
5. These examples are REAL approved titles - your title must be indistinguishable from them in format"""
            safe_log_append(logs, f"Added {len(title_examples_list[:5])} real examples to system_content. Gender tags in examples: {example_gender_tags}, Locations: {example_locations[:3]}")
        else:
            safe_log_append(logs, "WARNING: No title_examples found - AI will use only template format")
        
        system_content += f"""

STRICT TITLE INSTRUCTIONS - REDDIT REQUIRED FORMAT:
The Title MUST follow this EXACT format template: "{title_format_template}"

FORMAT EXPLANATION:
{placeholder_desc_text}

GENERATED EXAMPLE: "{example_title}"{examples_section}

CRITICAL - ABSOLUTE REQUIREMENTS:
- Replace {{age}} with {final_age} (exact number, no formatting)
- Replace location placeholders with {location_formatted} (Capitalized, no hashtag)
- Replace city placeholders with {city_for_title} (for hashtag format) or {final_location} (for full name)
- Replace {{title_text}} with your engaging description (5-10 words, plain text only)
- Keep all brackets, hashtags, separators, and capitalization EXACTLY as in the template
- DO NOT add extra brackets, hashtags, or separators that are not in the template
- DO NOT use markdown formatting (**bold**, *italic*, etc.) in the title
- DO NOT change bracket types: if template has [], use []. If (), use (). If none, use none.
- DO NOT add emojis, special characters, or decorative elements
- The title must be plain text that matches the template format EXACTLY

BODY CONTENT RULES:
1. USE REAL VALUES: Instead of placeholders, use "{final_location}" and "{final_profession}".
2. NO BRACKETS in the body text. Do not write [Age] or [City].
3. Make it personal, as if you are {final_name} posting from {final_location}."""
            
        safe_log_append(logs, "Prompt prepared: Account and agent info added to System message and instructions")

        # --- 3. USER MESSAGE (ЗАПИТ НА ГЕНЕРАЦІЮ) ---
        placeholder_replacements = []
        if "{age}" in title_format_template:
            placeholder_replacements.append(f"- {{age}} → {final_age}")
        if "{city}" in title_format_template:
            placeholder_replacements.append(f"- {{city}} → {city_for_title}")
        if "{city_full}" in title_format_template:
            placeholder_replacements.append(f"- {{city_full}} → {final_location}")
        if "{location}" in title_format_template or "{location_full}" in title_format_template:
            placeholder_replacements.append(f"- {{location}} or {{location_full}} → {location_formatted}")
        if "{title_text}" in title_format_template:
            placeholder_replacements.append(f"- {{title_text}} → Your engaging title (5-10 words)")
        
        replacements_text = "\n   ".join(placeholder_replacements) if placeholder_replacements else f"- Follow the exact format shown"
        
        # Формуємо блок з реальними прикладами для user message - ОБОВ'ЯЗКОВО додаємо
        real_examples_section = ""
        if title_examples_list:
            real_examples_text = "\n   ".join([f"- {ex}" for ex in title_examples_list[:5]])  # Показуємо до 5 прикладів
            
            # Витягуємо конкретні приклади gender tags та locations з прикладів
            example_tags = []
            example_locs = []
            for ex in title_examples_list[:5]:
                # Gender tag
                tag_match = re.search(r'\[([A-Z]\d+[A-Z]+)\]|\(([A-Z]\d+[A-Z]+)\)|([A-Z]\d+[A-Z]+)', ex)
                if tag_match:
                    tag = tag_match.group(1) or tag_match.group(2) or tag_match.group(3)
                    if tag and tag not in example_tags:
                        example_tags.append(tag)
                
                # Location (після # або після gender tag)
                loc_match = re.search(r'#([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)|\[[A-Z]\d+[A-Z]+\]\s+#?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', ex)
                if loc_match:
                    loc = loc_match.group(1) or loc_match.group(2)
                    if loc and loc not in example_locs:
                        example_locs.append(loc)
            
            examples_detail = ""
            if example_tags:
                examples_detail += f"\n   - Gender tags in examples: {', '.join(example_tags)}"
            if example_locs:
                examples_detail += f"\n   - Locations in examples: {', '.join(example_locs[:5])}"
            
            real_examples_section = f"""
   
   REAL EXAMPLES FROM r/{template.sub} (REQUIRED FORMAT):
   {real_examples_text}{examples_detail}
   
   CRITICAL REQUIREMENTS - YOUR TITLE MUST:
   1. Use the EXACT gender tag format from examples (e.g., {'[F4M]' if example_tags and 'F4M' in str(example_tags) else '[r4r]'} - NOT [r4r] unless examples show [r4r])
   2. Use a SPECIFIC location/neighborhood from examples format (e.g., {'#Brighton Park' if example_locs and 'Brighton' in str(example_locs) else '#Chicago'} - use neighborhood names, NOT just city name)
   3. Match the EXACT structure: {title_examples_list[0] if title_examples_list else 'age [tag] #location'}
   4. Use the SAME capitalization, brackets, hashtags, and separators
   5. Be indistinguishable from these examples in format
   
   DO NOT use generic [r4r] or generic city names - use what the examples show!"""
            safe_log_append(logs, f"Added {len(title_examples_list[:5])} real examples to user_message_content. Tags: {example_tags}, Locations: {example_locs[:3]}")
        else:
            safe_log_append(logs, "WARNING: No title_examples found for user message")
        
        user_message_content = f"""Generate a Reddit post for r/{template.sub}.

ABSOLUTE REQUIREMENTS:
1. Title MUST follow this EXACT format template: "{title_format_template}"
   Generated example: "{example_title}"{real_examples_section}
   
   Replace placeholders:
   {replacements_text}
   
2. Body content must be natural and use these real details:
   - Your age: {final_age}
   - Your location: {final_location}
   - Your profession: {final_profession}
   
3. Rules from template: {strip_html(template.rules) if template.rules else "None"}
4. Exclusions: {template.body_exclusion_words if template.body_exclusion_words else "None"}"""
        
        if requires_flair and selected_flair:
            user_message_content += f"\n5. Flair requirement: This subreddit requires flair '{selected_flair}' to be set when posting."
        
        user_message_content += f"""

CRITICAL FORMAT REQUIREMENTS - VIOLATION WILL RESULT IN POST REJECTION:
- Title MUST follow the template format EXACTLY: "{title_format_template}"
- Replace all placeholders with actual values (no placeholders should remain)
- Use {location_formatted} for location (Capitalized, no hashtag) if format requires {{location}}
- Use {city_for_title} for city hashtag format if format requires {{city}} or #{{city}}
- DO NOT use markdown formatting (**bold**, *italic*, `code`, etc.) in title or body
- DO NOT add emojis, special Unicode characters, or decorative symbols
- DO NOT change bracket types: if template has [], use []. If (), use (). If none, use none.
- Keep brackets, hashtags, separators, and capitalization EXACTLY as in the template
- The gender tag {gender_tag} is already included in the format - do not change it
- Do not use any square brackets in the body text
- Title must be plain ASCII text only (no markdown, no formatting, no decorations)

IMPORTANT REMINDERS:
- If the format uses round brackets (), do NOT use square brackets []
- If the format uses square brackets [], do NOT use round brackets ()
- If the format has no brackets, do NOT add any brackets
- If the format uses uppercase R4R, do NOT use lowercase r4r
- If the format uses lowercase r4r, do NOT use uppercase R4R
"""

        # --- 4. JSON Schema ---
        example_title_schema = example_title  # Використовуємо вже сформований example_title
        
        json_schema = {
            "name": "reddit_post",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": f"Title following format: {title_format_template}. Example: {example_title_schema}"},
                    "content": {"type": "string", "description": "Body text without brackets"},
                    "hashtags": {"type": "string"},
                    "post_type": {"type": "string", "enum": ["Text", "Link"]},
                    "url_to_share": {"type": "string", "description": "URL if Link type, else empty"}
                },
                "required": ["title", "content", "hashtags", "post_type", "url_to_share"],
                "additionalProperties": False
            }
        }

        # --- 5. ЗАПИТ ДО OPENAI ---
        safe_log_append(logs, f"Sending request to OpenAI with custom title format: {title_format_template}")
        
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
        safe_log_append(logs, "OpenAI response received")

        try:
            ai_response = json.loads(response_content)
        except json.JSONDecodeError:
            frappe.throw("Invalid JSON from OpenAI")

        title = ai_response.get("title", "") or ""
        content = ai_response.get("content", "") or ""

        # --- 6. ОБРОБКА ТА ВАЛІДАЦІЯ TITLE ---
        # Перевіряємо та виправляємо title відповідно до формату шаблону
        
        if title:
            # А. Захищаємо правильні теги з формату (gender_tag та інші)
            # Спочатку захищаємо gender_tag
            title = title.replace(gender_tag, f"___GENDER_TAG___")
            
            # Захищаємо інші можливі теги з формату
            protected_tags = []
            tag_patterns = re.findall(r'\[[^\]]+\]', title_format_template)
            for i, tag in enumerate(tag_patterns):
                if tag != gender_tag:  # gender_tag вже захищений
                    placeholder = f"___PROTECTED_TAG_{i}___"
                    protected_tags.append((placeholder, tag))
                    title = title.replace(tag, placeholder)
            
            # Видаляємо інші дужки (плейсхолдери типу [Age], [City])
            title = re.sub(r'\[.*?\]', '', title)
            
            # Повертаємо захищені теги
            title = title.replace("___GENDER_TAG___", gender_tag)
            for placeholder, tag in protected_tags:
                title = title.replace(placeholder, tag)
            
            # Б. Перевіряємо, чи title відповідає формату шаблону
            # Якщо ні, намагаємося виправити, використовуючи формат шаблону
            try:
                # Спробуємо витягти title_text з відповіді AI
                # Шукаємо текст після останнього роздільника (дефіс, пробіл після локації тощо)
                title_text = None
                
                # Спробуємо знайти title_text після дефісу
                title_text_match = re.search(r'-\s*(.+)$', title)
                if title_text_match:
                    title_text = title_text_match.group(1).strip()
                else:
                    # Спробуємо знайти текст після локації (для форматів типу "Age R4R Location text")
                    # Видаляємо age, gender_tag, location і залишаємо решту
                    temp_title = title
                    temp_title = re.sub(rf'^{re.escape(str(final_age))}\s*', '', temp_title)
                    temp_title = re.sub(rf'{re.escape(gender_tag)}\s*', '', temp_title)
                    temp_title = re.sub(rf'{re.escape(location_formatted)}\s*', '', temp_title, flags=re.IGNORECASE)
                    temp_title = re.sub(rf'{re.escape(final_location)}\s*', '', temp_title, flags=re.IGNORECASE)
                    if temp_title.strip():
                        title_text = temp_title.strip()
                
                if not title_text:
                    # Якщо не вдалося витягти, використовуємо весь title як title_text
                    title_text = title.strip()
                
                # Формуємо title згідно з шаблоном
                try:
                    title = title_format_template.format(
                        age=final_age,
                        city=city_for_title,
                        city_full=final_location,
                        location=location_formatted,
                        location_full=location_formatted,
                        title_text=title_text
                    )
                except KeyError:
                    # Якщо в шаблоні є інші плейсхолдери, просто замінюємо основні
                    title = title_format_template.replace("{age}", str(final_age))
                    title = title.replace("{city}", city_for_title)
                    title = title.replace("{city_full}", final_location)
                    title = title.replace("{location}", location_formatted)
                    title = title.replace("{location_full}", location_formatted)
                    title = title.replace("{title_text}", title_text)
            except Exception as e:
                safe_log_append(logs, f"Warning: Could not format title according to template: {str(e)}")
            
            # В. Очищаємо від markdown форматування та спеціальних символів
            # Видаляємо markdown bold (**text**)
            title = re.sub(r'\*\*(.*?)\*\*', r'\1', title)
            # Видаляємо markdown italic (*text*)
            title = re.sub(r'\*(.*?)\*', r'\1', title)
            # Видаляємо markdown code (`text`)
            title = re.sub(r'`(.*?)`', r'\1', title)
            # Видаляємо markdown links [text](url)
            title = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', title)
            # Видаляємо зайві пробіли
            title = re.sub(r'\s+', ' ', title).strip()
            
            # Перевіряємо, чи title не містить markdown після очищення
            if '**' in title or '*' in title or '`' in title:
                safe_log_append(logs, f"WARNING: Title may still contain markdown after cleaning: {title}")

        if content:
            # В тілі поста видаляємо ВСІ дужки без винятків
            content = re.sub(r'\[.*?\]', '', content).strip()
            # Очищаємо від markdown форматування
            content = re.sub(r'\*\*(.*?)\*\*', r'\1', content)
            content = re.sub(r'\*(.*?)\*', r'\1', content)
            content = re.sub(r'`(.*?)`', r'\1', content)
            content = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', content)
            
        safe_log_append(logs, f"Processed Title: {title}")

        # --- 7. СТВОРЕННЯ ДОКУМЕНТА ---
        safe_log_append(logs, "Creating Reddit Post doc")
        
        subreddit_name = template.sub.strip()
        if not subreddit_name.startswith("r/"):
            subreddit_name = f"r/{subreddit_name}"
            
        new_post = frappe.get_doc({
            "doctype": "Reddit Post",
            "title": title,
            "post_type": ai_response.get("post_type", "Text"),
            "url_to_share": ai_response.get("url_to_share", ""),
            "body_text": content,
            "hashtags": ai_response.get("hashtags", ""),
            "subreddit_name": subreddit_name,
            "subreddit_group": template.group,
            "account": account_doc.name,
            "account_username": account_username or "Unknown",
            "status": "Created",
            "template_used": template.name,
            "flair": selected_flair if selected_flair else ""
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