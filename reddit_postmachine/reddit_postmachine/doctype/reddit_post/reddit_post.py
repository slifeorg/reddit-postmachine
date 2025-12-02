import frappe
from frappe.model.document import Document
from frappe.utils import strip_html
import json
from openai import OpenAI

class RedditPost(Document):
    pass

@frappe.whitelist()
def generate_content_from_template(template_name):
    """
    Генерує контент і повертає JSON для заповнення форми на клієнті.
    """
    try:
        # 1. Перевірка шаблону
        if not template_name:
            frappe.throw("Template is missing.")
        
        template = frappe.get_doc("Subreddit Template", template_name)

        # 2. API Key
        key_doc_name = frappe.db.get_value("Keys", {}, "name")
        if not key_doc_name:
            frappe.throw("No 'Keys' document found.")
        
        api_key_doc = frappe.get_doc("Keys", key_doc_name)
        api_key = api_key_doc.get_password("api_key")
        
        if not api_key:
             frappe.throw("API Key is empty inside 'Keys'.")

        client = OpenAI(api_key=api_key)

        # 3. Підготовка запиту
        instructions = strip_html(template.prompt) if template.prompt else "Create content."
        rules = strip_html(template.rules) if template.rules else ""
        exclusions = template.body_exclusion_words if template.body_exclusion_words else ""
        
        json_schema = {
            "name": "reddit_post_response",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "title": { "type": "string" },
                    "post_type": { "type": "string", "enum": ["Text", "Link"] },
                    "url_to_share": { "type": "string" },
                    "content": { "type": "string" },
                    "hashtags": { "type": "string" }
                },
                "required": ["title", "post_type", "url_to_share", "content", "hashtags"],
                "additionalProperties": False
            }
        }

        # 4. Запит до OpenAI
        completion = client.chat.completions.create(
            model="gpt-4o-2024-08-06",
            messages=[
                {"role": "system", "content": f"Subreddit: r/{template.sub}. Group: {template.group}."},
                {"role": "user", "content": f"Generate post.\nPrompt: {instructions}\nRules: {rules}\nAvoid: {exclusions}"}
            ],
            response_format={
                "type": "json_schema",
                "json_schema": json_schema
            }
        )

        ai_response = json.loads(completion.choices[0].message.content)

        # 5. Пошук акаунту
        # Шукаємо активний, не на паузі
        account = frappe.db.get_value("Reddit Account", {"status": "Active", "is_posting_paused": 0}, "name")
        
        # Якщо немає, будь-який активний
        if not account:
            account = frappe.db.get_value("Reddit Account", {"status": "Active"}, "name")
            
        # Якщо все ще немає, будь-який
        if not account:
            account = frappe.db.get_value("Reddit Account", {}, "name")
        
        # 6. Повернення даних
        return {
            "status": "success",
            "data": {
                "title": ai_response.get("title"),
                "post_type": ai_response.get("post_type"),
                "url_to_share": ai_response.get("url_to_share"),
                "body_text": ai_response.get("content"),
                "hashtags": ai_response.get("hashtags"),
                "subreddit_name": template.sub,
                "subreddit_group": template.group,
                "account": account or "" # Повертаємо пустий рядок, якщо не знайдено, щоб не було помилки JSON
            }
        }

    except Exception as e:
        frappe.log_error(title="Reddit AI Gen Error", message=str(e))
        return {
            "status": "error",
            "error_message": str(e)
        }