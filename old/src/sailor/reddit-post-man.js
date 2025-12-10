/**
 * Reddit Post Man - Content Script Level Code
 * Handles DOM interactions and form filling on Reddit pages
 */

class RedditPostMan {
  constructor() {
    this.name = 'Reddit Post Man';
    this.selectors = {
      search: {
        component: 'faceplate-search-input',
        input: 'input'
      },
      user: {
        avatar: 'rpl-dropdown div, [data-testid="user-avatar"], button[aria-label*="user"], #expand-user-drawer-button',
        dropdown: 'span.text-12.text-secondary-weak, [id*="user-drawer"] span, .text-12',
        profileLinks: [
          'a[href*="/user/"]',
          '[href*="/user/BleedingHeart_108"]',
          'a:contains("View Profile")',
          'faceplate-tracker[source="user_drawer"] a'
        ]
      },
      posting: {
        tabs: '[data-select-value="{value}"]',
        title: 'faceplate-textarea-input[name="title"]',
        link: 'faceplate-textarea-input[name="link"]',
        bodyComposer: 'shreddit-composer[name="optionalBody"]',
        bodyEditor: 'div[contenteditable="true"][data-lexical-editor="true"]',
        submitButton: '#inner-post-submit-button',
        submitContainer: 'r-post-form-submit-button#submit-post-button'
      },
      posts: {
        container: 'shreddit-post, [data-testid="post-container"], .Post, [data-testid*="post"]',
        timestamp: 'time, [data-testid="post_timestamp"]',
        postsTab: [
          'a[href*="/submitted/"]',
          '#profile-tab-posts_tab',
          'a:contains("Posts")',
          'faceplate-tracker[noun="posts_tab"] a'
        ]
      },
      errors: {
        banners: 'faceplate-banner[appearance="error"]',
        alerts: '[role="alert"], .error-message, [class*="error"], [class*="moderator"]'
      },
      search_results: {
        links: 'a[href*="/r/sphynx"]',
        items: 'faceplate-search-result-item a, [role="option"], [data-testid*="search-result"]'
      }
    };

    this.timeouts = {
      micro: 50,
      tiny: 100,
      short: 200,
      medium: 500,
      long: 1500,
      veryLong: 2000,
      extra: 3000,
      max: 5000
    };
  }

  // ==================== LOGGING ====================

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const styles = {
      info: 'color: blue;',
      success: 'color: green; font-weight: bold;',
      warn: 'color: orange; font-weight: bold;',
      error: 'color: red; font-weight: bold;'
    };

    console.log(`%c[PostMan] ${message}`, styles[level] || styles.info);
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
      await this.sleep(this.timeouts.tiny);
    }

    return null;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== ACCOUNT STATUS ====================

  checkAccountLocked() {
    const lockPhrases = [
      "we've locked your account",
      "locked your account",
      "account suspended"
    ];

    const pageText = document.body.textContent.toLowerCase();
    const hasLockPhrase = lockPhrases.some(phrase => pageText.includes(phrase));

    const hasErrorBanner = this.qsAll(this.selectors.errors.banners)
      .some(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('locked') || text.includes('suspended');
      });

    return hasLockPhrase || hasErrorBanner;
  }

  async openUserDropdown() {
    const avatarButton = this.qs(this.selectors.user.avatar);

    if (avatarButton) {
      avatarButton.click();
      await this.sleep(this.timeouts.veryLong);
      return true;
    }

    return false;
  }

  async getUsername() {
    if (!await this.openUserDropdown()) return null;

    await this.sleep(this.timeouts.long);

    const userElement = this.qsAll(this.selectors.user.dropdown)
      .find(el => el.textContent?.trim().startsWith('u/'));

    if (userElement) {
      const username = userElement.textContent.trim();
      userElement.click();
      await this.sleep(this.timeouts.veryLong);
      return username;
    }

    return null;
  }

  // ==================== NAVIGATION ====================

  isOnTargetPage(targetSubreddit = 'sphynx') {
    return window.location.href.toLowerCase().includes(targetSubreddit);
  }

  async performSearch(inputElement, text) {
    if (!inputElement || this.isOnTargetPage()) return this.isOnTargetPage();

    inputElement.focus();
    inputElement.click();
    await this.sleep(this.timeouts.medium);

    // Clear and type text
    inputElement.value = '';
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    await this.sleep(this.timeouts.short);

    for (let i = 0; i < text.length; i++) {
      inputElement.value = text.substring(0, i + 1);
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      await this.sleep(this.timeouts.micro);
    }

    await this.sleep(this.timeouts.veryLong);

    // Try navigation methods
    if (await this.tryKeyboardNavigation(inputElement)) return true;
    if (await this.tryClickMethod()) return true;

    // Fallback to direct navigation
    window.location.href = 'https://www.reddit.com/r/sphynx/';
    return true;
  }

  async tryKeyboardNavigation(inputElement) {
    try {
      inputElement.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true
      }));
      await this.sleep(this.timeouts.long);

      for (let i = 0; i < 3; i++) {
        inputElement.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, bubbles: true
        }));
        await this.sleep(this.timeouts.short + 100);
      }

      inputElement.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true
      }));
      await this.sleep(this.timeouts.veryLong);

      return this.isOnTargetPage();
    } catch {
      return false;
    }
  }

  async tryClickMethod() {
    try {
      const elements = this.qsAll(this.selectors.search_results.items);

      for (const element of elements) {
        const text = element.textContent || '';
        if (text.includes('sphynx') || text.includes('NSFW')) {
          element.click();
          await this.sleep(this.timeouts.extra);
          return this.isOnTargetPage();
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  // ==================== POST CREATION ====================

  async clickTab(tabValue) {
    this.log(`Clicking tab with data-select-value="${tabValue}"`);

    const tabSelector = this.selectors.posting.tabs.replace('{value}', tabValue);
    const tab = this.deepQuery(tabSelector);

    if (tab) {
      tab.click();
      await this.sleep(this.timeouts.veryLong);
      return true;
    }

    this.log(`Tab with data-select-value="${tabValue}" not found`, 'warn');
    return false;
  }

  async fillTitle(title = "Cute sphynx babies capture your heart") {
    this.log('Filling title...');

    const titleInputElement = this.deepQuery(this.selectors.posting.title);
    if (!titleInputElement) {
      this.log('Title input not found', 'error');
      return false;
    }

    const shadowRoot = titleInputElement.shadowRoot;
    if (!shadowRoot) {
      this.log('Title shadow root not found', 'error');
      return false;
    }

    const titleInput = shadowRoot.querySelector('#innerTextArea');
    if (!titleInput) {
      this.log('Title textarea not found', 'error');
      return false;
    }

    titleInput.focus();
    await this.sleep(this.timeouts.medium);

    titleInput.value = title;
    titleInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    titleInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

    this.log('Title set successfully', 'success');
    await this.sleep(this.timeouts.long);

    return true;
  }

  async fillUrl(url = 'https://youtube.com/shorts/0xmhrS_VNNY?si=awYc8i5YljycesXq') {
    this.log('Filling URL...');

    const urlInputElement = this.deepQuery(this.selectors.posting.link);
    if (!urlInputElement) {
      this.log('URL input not found', 'error');
      return false;
    }

    const shadowRoot = urlInputElement.shadowRoot;
    if (!shadowRoot) {
      this.log('URL shadow root not found', 'error');
      return false;
    }

    const urlInput = shadowRoot.querySelector('#innerTextArea');
    if (!urlInput) {
      this.log('URL textarea not found', 'error');
      return false;
    }

    urlInput.focus();
    await this.sleep(this.timeouts.medium);

    urlInput.value = url;
    urlInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    urlInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

    this.log('URL set successfully', 'success');
    await this.sleep(this.timeouts.long);

    return true;
  }

  async clickBodyField() {
    this.log('Clicking body text field to activate Post button...');

    const bodyComposer = this.deepQuery(this.selectors.posting.bodyComposer);
    if (!bodyComposer) {
      this.log('Body composer not found', 'error');
      return false;
    }

    const bodyEditable = bodyComposer.querySelector(this.selectors.posting.bodyEditor);
    if (!bodyEditable) {
      this.log('Body editable field not found', 'error');
      return false;
    }

    this.log('Found Lexical editor, clicking to activate Post button...');

    bodyEditable.click();
    await this.sleep(this.timeouts.tiny);

    bodyEditable.focus();
    await this.sleep(this.timeouts.tiny);

    bodyEditable.click();

    bodyEditable.dispatchEvent(new Event('focus', { bubbles: true, cancelable: true }));
    bodyEditable.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));

    await this.sleep(this.timeouts.long);
    return true;
  }

  async fillBodyText(text = "#shorts  #sphynx #missmermaid #kitten #cat") {
    this.log('Filling body text...');

    const bodyComposer = this.deepQuery(this.selectors.posting.bodyComposer);
    if (!bodyComposer) {
      this.log('Body composer not found', 'error');
      return false;
    }

    const bodyEditable = bodyComposer.querySelector(this.selectors.posting.bodyEditor);
    if (!bodyEditable) {
      this.log('Body editable field not found', 'error');
      return false;
    }

    this.log('Found Lexical editor, setting text...');

    bodyEditable.focus();
    await this.sleep(this.timeouts.medium);

    bodyEditable.innerHTML = '<p><br></p>';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      bodyEditable.dispatchEvent(new KeyboardEvent('keydown', {
        key: char,
        code: char === ' ' ? 'Space' : `Key${char.toUpperCase()}`,
        keyCode: char.charCodeAt(0),
        which: char.charCodeAt(0),
        bubbles: true,
        cancelable: true
      }));

      if (document.execCommand && document.execCommand('insertText', false, char)) {
        // execCommand worked
      } else {
        // Fallback method
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const textNode = document.createTextNode(char);
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }

      bodyEditable.dispatchEvent(new InputEvent('input', {
        inputType: 'insertText',
        data: char,
        bubbles: true,
        cancelable: true
      }));

      bodyEditable.dispatchEvent(new KeyboardEvent('keyup', {
        key: char,
        code: char === ' ' ? 'Space' : `Key${char.toUpperCase()}`,
        keyCode: char.charCodeAt(0),
        which: char.charCodeAt(0),
        bubbles: true,
        cancelable: true
      }));

      await this.sleep(10);
    }

    bodyEditable.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

    this.log('Body text set successfully', 'success');
    await this.sleep(this.timeouts.long);

    return true;
  }

  async clickPostButton() {
    this.log('Clicking Post button...');

    const checkButtonActive = () => {
      const innerButton = this.deepQuery(this.selectors.posting.submitButton);
      if (innerButton) {
        const isDisabled = innerButton.disabled || innerButton.getAttribute('aria-disabled') === 'true';
        this.log(`Inner post button active: ${!isDisabled}`);
        return !isDisabled;
      }

      const postContainer = this.deepQuery(this.selectors.posting.submitContainer);
      if (postContainer && postContainer.shadowRoot) {
        const shadowButton = postContainer.shadowRoot.querySelector('button');
        if (shadowButton) {
          const isShadowDisabled = shadowButton.disabled || shadowButton.getAttribute('aria-disabled') === 'true';
          this.log(`Shadow post button active: ${!isShadowDisabled}`);
          return !isShadowDisabled;
        }
      }

      return false;
    };

    // Wait for button to become active
    const startTime = Date.now();
    while (Date.now() - startTime < 10000) {
      if (checkButtonActive()) {
        break;
      }
      await this.sleep(this.timeouts.medium);
    }

    // Try clicking inner button first
    const innerPostButton = this.deepQuery(this.selectors.posting.submitButton);
    if (innerPostButton && !innerPostButton.disabled) {
      this.log('Found active inner post button, clicking...', 'success');
      innerPostButton.click();
      return true;
    }

    // Try shadow DOM button
    const postContainer = this.deepQuery(this.selectors.posting.submitContainer);
    if (postContainer) {
      this.log('Found post container');

      if (postContainer.shadowRoot) {
        const shadowButton = postContainer.shadowRoot.querySelector('button');
        if (shadowButton && !shadowButton.disabled) {
          this.log('Found active button in shadow DOM, clicking...', 'success');
          shadowButton.click();
          return true;
        }
      }

      this.log('Clicking post container directly');
      postContainer.click();
      return true;
    }

    // Fallback selectors
    const alternativeSelectors = [
      'button[type="submit"]',
      '[data-testid="submit-post"]',
      'button:contains("Post")',
      '.post-button'
    ];

    for (const selector of alternativeSelectors) {
      const button = this.deepQuery(selector);
      if (button && (
        button.textContent?.toLowerCase().includes('post') ||
        button.textContent?.toLowerCase().includes('submit')
      )) {
        this.log(`Found post button with selector: ${selector}, clicking...`, 'success');
        button.click();
        return true;
      }
    }

    this.log('Post button not found with any selector', 'error');
    return false;
  }

  // ==================== USER PROFILE ====================

  async navigateToUserProfile() {
    this.log('Navigating to user profile...');

    if (!await this.openUserDropdown()) {
      this.log('Failed to open user dropdown', 'error');
      return false;
    }

    await this.sleep(this.timeouts.veryLong);

    for (const selector of this.selectors.user.profileLinks) {
      const profileLink = this.deepQuery(selector);
      if (profileLink && (
        profileLink.textContent?.includes('View Profile') ||
        profileLink.href?.includes('/user/')
      )) {
        this.log('Found profile link, clicking...', 'success');
        profileLink.click();
        await this.sleep(this.timeouts.max);
        return true;
      }
    }

    this.log('Profile link not found', 'error');
    return false;
  }

  async navigateToPostsTab() {
    this.log('Navigating to Posts tab...');
    await this.sleep(this.timeouts.extra);

    for (const selector of this.selectors.posts.postsTab) {
      const postsTab = this.deepQuery(selector);
      if (postsTab && postsTab.textContent?.toLowerCase().includes('posts')) {
        this.log('Found Posts tab, clicking...', 'success');
        postsTab.click();
        await this.sleep(this.timeouts.max);
        return true;
      }
    }

    this.log('Posts tab not found', 'error');
    return false;
  }

  async checkUserPosts() {
    this.log('Checking user posts...');
    await this.sleep(this.timeouts.extra);

    const posts = this.qsAll(this.selectors.posts.container);
    this.log(`Found ${posts.length} posts`);

    if (posts.length === 0) {
      this.log('No posts found');
      return { total: 0, lastPostDate: null, posts: [] };
    }

    const postsWithDates = posts.map(post => {
      const timestamp = post.getAttribute('created-timestamp') ||
        post.querySelector(this.selectors.posts.timestamp)?.getAttribute('datetime') ||
        post.querySelector('span[data-testid="post_timestamp"]')?.textContent;

      return { element: post, timestamp };
    }).filter(post => post.timestamp);

    // Sort by date (newest first)
    postsWithDates.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    this.log('=== POSTS SUMMARY ===');
    this.log(`Total posts: ${posts.length}`);

    postsWithDates.forEach((post, index) => {
      this.log(`Post ${index + 1}: ${post.timestamp}`);
    });

    if (postsWithDates.length > 0) {
      this.log(`Last post date: ${postsWithDates[0].timestamp}`, 'success');
      return {
        total: posts.length,
        lastPostDate: postsWithDates[0].timestamp,
        posts: postsWithDates
      };
    }

    return {
      total: posts.length,
      lastPostDate: null,
      posts: []
    };
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.RedditPostMan = RedditPostMan;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RedditPostMan;
}
