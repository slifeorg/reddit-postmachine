import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime, get_datetime
import praw
import time
import json
from frappe.utils import strip_html
from openai import OpenAI

class RedditPost(Document):
    def after_insert(self):
        self.update_template_stats()

    def update_template_stats(self):
        if self.template_used:
            frappe.db.sql("""
                UPDATE `tabSubreddit Template`
                SET usage_count = usage_count + 1, last_used = NOW()
                WHERE name = %s
            """, (self.template_used,))

@frappe.whitelist()
def execute_smart_post_via_api(post_name):
    """
    Розумна публікація через API:
    1. Перевіряє агента (Account).
    2. Перевіряє історію постів агента (щоб не спамив).
    3. Перевіряє активність у сабредіті (щоб не постити в переповнений саб).
    4. Публікує пост.
    """
    logs = []
    try:
        # --- 1. ПІДГОТОВКА ТА ПЕРЕВІРКА АГЕНТА ---
        post = frappe.get_doc("Reddit Post", post_name)
        if post.status == "Posted":
            return {"status": "error", "message": "Already posted"}

        account = frappe.get_doc("Reddit Account", post.account)
        
        # Розшифровуємо паролі
        client_secret = account.get_password("client_secret")
        reddit_password = account.get_password("password")

        if not (account.client_id and client_secret and account.username and reddit_password):
            frappe.throw("Account credentials missing (Client ID/Secret/Password)")

        # Авторизація в PRAW
        reddit = praw.Reddit(
            client_id=account.client_id,
            client_secret=client_secret,
            username=account.username,
            password=reddit_password,
            user_agent=f"FrappeBot/1.0 (u/{account.username})"
        )
        
        # Перевірка: Хто я?
        me = reddit.user.me()
        logs.append(f"👤 Authenticated as: {me.name}")

        # --- 2. ПЕРЕВІРКА ІСТОРІЇ АГЕНТА (Agent Checks) ---
        # Отримуємо останні 5 постів агента
        my_recent_posts = list(me.submissions.new(limit=5))
        
        if my_recent_posts:
            last_post_time = my_recent_posts[0].created_utc
            time_since_last = time.time() - last_post_time
            
            logs.append(f"⏱️ Time since last post by agent: {int(time_since_last/60)} minutes")

            # Правило: Не постити частіше ніж раз на 15 хвилин (загалом)
            if time_since_last < (15 * 60): 
                return {
                    "status": "failed", 
                    "message": f"Agent cooldown active. Last post was {int(time_since_last/60)} min ago.",
                    "logs": logs
                }
            
            # Правило: Не постити в ЦЕЙ ЖЕ сабредіт, якщо останній пост був теж туди (менше 24 годин)
            if my_recent_posts[0].subreddit.display_name.lower() == post.subreddit_name.lower():
                if time_since_last < (24 * 60 * 60):
                     return {
                        "status": "failed", 
                        "message": f"Agent already posted in r/{post.subreddit_name} today.",
                        "logs": logs
                    }

        # --- 3. ПЕРЕВІРКА САБРЕДІТА (Subreddit Checks) ---
        subreddit = reddit.subreddit(post.subreddit_name)
        
        # Отримуємо найсвіжіший пост у сабредіті (від будь-кого)
        newest_in_sub = list(subreddit.new(limit=1))
        
        if newest_in_sub:
            last_sub_post_time = newest_in_sub[0].created_utc
            sub_idle_time = time.time() - last_sub_post_time
            
            logs.append(f"🌐 Last post in r/{post.subreddit_name} was {int(sub_idle_time/60)} minutes ago")
            
            # Правило: Якщо в сабредіті хтось запостив менше 5 хвилин тому - чекаємо
            # (Щоб наш пост не загубився і не виглядав як спам-атака)
            if sub_idle_time < (5 * 60):
                return {
                    "status": "failed", 
                    "message": f"Subreddit is too busy. Someone posted {int(sub_idle_time)} sec ago.",
                    "logs": logs
                }

        # --- 4. ДОДАВАННЯ ПОСТА (Execution) ---
        logs.append("🚀 Checks passed. Publishing...")
        
        submission = None
        if post.post_type == "Link":
            submission = subreddit.submit(title=post.title, url=post.url_to_share)
        else:
            submission = subreddit.submit(title=post.title, selftext=post.body_text or "")

        # Збереження результату
        post.status = "Posted"
        post.posted_at = now_datetime()
        post.reddit_post_id = submission.id
        post.reddit_post_url = submission.url
        post.save(ignore_permissions=True)
        frappe.db.commit()

        logs.append(f"✅ Success! URL: {submission.url}")

        return {
            "status": "success",
            "message": "Posted successfully",
            "reddit_url": submission.url,
            "logs": logs
        }

    except Exception as e:
        frappe.log_error(f"Smart Post Error: {str(e)}")
        logs.append(f"❌ Error: {str(e)}")
        return {"status": "error", "message": str(e), "logs": logs}


@frappe.whitelist()
def generate_content_from_template(template_name, account_name=None):
    """
    Генерує контент для Reddit Post без створення документа.
    Використовується з кнопки на формі Reddit Post.
    """
    logs = []
    try:
        # 1. Перевірка шаблону
        if not frappe.db.exists("Subreddit Template", template_name):
            frappe.throw(f"Template '{template_name}' not found")
        template = frappe.get_doc("Subreddit Template", template_name)
        logs.append(f"Template found: {template_name}")

        # 2. Отримання API KEY
        key_doc_name = frappe.db.get_value("Keys", {}, "name")
        if not key_doc_name:
            frappe.throw("No 'Keys' record found. Please create one.")
        api_key = frappe.get_doc("Keys", key_doc_name).get_password("api_key")
        if not api_key:
            frappe.throw("The API Key field is empty in the 'Keys' document.")
        client = OpenAI(api_key=api_key)
        logs.append("API key retrieved")

        # 3. Підготовка промпта
        instructions = strip_html(template.prompt) if template.prompt else "Create viral content."
        rules = strip_html(template.rules) if template.rules else "No specific rules."
        exclusions = template.body_exclusion_words if template.body_exclusion_words else ""
        logs.append("Prompt prepared")

        # 4. JSON Schema
        json_schema = {
            "name": "reddit_post_response",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Engaging title"},
                    "post_type": {"type": "string", "enum": ["Text", "Link"]},
                    "url_to_share": {"type": "string", "description": "URL if Link type, else empty"},
                    "content": {"type": "string", "description": "Body text"},
                    "hashtags": {"type": "string", "description": "Relevant hashtags"},
                },
                "required": ["title", "post_type", "url_to_share", "content", "hashtags"],
                "additionalProperties": False,
            },
        }

        # 5. Виклик OpenAI
        logs.append("Sending request to OpenAI")
        completion = client.chat.completions.create(
            model="gpt-4o-2024-08-06",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a Reddit expert managing r/{template.sub}. Group: {template.group}.",
                },
                {
                    "role": "user",
                    "content": f"Generate a post.\nPrompt: {instructions}\nRules: {rules}\nAvoid: {exclusions}",
                },
            ],
            response_format={"type": "json_schema", "json_schema": json_schema},
        )
        ai_response = json.loads(completion.choices[0].message.content)
        logs.append("OpenAI response received")

        # 6. Визначення акаунта (опційно)
        account_doc = None
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
            if account_value:
                account_doc = frappe.get_doc("Reddit Account", account_value)
                logs.append(f"Account auto-selected: {account_doc.name}")

        account_username = account_doc.username if account_doc else None

        # 7. Повертаємо дані для заповнення форми
        data = {
            "title": ai_response.get("title"),
            "post_type": ai_response.get("post_type"),
            "url_to_share": ai_response.get("url_to_share"),
            "body_text": ai_response.get("content"),
            "hashtags": ai_response.get("hashtags"),
            "subreddit_name": template.sub,
            "subreddit_group": template.group,
            "account": account_doc.name if account_doc else None,
            "account_username": account_username or "Unknown",
        }

        return {"status": "success", "data": data, "logs": logs}

    except Exception as e:
        frappe.log_error("\n".join(logs + [f"generate_content_from_template error: {str(e)}"]))
        return {"status": "error", "error_message": str(e), "logs": logs}