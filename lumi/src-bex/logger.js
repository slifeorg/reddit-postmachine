// Simple logger for browser extension context scripts
class ExtensionLogger {
  constructor(prefix = '') {
    this.prefix = prefix;
    this.debugEnabled = true; // Set to true for debugging
  }

  async checkDebugSetting() {
    try {
      // Check if debug mode is enabled in storage
      const result = await chrome.storage.local.get(['debugMode']);
      this.debugEnabled = result.debugMode || false;
    } catch (error) {
      // If storage is not available, keep current setting
    }
  }

  log(...args) {
    if (this.debugEnabled) {
      console.log(this.prefix, ...args);
    }
  }

  info(...args) {
    if (this.debugEnabled) {
      console.info(this.prefix, ...args);
    }
  }

  warn(...args) {
    // Always show warnings
    console.warn(this.prefix, ...args);
  }

  error(...args) {
    // Always show errors
    console.error(this.prefix, ...args);
  }

  debug(...args) {
    if (this.debugEnabled) {
      console.debug(this.prefix, ...args);
    }
  }
}

// Create logger instances for different contexts
export const domLogger = new ExtensionLogger('[DOM Script]');
export const bgLogger = new ExtensionLogger('[BG]');
export const statsLogger = new ExtensionLogger('[Stats]');
export const msgLogger = new ExtensionLogger('[Message]');
export const postServiceLogger = new ExtensionLogger('[PostDataService]');
export const stateLogger = new ExtensionLogger('[AutoFlowStateManager]');
export const contentLogger = new ExtensionLogger('[Content Script]');
export const submitLogger = new ExtensionLogger('[Submit Script]');

// Initialize debug setting for all loggers
const initDebugMode = async () => {
  await Promise.all([
    domLogger.checkDebugSetting(),
    bgLogger.checkDebugSetting(),
    statsLogger.checkDebugSetting(),
    msgLogger.checkDebugSetting(),
    postServiceLogger.checkDebugSetting(),
    stateLogger.checkDebugSetting(),
    contentLogger.checkDebugSetting(),
    submitLogger.checkDebugSetting()
  ]);
};

// Auto-initialize
initDebugMode();
