import frappe
from frappe.model.document import Document
from frappe.utils import strip_html
import json
from openai import OpenAI

class SubredditTemplate(Document):
    pass

@frappe.whitelist()
def generate_post_from_template(template_name):
    try:
        if not frappe.db.exists("Subreddit Template", template_name):
            frappe.throw(f"Template '{template_name}' not found")
        
        template = frappe.get_doc("Subreddit Template", template_name)

        api_key = "API KEY HERE"
        
        client = OpenAI(api_key=api_key)

        instructions = strip_html(template.gpt_instructions) if template.gpt_instructions else "Create viral content."
        rules = strip_html(template.posting_rules) if template.posting_rules else "No specific rules."
        
        json_schema = {
            "name": "reddit_post_response",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Engaging title for the Reddit post"
                    },
                    "post_type": {
                        "type": "string",
                        "enum": ["Text", "Link"],
                        "description": "Must be 'Link' if sharing a URL, otherwise 'Text'"
                    },
                    "url_to_share": {
                        "type": "string",
                        "description": "Valid URL (e.g. Youtube) if post_type is Link. Empty string if Text."
                    },
                    "content": {
                        "type": "string",
                        "description": "Body text or hashtags."
                    }
                },
                "required": ["title", "post_type", "url_to_share", "content"],
                "additionalProperties": False
            }
        }

        completion = client.chat.completions.create(
            model="gpt-4o-2024-08-06", # Використовуємо модель, що підтримує Structured Outputs
            messages=[
                {
                    "role": "system", 
                    "content": f"You are a Reddit expert managing r/{template.subreddit_name}. Group: {template.group}."
                },
                {
                    "role": "user", 
                    "content": f"Generate a post based on these instructions:\n{instructions}\n\nRules:\n{rules}"
                }
            ],
            response_format={
                "type": "json_schema",
                "json_schema": json_schema
            }
        )

        ai_response = json.loads(completion.choices[0].message.content)

        account = frappe.db.get_value("Reddit Account", {"enabled": 1}, "name")
        if not account:
            account = frappe.db.get_value("Reddit Account", {}, "name")
        
        if not account:
            frappe.throw("No Reddit Account found in system to assign to this post.")

        account_username = frappe.db.get_value("Reddit Account", account, "username")

        new_post = frappe.get_doc({
            "doctype": "Reddit Post",
            "title": ai_response.get("title"),
            "post_type": ai_response.get("post_type"),
            "url_to_share": ai_response.get("url_to_share"),
            "body_text": ai_response.get("content"), # Якщо AI повертає все в 'content'
            "hashtags": "", # Або налаштуйте AI, щоб він повертав hashtags окремо
            "subreddit_name": template.subreddit_name,
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