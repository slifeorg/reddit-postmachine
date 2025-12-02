import frappe
from frappe.model.document import Document
from frappe.utils import strip_html
import json
from openai import OpenAI

class SubredditTemplate(Document):
    pass

@frappe.whitelist()
def generate_post_from_template(template_name):
    """
    Генерує та створює новий документ Reddit Post (викликається з кнопки на шаблоні)
    """
    try:
        # 1. Перевірка шаблону
        if not frappe.db.exists("Subreddit Template", template_name):
            frappe.throw(f"Template '{template_name}' not found")
        
        template = frappe.get_doc("Subreddit Template", template_name)

        # 2. ОТРИМАННЯ API KEY З DOCTYPE "KEYS"
        key_doc_name = frappe.db.get_value("Keys", {}, "name")
        if not key_doc_name:
            frappe.throw("No 'Keys' record found. Please create one.")
            
        api_key = frappe.get_doc("Keys", key_doc_name).get_password("api_key")
        
        if not api_key:
             frappe.throw("The API Key field is empty in the 'Keys' document.")

        client = OpenAI(api_key=api_key)

        # 3. Підготовка промпта
        instructions = strip_html(template.prompt) if template.prompt else "Create viral content."
        rules = strip_html(template.rules) if template.rules else "No specific rules."
        exclusions = template.body_exclusion_words if template.body_exclusion_words else ""
        
        # 4. JSON Schema
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

        # 5. Запит до AI
        completion = client.chat.completions.create(
            model="gpt-4o-2024-08-06",
            messages=[
                {
                    "role": "system", 
                    "content": f"You are a Reddit expert managing r/{template.sub}. Group: {template.group}."
                },
                {
                    "role": "user", 
                    "content": f"Generate a post.\nPrompt: {instructions}\nRules: {rules}\nAvoid: {exclusions}"
                }
            ],
            response_format={
                "type": "json_schema",
                "json_schema": json_schema
            }
        )

        ai_response = json.loads(completion.choices[0].message.content)

        # 6. Пошук акаунту
        account = frappe.db.get_value("Reddit Account", {"status": "Active", "is_posting_paused": 0}, "name")
        if not account:
            account = frappe.db.get_value("Reddit Account", {}, "name")
        
        if not account:
            frappe.throw("No Reddit Account found in system to assign to this post.")

        account_username = frappe.db.get_value("Reddit Account", account, "username")

        # 7. Створення нового поста
        new_post = frappe.get_doc({
            "doctype": "Reddit Post",
            "title": ai_response.get("title"),
            "post_type": ai_response.get("post_type"),
            "url_to_share": ai_response.get("url_to_share"),
            "body_text": ai_response.get("content"),
            "hashtags": ai_response.get("hashtags"),
            "subreddit_name": template.sub,
            "subreddit_group": template.group,
            "account": account,
            "account_username": account_username or "Unknown",
            "status": "Created",
            "template_used": template.name
        })
        
        new_post.insert(ignore_permissions=True)
        
        return {
            "status": "success",
            "post_name": new_post.name
        }

    except Exception as e:
        frappe.log_error(f"OpenAI Error: {str(e)}")
        raise e