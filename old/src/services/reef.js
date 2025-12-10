/**
 * Reef.js - Background and Network Services
 * Handles service worker functionality, network requests, and tab management
 */

class ReefService {
  constructor() {
    this.name = 'Reef Service';
    this.version = this.getManifestVersion();
    this.activeConnections = new Map();
    
    this.init();
  }

  // ==================== INITIALIZATION ====================
  
  init() {
    this.log('Service Worker Loaded', 'magenta', true);
    this.setupMessageHandlers();
    this.setupTabHandlers();
  }

  getManifestVersion() {
    try {
      return chrome.runtime.getManifest().version;
    } catch (error) {
      return '1.0.0';
    }
  }

  // ==================== LOGGING UTILITIES ====================
  
  log(message, color = 'blue', bold = false) {
    const style = `color: ${color}; ${bold ? 'font-weight: bold;' : ''}`;
    console.log(`%c[Reef] ${message}`, style);
  }

  logGroup(title, color = 'magenta') {
    console.groupCollapsed(`%c[Reef] ${title}`, `color: ${color};`);
  }

  logGroupEnd() {
    console.groupEnd();
  }

  // ==================== MESSAGE HANDLERS ====================
  
  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.logGroup(`📩 Received Message: ${request.command || request.action}`);
      this.log(`Full Request: ${JSON.stringify(request, null, 2)}`);
      this.log(`Sender: ${JSON.stringify(sender, null, 2)}`);

      try {
        return this.routeMessage(request, sender, sendResponse);
      } catch (error) {
        this.log(`❌ Error processing message: ${error.message}`, 'red');
        sendResponse({ error: error.message });
        this.logGroupEnd();
        return false;
      }
    });
  }

  routeMessage(request, sender, sendResponse) {
    const command = request.command || request.action;
    
    switch (command) {
      case 'EXECUTE_REDDIT_ACTION':
        return this.handleRedditAction(request, sender, sendResponse);
        
      case 'GET_SERVICE_STATUS':
        return this.handleStatusRequest(request, sender, sendResponse);
        
      default:
        this.log(`⚠️ Unknown command: ${command}`, 'orange');
        sendResponse({ error: `Unknown command: ${command}` });
        this.logGroupEnd();
        return false;
    }
  }

  // ==================== REDDIT ACTION HANDLERS ====================
  
  handleRedditAction(request, sender, sendResponse) {
    this.log('🚀 Executing Reddit Action...', 'lime');
    
    const { data, actionType } = request;
    const targetUrl = this.buildRedditUrl(data);
    
    this.log(`Target URL: ${targetUrl}`);
    
    this.createTabForRedditAction(targetUrl, actionType, data)
      .then(() => {
        sendResponse({ status: 'Action initiated' });
        this.logGroupEnd();
      })
      .catch(error => {
        this.log(`❌ Error creating tab: ${error.message}`, 'red');
        sendResponse({ error: error.message });
        this.logGroupEnd();
      });
      
    return true;
  }

  buildRedditUrl(data) {
    const { subreddit, account_username } = data;
    const targetSubreddit = subreddit || `u/${account_username}`;
    const cleanSubreddit = targetSubreddit.replace(/^[ru]\//, '');
    
    return `https://www.reddit.com/r/${cleanSubreddit}/submit`;
  }

  async createTabForRedditAction(url, actionType, data) {
    return new Promise((resolve, reject) => {
      chrome.tabs.create({ url, active: true }, (tab) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        this.log(`Tab created (ID: ${tab.id}). Waiting for load...`);
        this.waitForTabComplete(tab.id, actionType, data)
          .then(resolve)
          .catch(reject);
      });
    });
  }

  async waitForTabComplete(tabId, actionType, data) {
    return new Promise((resolve, reject) => {
      const listener = (changedTabId, changeInfo) => {
        if (changedTabId === tabId && changeInfo.status === 'complete') {
          this.log(`✅ Tab ${changedTabId} loaded fully.`);
          
          chrome.tabs.onUpdated.removeListener(listener);
          
          this.sendMessageToTab(tabId, actionType, data)
            .then(resolve)
            .catch(reject);
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener);
        reject(new Error('Tab load timeout'));
      }, 30000);
    });
  }

  async sendMessageToTab(tabId, actionType, data) {
    this.log('📦 Sending payload to content script...');
    this.log(`Payload data: ${JSON.stringify(data, null, 2)}`);
    
    const message = {
      action: actionType,
      payload: data
    };

    try {
      await chrome.tabs.sendMessage(tabId, message);
      this.log('✅ Message sent to Content Script successfully.', 'green');
    } catch (error) {
      this.log(`❌ Error sending message to tab: ${error.message}`, 'red');
      throw error;
    }
  }

  // ==================== STATUS HANDLERS ====================
  
  handleStatusRequest(request, sender, sendResponse) {
    this.log('Status requested.');
    
    const status = {
      status: 'active',
      version: this.version,
      name: this.name,
      timestamp: new Date().toISOString(),
      activeConnections: this.activeConnections.size
    };
    
    sendResponse(status);
    this.logGroupEnd();
    return true;
  }

  // ==================== TAB MANAGEMENT ====================
  
  setupTabHandlers() {
    chrome.tabs.onCreated.addListener((tab) => {
      this.log(`Tab created: ${tab.id}`);
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
      this.log(`Tab removed: ${tabId}`);
      this.activeConnections.delete(tabId);
    });
  }

  // ==================== UTILITY METHODS ====================
  
  async handleAsyncMessage(operation, sendResponse, logContext = '') {
    try {
      const result = await operation();
      sendResponse(result);
    } catch (error) {
      this.log(`❌ Error in ${logContext}: ${error.message}`, 'red');
      sendResponse({ error: error.message });
    }
  }
}

// Initialize the service
const reefService = new ReefService();

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReefService;
}