/**
 * Frappe Bridge - Content Script for Frappe Integration
 * Handles communication between Frappe and the Chrome extension
 */

class FrappeBridge {
  constructor() {
    this.name = 'Frappe Bridge';
    this.init();
  }

  init() {
    this.log('🌉 Reddit Extension Bridge Loaded!', 'yellow');
    this.setupMessageHandlers();
  }

  log(message, color = 'blue') {
    const style = `color: ${color}; background: black; font-size: 14px; padding: 2px 4px;`;
    console.log(`%c[Bridge] ${message}`, style);
  }

  setupMessageHandlers() {
    window.addEventListener("message", (event) => {
      // Security: only accept messages from the same window
      if (event.source !== window) return;

      // Check if this is our message type
      if (event.data.type && event.data.type === "FROM_FRAPPE_TO_EXTENSION") {
        this.handleFrappeMessage(event.data);
      }
    });
  }

  async handleFrappeMessage(data) {
    this.log(`📡 Received command from Frappe: ${JSON.stringify(data, null, 2)}`);

    try {
      const response = await this.forwardToBackground(data);
      this.log(`✅ Forwarded to Background. Response: ${JSON.stringify(response, null, 2)}`);
      
      // Optionally send response back to Frappe
      this.sendResponseToFrappe(response);
      
    } catch (error) {
      this.log(`❌ Error forwarding message: ${error.message}`, 'red');
      this.sendResponseToFrappe({ error: error.message });
    }
  }

  async forwardToBackground(data) {
    return new Promise((resolve, reject) => {
      if (!chrome.runtime) {
        reject(new Error('Chrome runtime not available'));
        return;
      }

      chrome.runtime.sendMessage(data, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  sendResponseToFrappe(response) {
    // Send response back to Frappe if needed
    window.postMessage({
      type: "FROM_EXTENSION_TO_FRAPPE",
      response: response,
      timestamp: new Date().toISOString()
    }, "*");
  }
}

// Initialize the bridge
new FrappeBridge();