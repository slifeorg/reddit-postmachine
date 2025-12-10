const REDDIT_HOME_URL = 'https://www.reddit.com/?feed=home';

console.log('%c[Reef] Service Worker Loaded', 'color: magenta; font-weight: bold;');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.groupCollapsed(`%c[Reef] 📩 Received Message: ${request.command || request.action}`, 'color: magenta;');
  console.log('Full Request:', request);
  console.log('Sender:', sender);

  // 1. Обробка команди на виконання дії в Reddit (від Frappe)
  if (request.command === "EXECUTE_REDDIT_ACTION") {
    console.log('%c[Reef] 🚀 Executing Reddit Action...', 'color: lime;');
    
    const subreddit = request.data.subreddit || "u/" + request.data.account_username;
    const cleanSubreddit = subreddit.replace('r/', '').replace('u/', '');
    const redditUrl = `https://www.reddit.com/r/${cleanSubreddit}/submit`;
    
    console.log(`[Reef] Target URL: ${redditUrl}`);

    // Відкриваємо нову вкладку
    chrome.tabs.create({ url: redditUrl, active: true }, (tab) => {
      console.log(`[Reef] Tab created (ID: ${tab.id}). Waiting for load...`);
      
      // Слухаємо завантаження цієї вкладки
      const listener = (tabId, info) => {
        if (tabId === tab.id && info.status === 'complete') {
          console.log(`[Reef] ✅ Tab ${tabId} loaded fully.`);
          
          // Коли вкладка завантажилась, прибираємо слухач
          chrome.tabs.onUpdated.removeListener(listener);
          
          console.log("[Reef] 📦 Sending payload to content script (postm-page.js)...");
          console.log("Payload data:", request.data);
          
          // Відправляємо дані в postm-page.js
          chrome.tabs.sendMessage(tabId, {
            action: request.actionType, // 'create_post' або 'check_stats'
            payload: request.data
          }).then(() => {
             console.log("[Reef] ✅ Message sent to Content Script successfully.");
          }).catch(err => {
             console.error("[Reef] ❌ Error sending message to tab:", err);
          });
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    });

    sendResponse({ status: "Action initiated" });
    console.groupEnd();
    return true;
  }

  // 2. Стандартна перевірка статусу
  const handlers = {
    'GET_SERVICE_STATUS': async (request) => {
       console.log('[Reef] Status requested.');
       return { status: "active", version: chrome.runtime.getManifest().version };
    },
  }

  if (handlers[request.action]) {
    handleAsyncMessage(() => handlers[request.action](request), sendResponse, request.action)
    console.groupEnd();
    return true;
  }

  console.groupEnd();
  return ['GET_SERVICE_STATUS'].includes(request.action);
})

const handleAsyncMessage = async (operation, sendResponse, logContext = '') => {
  try {
    const result = await operation();
    sendResponse(result);
  } catch (error) {
    console.error(`[Reef] ❌ Error in ${logContext}:`, error);
    sendResponse({ error: error.message });
  }
}