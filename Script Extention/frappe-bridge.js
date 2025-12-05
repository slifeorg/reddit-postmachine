console.log("%c[Bridge] 🌉 Reddit Extension Bridge Loaded!", "color: yellow; background: black; font-size: 14px;");

// Слухаємо повідомлення від сторінки (від reddit_post.js)
window.addEventListener("message", (event) => {
    // Безпека: приймаємо повідомлення тільки від свого ж вікна
    if (event.source !== window) return;

    // Перевіряємо, чи це наше повідомлення
    if (event.data.type && event.data.type === "FROM_FRAPPE_TO_EXTENSION") {
        console.log("[Bridge] 📡 Received command from Frappe:", event.data);

        // Пересилаємо повідомлення у фоновий процес розширення (reef.js)
        try {
            chrome.runtime.sendMessage(event.data, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("[Bridge] ❌ Error sending to background:", chrome.runtime.lastError);
                } else {
                    console.log("[Bridge] ✅ Forwarded to Background. Response:", response);
                }
            });
        } catch (err) {
            console.error("[Bridge] ❌ Fatal Error:", err);
        }
    }
});