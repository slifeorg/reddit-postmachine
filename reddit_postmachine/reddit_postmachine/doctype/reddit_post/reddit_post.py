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
    Використовує ту ж логіку, що й generate_post_from_template.
    """
    # Імпортуємо функцію з subreddit_template
    from reddit_postmachine.reddit_postmachine.doctype.subreddit_template.subreddit_template import generate_post_from_template
    
    logs = []
    try:
        # Викликаємо основну функцію генерації
        result = generate_post_from_template(template_name, account_name=account_name)
        
        if result.get("status") != "success":
            frappe.throw(result.get("message", "Failed to generate post"))
        
        # Отримуємо створений пост
        post_name = result.get("post_name")
        if not post_name:
            frappe.throw("Post was not created")
        
        post = frappe.get_doc("Reddit Post", post_name)
        
        # Формуємо дані для повернення
        data = {
            "title": post.title,
            "post_type": post.post_type,
            "url_to_share": post.url_to_share or "",
            "body_text": post.body_text or "",
            "hashtags": post.hashtags or "",
            "subreddit_name": post.subreddit_name,
            "subreddit_group": post.subreddit_group,
            "account": post.account,
            "account_username": post.account_username or "Unknown",
            "flair": post.flair or "",
        }
        
        # Видаляємо тимчасовий пост, оскільки ми тільки генеруємо контент
        frappe.delete_doc("Reddit Post", post_name, ignore_permissions=True, force=True)
        frappe.db.commit()
        
        logs.extend(result.get("logs", []))
        logs.append("Temporary post deleted after content generation")
        
        return {"status": "success", "data": data, "logs": logs}

    except Exception as e:
        frappe.log_error("\n".join(logs + [f"generate_content_from_template error: {str(e)}"]))
        return {"status": "error", "error_message": str(e), "logs": logs}