/**
 * Seren Post Machine - Main Worker Process
 * Orchestrates Reddit posting operations and user interactions
 */

class SerenPostMachine {
  constructor() {
    this.name = 'Seren Post Machine';
    this.hasExecuted = false;
    this.currentUser = null;
    this.config = {
      targetSubreddit: 'sphynx',
      defaultTitle: 'Cute sphynx babies capture your heart',
      defaultUrl: 'https://youtube.com/shorts/0xmhrS_VNNY?si=awYc8i5YljycesXq',
      defaultBodyText: '#shorts #sphynx #missmermaid #kitten #cat',
      timeouts: {
        short: 500,
        medium: 1500,
        long: 3000,
        veryLong: 5000
      }
    };
    
    this.init();
  }

  // ==================== INITIALIZATION ====================
  
  init() {
    if (this.hasExecuted) return;
    this.hasExecuted = true;
    
    this.log('Initializing...');
    this.setupEventListeners();
    this.start();
  }

  setupEventListeners() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.sleep(this.config.timeouts.long).then(() => this.executeWorkflow());
      });
    } else {
      this.sleep(this.config.timeouts.veryLong).then(() => this.executeWorkflow());
    }
  }

  // ==================== LOGGING ====================
  
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[Seren] ${timestamp}`;
    
    switch (level) {
      case 'error':
        console.error(`${prefix} ❌ ${message}`);
        break;
      case 'warn':
        console.warn(`${prefix} ⚠️ ${message}`);
        break;
      case 'success':
        console.log(`${prefix} ✅ ${message}`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  }

  // ==================== WORKFLOW ORCHESTRATION ====================
  
  async executeWorkflow() {
    this.log('Starting workflow execution');
    
    try {
      if (this.isOnTargetPage()) {
        this.log('Already on target subreddit');
        await this.executePostCreation();
        return;
      }

      const userStatus = await this.detectUserStatus();
      if (userStatus !== 'active') {
        this.log(`Cannot proceed due to user status: ${userStatus}`, 'warn');
        return;
      }

      await this.navigateToTargetSubreddit();
      
      if (this.isOnTargetPage()) {
        await this.sleep(this.config.timeouts.long);
        await this.executePostCreation();
      }
    } catch (error) {
      this.log(`Workflow execution failed: ${error.message}`, 'error');
    }
  }

  async executePostCreation() {
    this.log('Executing post creation workflow');
    
    const result = await this.createPost();
    this.log(`Post creation result: ${result}`, result ? 'success' : 'error');
    
    return result;
  }

  // ==================== USER STATUS DETECTION ====================
  
  async detectUserStatus() {
    if (this.checkAccountLocked()) {
      this.log('Account is locked', 'warn');
      return 'locked';
    }
    
    const username = await this.getUsername();
    if (!username) {
      this.log('User not found', 'warn');
      return 'not_found';
    }
    
    this.log(`Active user: ${username}`);
    return 'active';
  }

  checkAccountLocked() {
    const lockPhrases = [
      "we've locked your account",
      "locked your account", 
      "account suspended"
    ];
    
    const pageText = document.body.textContent.toLowerCase();
    const hasLockPhrase = lockPhrases.some(phrase => pageText.includes(phrase));
    
    const hasErrorBanner = this.qsAll('faceplate-banner[appearance="error"]')
      .some(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('locked') || text.includes('suspended');
      });
    
    return hasLockPhrase || hasErrorBanner;
  }

  async getUsername() {
    if (this.currentUser) return this.currentUser;
    
    if (!await this.openUserDropdown()) return null;
    
    await this.sleep(this.config.timeouts.medium);
    
    const userElement = this.qsAll('span.text-12.text-secondary-weak, [id*="user-drawer"] span, .text-12')
      .find(el => el.textContent?.trim().startsWith('u/'));
    
    if (userElement) {
      this.currentUser = userElement.textContent.trim();
      userElement.click();
      await this.sleep(this.config.timeouts.long);
      return this.currentUser;
    }
    
    return null;
  }

  async openUserDropdown() {
    const avatarButton = this.qs('rpl-dropdown div, [data-testid="user-avatar"], button[aria-label*="user"], #expand-user-drawer-button');
    
    if (avatarButton) {
      avatarButton.click();
      await this.sleep(this.config.timeouts.long);
      return true;
    }
    
    return false;
  }

  // ==================== NAVIGATION ====================
  
  isOnTargetPage() {
    return window.location.href.toLowerCase().includes(this.config.targetSubreddit);
  }

  async navigateToTargetSubreddit() {
    this.log(`Navigating to r/${this.config.targetSubreddit}`);
    
    const success = await this.search(`r/${this.config.targetSubreddit}`);
    
    if (!success) {
      this.log('Search failed, using direct navigation');
      window.location.href = `https://www.reddit.com/r/${this.config.targetSubreddit}/`;
    }
    
    return success;
  }

  async search(query) {
    this.log(`Searching: ${query}`);
    
    const searchComponent = await this.waitForElement('faceplate-search-input');
    if (!searchComponent) {
      this.log('Search component not found', 'error');
      return false;
    }
    
    const searchInput = searchComponent.shadowRoot?.querySelector('input');
    if (!searchInput) {
      this.log('Search input not found', 'error');
      return false;
    }
    
    const success = await this.performSearch(searchInput, query);
    
    if (success) {
      this.log('Search completed', 'success');
      await this.sleep(this.config.timeouts.long);
      
      if (this.isOnTargetPage()) {
        this.log('Navigation confirmed', 'success');
      }
      
      return true;
    }
    
    this.log('Search failed', 'error');
    return false;
  }

  async performSearch(inputElement, text) {
    if (!inputElement) return false;
    if (this.isOnTargetPage()) return true;
    
    inputElement.focus();
    inputElement.click();
    await this.sleep(this.config.timeouts.short);
    
    inputElement.value = '';
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    await this.sleep(200);
    
    for (let i = 0; i < text.length; i++) {
      inputElement.value = text.substring(0, i + 1);
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      await this.sleep(50);
    }
    
    await this.sleep(this.config.timeouts.long);
    
    if (await this.tryKeyboardNavigation(inputElement) || this.isOnTargetPage()) {
      return true;
    }
    
    if (await this.tryClickMethod() || this.isOnTargetPage()) {
      return true;
    }
    
    window.location.href = `https://www.reddit.com/r/${this.config.targetSubreddit}/`;
    return true;
  }

  // ==================== POST CREATION ====================
  
  async createPost() {
    this.log('Creating post...');
    
    if (!window.location.href.includes('/submit')) {
      this.log('Redirecting to submission page...');
      window.location.href = `https://www.reddit.com/r/${this.config.targetSubreddit}/submit`;
      await this.sleep(this.config.timeouts.veryLong);
    }
    
    this.log('Waiting for post creation page to load...');
    await this.sleep(this.config.timeouts.veryLong);
    
    try {
      await this.executePostSteps();
      return await this.finalizePost();
    } catch (error) {
      this.log(`Post creation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async executePostSteps() {
    this.log('=== STEP 1: TEXT TAB - Filling title ===');
    if (await this.clickTab('TEXT')) {
      await this.fillTitle();
    } else {
      throw new Error('Cannot proceed without TEXT tab');
    }
    
    this.log('=== STEP 2: LINK TAB - Filling URL ===');
    if (await this.clickTab('LINK')) {
      await this.fillUrl();
    } else {
      throw new Error('Cannot proceed without LINK tab');
    }
    
    this.log('=== STEP 3: Activating Post button ===');
    await this.clickBodyField();
    await this.sleep(this.config.timeouts.long);
    
    this.log('=== STEP 4: Filling body text ===');
    await this.fillBodyText();
    
    this.log('=== STEP 5: Final activation ===');
    await this.clickBodyField();
    await this.sleep(this.config.timeouts.long);
  }

  async finalizePost() {
    this.log('=== STEP 6: Submitting post ===');
    const postClicked = await this.clickPostButton();
    
    if (!postClicked) {
      this.log('FAILED: Could not click Post button', 'error');
      return false;
    }
    
    this.log('Post button clicked, waiting for response...');
    await this.sleep(this.config.timeouts.veryLong);
    
    if (!window.location.href.includes('/submit')) {
      this.log('SUCCESS: Post submitted successfully!', 'success');
      await this.postSubmissionActions();
      return true;
    } else {
      this.log('Still on submission page, checking for errors...', 'warn');
      this.checkSubmissionErrors();
      return false;
    }
  }

  async postSubmissionActions() {
    this.log('=== STEP 7: Post-submission verification ===');
    await this.sleep(this.config.timeouts.long);
    
    const profileSuccess = await this.navigateToUserProfile();
    if (profileSuccess) {
      const postsTabSuccess = await this.navigateToPostsTab();
      if (postsTabSuccess) {
        const postsInfo = await this.checkUserPosts();
        this.logFinalSummary(postsInfo);
      }
    }
  }

  checkSubmissionErrors() {
    const errorMessages = this.qsAll('[role="alert"], .error-message, [class*="error"], [class*="moderator"]');
    
    errorMessages.forEach(error => {
      const text = (error.textContent?.toLowerCase() || '').substring(0, 100);
      if (text.includes('rule') || text.includes('violation') || text.includes('remove')) {
        this.log(`Post rejected: ${text}`, 'error');
      }
    });
  }

  logFinalSummary(postsInfo) {
    this.log('=== FINAL POSTS SUMMARY ===');
    this.log(`User ${this.currentUser} has ${postsInfo.total} posts`);
    this.log(`Last post date: ${postsInfo.lastPostDate || 'Not available'}`);
  }

  // ==================== DOM UTILITIES ====================
  
  qs(selector, root = document) {
    try {
      return (root || document).querySelector(selector);
    } catch {
      return null;
    }
  }

  qsAll(selector, root = document) {
    try {
      return Array.from((root || document).querySelectorAll(selector));
    } catch {
      return [];
    }
  }

  deepQuery(selector, root = document) {
    const element = root.querySelector(selector);
    if (element) return element;
    
    for (const elem of root.querySelectorAll('*')) {
      if (elem.shadowRoot) {
        const found = this.deepQuery(selector, elem.shadowRoot);
        if (found) return found;
      }
    }
    
    return null;
  }

  async waitForElement(selector, timeout = 10000) {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      const element = this.deepQuery(selector);
      if (element) return element;
      await this.sleep(100);
    }
    
    return null;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== IMPLEMENTATION STUBS ====================
  // These methods would contain the specific implementation details
  // from the original postm-page.js file
  
  async tryKeyboardNavigation(inputElement) {
    // Implementation from original code
    return false;
  }

  async tryClickMethod() {
    // Implementation from original code
    return false;
  }

  async clickTab(tabValue) {
    // Implementation from original code
    return false;
  }

  async fillTitle() {
    // Implementation from original code
    return false;
  }

  async fillUrl() {
    // Implementation from original code
    return false;
  }

  async clickBodyField() {
    // Implementation from original code
    return false;
  }

  async fillBodyText() {
    // Implementation from original code
    return false;
  }

  async clickPostButton() {
    // Implementation from original code
    return false;
  }

  async navigateToUserProfile() {
    // Implementation from original code
    return false;
  }

  async navigateToPostsTab() {
    // Implementation from original code
    return false;
  }

  async checkUserPosts() {
    // Implementation from original code
    return { total: 0, lastPostDate: null, posts: [] };
  }
}

// Export for use in content scripts
if (typeof window !== 'undefined') {
  window.SerenPostMachine = SerenPostMachine;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SerenPostMachine;
}