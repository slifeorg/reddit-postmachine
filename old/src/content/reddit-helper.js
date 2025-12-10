/**
 * Reddit Helper - Main Content Script
 * Orchestrates the Reddit posting workflow using clean architecture
 */

class RedditHelper {
  constructor() {
    this.hasExecuted = false;
    this.currentUser = null;
    this.postMan = new window.RedditPostMan();
    
    this.init();
  }

  init() {
    if (this.hasExecuted) return;
    this.hasExecuted = true;
    
    console.log('%c[RedditHelper] Initializing...', 'color: purple; font-weight: bold;');
    this.setupMessageHandlers();
    this.start();
  }

  setupMessageHandlers() {
    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('%c[RedditHelper] 📨 Received message:', 'color: purple;', request);
      
      switch (request.action) {
        case 'create_post':
          this.handleCreatePostRequest(request.payload)
            .then(result => sendResponse({ success: true, result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true; // Will respond asynchronously
          
        case 'check_stats':
          this.handleCheckStatsRequest(request.payload)
            .then(result => sendResponse({ success: true, result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true; // Will respond asynchronously
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
          return false;
      }
    });
  }

  async start() {
    const startWorkflow = async () => {
      console.log('%c[RedditHelper] Page ready, starting workflow', 'color: green;');

      if (this.postMan.isOnTargetPage()) {
        console.log('%c[RedditHelper] Already on target subreddit', 'color: blue;');
        const result = await this.createPost();
        console.log('%c[RedditHelper] Post creation result:', 'color: blue;', result);
        return;
      }

      const userStatus = await this.detectUserStatus();
      if (userStatus !== 'active') {
        console.log(`%c[RedditHelper] Cannot proceed due to user status: ${userStatus}`, 'color: orange;');
        return;
      }

      await this.searchForTargetSubreddit();

      if (this.postMan.isOnTargetPage()) {
        await this.postMan.sleep(3000);
        const result = await this.createPost();
        console.log('%c[RedditHelper] Post creation result:', 'color: blue;', result);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', async () => {
        await this.postMan.sleep(3000);
        await startWorkflow();
      });
    } else {
      await this.postMan.sleep(4000);
      await startWorkflow();
    }
  }

  // ==================== MESSAGE HANDLERS ====================

  async handleCreatePostRequest(payload) {
    console.log('%c[RedditHelper] 🚀 Handling create post request', 'color: lime;', payload);
    
    // Set configuration from payload if provided
    if (payload.title) this.defaultTitle = payload.title;
    if (payload.url) this.defaultUrl = payload.url;
    if (payload.body_text) this.defaultBodyText = payload.body_text;
    if (payload.subreddit) this.targetSubreddit = payload.subreddit;
    
    return await this.createPost();
  }

  async handleCheckStatsRequest(payload) {
    console.log('%c[RedditHelper] 📊 Handling check stats request', 'color: cyan;', payload);
    
    const profileSuccess = await this.postMan.navigateToUserProfile();
    if (!profileSuccess) {
      throw new Error('Failed to navigate to user profile');
    }
    
    const postsTabSuccess = await this.postMan.navigateToPostsTab();
    if (!postsTabSuccess) {
      throw new Error('Failed to navigate to posts tab');
    }
    
    return await this.postMan.checkUserPosts();
  }

  // ==================== USER STATUS ====================

  async detectUserStatus() {
    if (this.postMan.checkAccountLocked()) {
      console.log('%c[RedditHelper] Account locked', 'color: red;');
      return 'locked';
    }
    
    const username = await this.postMan.getUsername();
    if (!username) {
      console.log('%c[RedditHelper] User not found', 'color: red;');
      return 'not_found';
    }
    
    console.log(`%c[RedditHelper] Active user: ${username}`, 'color: green;');
    this.currentUser = username;
    return 'active';
  }

  // ==================== NAVIGATION ====================

  async searchForTargetSubreddit() {
    const searchComponent = await this.postMan.waitForElement('faceplate-search-input');
    if (!searchComponent) {
      console.log('%c[RedditHelper] Search component not found', 'color: red;');
      return false;
    }

    const searchInput = searchComponent.shadowRoot?.querySelector('input');
    if (!searchInput) {
      console.log('%c[RedditHelper] Search input not found', 'color: red;');
      return false;
    }

    const success = await this.postMan.performSearch(searchInput, 'r/sphynx');
    
    if (success) {
      console.log('%c[RedditHelper] Search completed successfully', 'color: green;');
      await this.postMan.sleep(3000);
      
      if (this.postMan.isOnTargetPage()) {
        console.log('%c[RedditHelper] Navigation confirmed', 'color: green;');
      }
      
      return true;
    }
    
    console.log('%c[RedditHelper] Search failed', 'color: red;');
    return false;
  }

  // ==================== POST CREATION ====================

  async createPost() {
    console.log('%c[RedditHelper] Creating post...', 'color: magenta;');

    if (!window.location.href.includes('/submit')) {
      console.log('%c[RedditHelper] Redirecting to submission page...', 'color: blue;');
      window.location.href = 'https://www.reddit.com/r/sphynx/submit';
      await this.postMan.sleep(5000);
    }

    console.log('%c[RedditHelper] Waiting for post creation page to load...', 'color: blue;');
    await this.postMan.sleep(4000);

    try {
      // Step 1: Switch to TEXT tab and fill title
      console.log('%c[RedditHelper] === STEP 1: TEXT TAB - Filling title ===', 'color: cyan;');
      if (await this.postMan.clickTab('TEXT')) {
        await this.postMan.fillTitle(this.defaultTitle);
      } else {
        throw new Error('Cannot proceed without TEXT tab');
      }

      // Step 2: Switch to LINK tab and fill URL
      console.log('%c[RedditHelper] === STEP 2: LINK TAB - Filling URL ===', 'color: cyan;');
      if (await this.postMan.clickTab('LINK')) {
        await this.postMan.fillUrl(this.defaultUrl);
      } else {
        throw new Error('Cannot proceed without LINK tab');
      }

      // Step 3: Activate body field
      console.log('%c[RedditHelper] === STEP 3: Activating Post button ===', 'color: cyan;');
      await this.postMan.clickBodyField();
      await this.postMan.sleep(2000);

      // Step 4: Fill body text
      console.log('%c[RedditHelper] === STEP 4: Filling body text ===', 'color: cyan;');
      await this.postMan.fillBodyText(this.defaultBodyText);

      // Step 5: Final activation
      console.log('%c[RedditHelper] === STEP 5: Final activation ===', 'color: cyan;');
      await this.postMan.clickBodyField();
      await this.postMan.sleep(2000);

      // Step 6: Submit post
      console.log('%c[RedditHelper] === STEP 6: Submitting post ===', 'color: cyan;');
      const postClicked = await this.postMan.clickPostButton();

      if (postClicked) {
        console.log('%c[RedditHelper] Post button clicked, waiting for response...', 'color: blue;');
        await this.postMan.sleep(5000);

        if (!window.location.href.includes('/submit')) {
          console.log('%c[RedditHelper] SUCCESS: Post submitted successfully!', 'color: green; font-weight: bold;');

          // Step 7: Post-submission verification
          console.log('%c[RedditHelper] === STEP 7: Post-submission verification ===', 'color: cyan;');
          await this.postMan.sleep(3000);

          const profileSuccess = await this.postMan.navigateToUserProfile();
          if (profileSuccess) {
            const postsTabSuccess = await this.postMan.navigateToPostsTab();
            if (postsTabSuccess) {
              const postsInfo = await this.postMan.checkUserPosts();
              console.log('%c[RedditHelper] === FINAL POSTS SUMMARY ===', 'color: magenta; font-weight: bold;');
              console.log(`%c[RedditHelper] User ${this.currentUser} has ${postsInfo.total} posts`, 'color: magenta;');
              console.log(`%c[RedditHelper] Last post date: ${postsInfo.lastPostDate || 'Not available'}`, 'color: magenta;');
            }
          }

          return true;
        } else {
          console.log('%c[RedditHelper] Still on submission page, checking for errors...', 'color: orange;');
          
          const errorMessages = this.postMan.qsAll('[role="alert"], .error-message, [class*="error"], [class*="moderator"]');
          for (const error of errorMessages) {
            const text = error.textContent?.toLowerCase() || '';
            if (text.includes('rule') || text.includes('violation') || text.includes('remove')) {
              console.log(`%c[RedditHelper] Post rejected due to rule violations: ${text.substring(0, 100)}`, 'color: red;');
            }
          }
          return false;
        }
      } else {
        console.log('%c[RedditHelper] FAILED: Could not click Post button', 'color: red; font-weight: bold;');
        return false;
      }
    } catch (error) {
      console.log(`%c[RedditHelper] Post creation failed: ${error.message}`, 'color: red; font-weight: bold;');
      return false;
    }
  }

  // ==================== DEFAULT VALUES ====================
  
  get defaultTitle() {
    return this._defaultTitle || "Cute sphynx babies capture your heart";
  }
  
  set defaultTitle(value) {
    this._defaultTitle = value;
  }
  
  get defaultUrl() {
    return this._defaultUrl || 'https://youtube.com/shorts/0xmhrS_VNNY?si=awYc8i5YljycesXq';
  }
  
  set defaultUrl(value) {
    this._defaultUrl = value;
  }
  
  get defaultBodyText() {
    return this._defaultBodyText || '#shorts #sphynx #missmermaid #kitten #cat';
  }
  
  set defaultBodyText(value) {
    this._defaultBodyText = value;
  }
  
  get targetSubreddit() {
    return this._targetSubreddit || 'sphynx';
  }
  
  set targetSubreddit(value) {
    this._targetSubreddit = value;
  }
}

// Initialize only once
if (!window.RedditHelperExecuted) {
  window.RedditHelperExecuted = true;
  try {
    new RedditHelper();
  } catch (error) {
    console.log('%c[RedditHelper] Initialization failed:', 'color: red;', error);
  }
}