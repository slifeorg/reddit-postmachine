import frappe
from frappe.model.document import Document
from frappe.utils import strip_html
import json
from openai import OpenAI

class SubredditTemplate(Document):
    pass

@frappe.whitelist()
def generate_post_from_template(template_name, account_name=None):
    """
    Генерує та створює новий документ Reddit Post (викликається з кнопки на шаблоні)
    """
    logs = []
    try:
        # 1. Перевірка шаблону
        if not frappe.db.exists("Subreddit Template", template_name):
            frappe.throw(f"Template '{template_name}' not found")
        logs.append(f"Template found: {template_name}")
        
        template = frappe.get_doc("Subreddit Template", template_name)
        logs.append(f"Subreddit: {template.sub}, Group: {template.group}")

        # 2. ОТРИМАННЯ API KEY З DOCTYPE "KEYS"
        key_doc_name = frappe.db.get_value("Keys", {}, "name")
        if not key_doc_name:
            frappe.throw("No 'Keys' record found. Please create one.")
        logs.append("Keys document found")
            
        api_key = frappe.get_doc("Keys", key_doc_name).get_password("api_key")
        
        if not api_key:
             frappe.throw("The API Key field is empty in the 'Keys' document.")
        logs.append("API key retrieved")

        client = OpenAI(api_key=api_key)

        # 3. Підготовка промпта
        instructions = strip_html(template.prompt) if template.prompt else "Create viral content."
        rules = strip_html(template.rules) if template.rules else "No specific rules."
        exclusions = template.body_exclusion_words if template.body_exclusion_words else ""
        logs.append("Prompt prepared for OpenAI")
        
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
        logs.append("Sending request to OpenAI")
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
        logs.append("OpenAI response received")

        # 6. Пошук акаунту
        if account_name:
            if not frappe.db.exists("Reddit Account", account_name):
                frappe.throw(f"Account '{account_name}' not found")
            account_doc = frappe.get_doc("Reddit Account", account_name)
            if account_doc.status != "Active" or account_doc.is_posting_paused:
                frappe.throw(f"Account '{account_name}' is inactive or paused.")
            logs.append(f"Account fixed by input: {account_doc.name}")
        else:
            account_value = frappe.db.get_value("Reddit Account", {"status": "Active", "is_posting_paused": 0}, "name")
            if not account_value:
                account_value = frappe.db.get_value("Reddit Account", {}, "name")
            if not account_value:
                frappe.throw("No Reddit Account found in system to assign to this post.")
            account_doc = frappe.get_doc("Reddit Account", account_value)
            logs.append(f"Account auto-selected: {account_doc.name}")

        account_username = account_doc.username

        # 7. Створення нового поста
        logs.append("Creating Reddit Post doc")
        new_post = frappe.get_doc({
            "doctype": "Reddit Post",
            "title": ai_response.get("title"),
            "post_type": ai_response.get("post_type"),
            "url_to_share": ai_response.get("url_to_share"),
            "body_text": ai_response.get("content"),
            "hashtags": ai_response.get("hashtags"),
            "subreddit_name": template.sub,
            "subreddit_group": template.group,
            "account": account_doc.name,
            "account_username": account_username or "Unknown",
            "status": "Created",
            "template_used": template.name
        })
        
        new_post.insert(ignore_permissions=True)
        logs.append(f"Reddit Post created: {new_post.name}")
        
        return {
            "status": "success",
            "post_name": new_post.name,
            "logs": logs
        }

    except Exception as e:
        frappe.log_error("\n".join(logs + [f"OpenAI Error: {str(e)}"]))
        raise e


@frappe.whitelist()
def generate_post_for_agent(agent_name):
    """
    API-метод: повертає новий Reddit Post для вказаного агента.
    Логіка:
    1. Знаходимо акаунт за ім'ям агента (assistant_name або username).
    2. Беремо його групу (регіон).
    3. Дивимося, коли востаннє у цьому регіоні був запощений пост (status='Posted').
    4. Підбираємо активний шаблон цієї групи, який використовувався найдавніше
       (last_used ASC, usage_count ASC).
    5. Генеруємо пост за цим шаблоном і прив'язуємо до обраного акаунта.
    """
    logs = []
    if not agent_name:
        frappe.throw("Agent name is required.")
    logs.append(f"Agent received: {agent_name}")

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
    logs.append(f"Account resolved: {account_name}")

    account_doc = frappe.get_doc("Reddit Account", account_name)
    if not account_doc.subreddit_group:
        frappe.throw(f"Account '{account_name}' has no subreddit group assigned.")
    logs.append(f"Subreddit group: {account_doc.subreddit_group}")

    last_post_row = frappe.db.sql(
        """
        SELECT name, posted_at
        FROM `tabReddit Post`
        WHERE subreddit_group = %s AND status = 'Posted' AND posted_at IS NOT NULL
        ORDER BY posted_at DESC
        LIMIT 1
        """,
        (account_doc.subreddit_group,),
        as_dict=True,
    )

    last_posted_at = last_post_row[0]["posted_at"] if last_post_row else None
    last_post_name = last_post_row[0]["name"] if last_post_row else None
    logs.append(
        f"Last posted in group: {last_posted_at} (post: {last_post_name})"
        if last_posted_at
        else "No posted items found in this group yet"
    )

    # 3. Вибираємо шаблон по групі з найстарішим використанням
    logs.append("Selecting template by group (oldest last_used, then usage_count)")
    template_row = frappe.db.sql(
        """
        SELECT name
        FROM `tabSubreddit Template`
        WHERE `group` = %s AND is_active = 1
        ORDER BY COALESCE(last_used, '1970-01-01') ASC, usage_count ASC
        LIMIT 1
        """,
        (account_doc.subreddit_group,),
        as_dict=True,
    )

    if not template_row:
        frappe.throw(
            f"No active Subreddit Template found for group '{account_doc.subreddit_group}'."
        )

    template_name = template_row[0]["name"]
    logs.append(f"Template selected: {template_name}")

    try:
        result = generate_post_from_template(template_name, account_name=account_doc.name)
    except Exception as e:
        frappe.log_error("\n".join(logs + [f"generate_post_from_template error: {str(e)}"]))
        raise

    logs.extend(result.get("logs", []))
    result.update(
        {
            "agent_account": account_doc.name,
            "agent_name": agent_name,
            "subreddit_group": account_doc.subreddit_group,
            "template_used": template_name,
            "last_region_post": {
                "name": last_post_name,
                "posted_at": last_posted_at,
            },
            "logs": logs,
        }
    )
    return result