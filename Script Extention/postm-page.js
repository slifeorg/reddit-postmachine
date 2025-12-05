class RedditHelper {
  constructor() { this.hasExecuted = false; this.currentUser = null; this.init(); }

  qs(s, r = document) { try { return (r || document).querySelector(s) } catch { return null } }
  qsAll(s, r = document) { try { return Array.from((r || document).querySelectorAll(s)) } catch { return [] } }
  async sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
  isOnTargetPage() { return window.location.href.toLowerCase().includes('sphynx') }

  checkAccountLocked() {
    const phrases = ["we've locked your account", "locked your account", "account suspended"];
    const pageText = document.body.textContent.toLowerCase();
    return phrases.some(phrase => pageText.includes(phrase)) ||
      this.qsAll('faceplate-banner[appearance="error"]').some(el =>
        el.textContent?.toLowerCase().includes('locked') || el.textContent?.toLowerCase().includes('suspended'));
  }

  async openUserDropdown() {
    const avatarButton = this.qs('rpl-dropdown div, [data-testid="user-avatar"], button[aria-label*="user"], #expand-user-drawer-button');
    if (avatarButton) {
      avatarButton.click();
      await this.sleep(2000);
      return true;
    }
    return false;
  }

  async getUsername() {
    if (this.currentUser) return this.currentUser;
    if (!await this.openUserDropdown()) return null;
    await this.sleep(1500);
    const userElement = this.qsAll('span.text-12.text-secondary-weak, [id*="user-drawer"] span, .text-12').find(el =>
      el.textContent?.trim().startsWith('u/'));
    if (userElement) {
      this.currentUser = userElement.textContent.trim();
      userElement.click();
      await this.sleep(2000);
      return this.currentUser;
    }
    return null;
  }

  async navigateToUserProfile() {
    console.log('Navigating to user profile...');

    // Спочатку відкриваємо dropdown меню
    if (!await this.openUserDropdown()) {
      console.log('Failed to open user dropdown');
      return false;
    }

    await this.sleep(2000);

    // Шукаємо посилання на профіль
    const profileSelectors = [
      'a[href*="/user/"]',
      '[href*="/user/BleedingHeart_108"]',
      'a:contains("View Profile")',
      'faceplate-tracker[source="user_drawer"] a'
    ];

    for (const selector of profileSelectors) {
      const profileLink = this.deepQuery(selector);
      if (profileLink && (profileLink.textContent?.includes('View Profile') || profileLink.href?.includes('/user/'))) {
        console.log('Found profile link, clicking...');
        profileLink.click();
        await this.sleep(4000);
        return true;
      }
    }

    console.log('Profile link not found');
    return false;
  }

  async navigateToPostsTab() {
    console.log('Navigating to Posts tab...');
    await this.sleep(3000);

    const postsTabSelectors = [
      'a[href*="/submitted/"]',
      '#profile-tab-posts_tab',
      'a:contains("Posts")',
      'faceplate-tracker[noun="posts_tab"] a'
    ];

    for (const selector of postsTabSelectors) {
      const postsTab = this.deepQuery(selector);
      if (postsTab && postsTab.textContent?.toLowerCase().includes('posts')) {
        console.log('Found Posts tab, clicking...');
        postsTab.click();
        await this.sleep(4000);
        return true;
      }
    }

    console.log('Posts tab not found');
    return false;
  }

  async checkUserPosts() {
    console.log('Checking user posts...');
    await this.sleep(3000);

    // Отримуємо всі пости
    const posts = this.qsAll('shreddit-post, [data-testid="post-container"], .Post, [data-testid*="post"]');
    console.log(`Found ${posts.length} posts`);

    if (posts.length > 0) {
      // Сортуємо пости за датою (новий перший)
      const postsWithDates = posts.map(post => {
        const timestamp = post.getAttribute('created-timestamp') ||
          post.querySelector('time, [data-testid="post_timestamp"]')?.getAttribute('datetime') ||
          post.querySelector('span[data-testid="post_timestamp"]')?.textContent;

        return { element: post, timestamp };
      }).filter(post => post.timestamp);

      // Сортуємо за датою (новий перший)
      postsWithDates.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log('=== POSTS SUMMARY ===');
      console.log(`Total posts: ${posts.length}`);

      postsWithDates.forEach((post, index) => {
        console.log(`Post ${index + 1}: ${post.timestamp}`);
      });

      if (postsWithDates.length > 0) {
        console.log(`Last post date: ${postsWithDates[0].timestamp}`);
        return {
          total: posts.length,
          lastPostDate: postsWithDates[0].timestamp,
          posts: postsWithDates
        };
      }
    } else {
      console.log('No posts found');
    }

    return {
      total: 0,
      lastPostDate: null,
      posts: []
    };
  }

  async detectUserStatus() {
    if (this.checkAccountLocked()) { console.log('Account locked'); return 'locked'; }
    const username = await this.getUsername();
    if (!username) { console.log('User not found'); return 'not_found'; }
    console.log('User:', username);
    return 'active';
  }

  async tryKeyboardNavigation(inputElement) {
    try {
      inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
      await this.sleep(1000);
      for (let i = 0; i < 3; i++) {
        inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, bubbles: true }));
        await this.sleep(300);
      }
      inputElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
      await this.sleep(2000);
      return this.isOnTargetPage();
    } catch { return false; }
  }

  async tryClickMethod() {
    try {
      const selectors = ['a[href*="/r/sphynx"]', 'faceplate-search-result-item a', '[role="option"]', '[data-testid*="search-result"]'];
      for (const selector of selectors) {
        const elements = this.qsAll(selector);
        for (const element of elements) {
          const text = element.textContent || '';
          if (text.includes('sphynx') || text.includes('473K') || text.includes('NSFW')) {
            element.click(); await this.sleep(3000); return this.isOnTargetPage();
          }
        }
      }
      return false;
    } catch { return false; }
  }

  async performSearch(inputElement, text) {
    if (!inputElement) return false;
    if (this.isOnTargetPage()) return true;
    inputElement.focus(); inputElement.click(); await this.sleep(500);
    inputElement.value = ''; inputElement.dispatchEvent(new Event('input', { bubbles: true })); await this.sleep(200);
    for (let i = 0; i < text.length; i++) {
      inputElement.value = text.substring(0, i + 1);
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      await this.sleep(50);
    }
    await this.sleep(2000);
    if (await this.tryKeyboardNavigation(inputElement) || this.isOnTargetPage()) return true;
    if (await this.tryClickMethod() || this.isOnTargetPage()) return true;
    window.location.href = 'https://www.reddit.com/r/sphynx/';
    return true;
  }

  async search(query) {
    console.log('Searching:', query);
    const searchComponent = await this.waitForElement('faceplate-search-input');
    if (!searchComponent) { console.log('Search component not found'); return false; }
    const searchInput = searchComponent.shadowRoot?.querySelector('input');
    if (!searchInput) { console.log('Search input not found'); return false; }
    const success = await this.performSearch(searchInput, query);
    if (success) {
      console.log('Search completed');
      await this.sleep(3000);
      if (this.isOnTargetPage()) console.log('Navigation confirmed');
      return true;
    } else { console.log('Search failed'); return false; }
  }

  async clickTab(tabValue) {
    console.log(`Clicking tab with data-select-value="${tabValue}"`);
    const tab = this.deepQuery(`[data-select-value="${tabValue}"]`);
    if (tab) {
      tab.click();
      await this.sleep(2000);
      return true;
    }
    console.log(`Tab with data-select-value="${tabValue}" not found`);
    return false;
  }

  async fillTitle() {
    console.log('Filling title...');
    const titleInputElement = this.deepQuery('faceplate-textarea-input[name="title"]');
    if (titleInputElement) {
      const shadowRoot = titleInputElement.shadowRoot;
      if (shadowRoot) {
        const titleInput = shadowRoot.querySelector('#innerTextArea');
        if (titleInput) {
          titleInput.focus();
          await this.sleep(500);
          titleInput.value = "Cute sphynx babies capture your heart";
          titleInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
          titleInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          console.log('Title set');
          await this.sleep(1500);
          return true;
        }
      }
    }
    console.log('Failed to fill title');
    return false;
  }

  async fillUrl() {
    console.log('Filling URL...');
    const urlInputElement = this.deepQuery('faceplate-textarea-input[name="link"]');
    if (urlInputElement) {
      const shadowRoot = urlInputElement.shadowRoot;
      if (shadowRoot) {
        const urlInput = shadowRoot.querySelector('#innerTextArea');
        if (urlInput) {
          const url = ('https://youtube.com/shorts/0xmhrS_VNNY?si=awYc8i5YljycesXq');
          urlInput.focus();
          await this.sleep(500);
          urlInput.value = url;
          urlInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
          urlInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          console.log('URL set');
          await this.sleep(1500);
          return true;
        }
      }
    }
    console.log('Failed to fill URL');
    return false;
  }

  async clickBodyField() {
    console.log('Clicking body text field to activate Post button...');

    const bodyComposer = this.deepQuery('shreddit-composer[name="optionalBody"]');
    if (bodyComposer) {
      const bodyEditable = bodyComposer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]');
      if (bodyEditable) {
        console.log('Found Lexical editor, clicking to activate Post button...');

        bodyEditable.click();
        await this.sleep(100);
        bodyEditable.focus();
        await this.sleep(100);
        bodyEditable.click();

        bodyEditable.dispatchEvent(new Event('focus', { bubbles: true, cancelable: true }));
        bodyEditable.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));

        await this.sleep(1000);
        return true;
      }
    }

    console.log('Body text field not found');
    return false;
  }

  async fillBodyText() {
    console.log('Filling body text...');

    const bodyComposer = this.deepQuery('shreddit-composer[name="optionalBody"]');
    if (bodyComposer) {
      const bodyEditable = bodyComposer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]');
      if (bodyEditable) {
        console.log('Found Lexical editor, setting text...');

        bodyEditable.focus();
        await this.sleep(500);

        bodyEditable.innerHTML = '<p><br></p>';

        const text = "#shorts  #sphynx #missmermaid #kitten #cat";

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
          } else {
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

        console.log('Body text set successfully');
        await this.sleep(1500);
        return true;
      }
    }

    console.log('Failed to find body editor');
    return false;
  }

  async clickPostButton() {
    console.log('Clicking Post button...');

    const checkButtonActive = () => {
      const innerButton = this.deepQuery('#inner-post-submit-button');
      if (innerButton) {
        const isDisabled = innerButton.disabled || innerButton.getAttribute('aria-disabled') === 'true';
        console.log('Inner post button active:', !isDisabled);
        return !isDisabled;
      }

      const postContainer = this.deepQuery('r-post-form-submit-button#submit-post-button');
      if (postContainer && postContainer.shadowRoot) {
        const shadowButton = postContainer.shadowRoot.querySelector('button');
        if (shadowButton) {
          const isShadowDisabled = shadowButton.disabled || shadowButton.getAttribute('aria-disabled') === 'true';
          console.log('Shadow post button active:', !isShadowDisabled);
          return !isShadowDisabled;
        }
      }

      return false;
    };

    const startTime = Date.now();
    while (Date.now() - startTime < 10000) {
      if (checkButtonActive()) {
        break;
      }
      await this.sleep(500);
    }

    const innerPostButton = this.deepQuery('#inner-post-submit-button');
    if (innerPostButton && !innerPostButton.disabled) {
      console.log('Found active inner post button, clicking...');
      innerPostButton.click();
      return true;
    }

    const postContainer = this.deepQuery('r-post-form-submit-button#submit-post-button');
    if (postContainer) {
      console.log('Found post container');

      if (postContainer.shadowRoot) {
        const shadowButton = postContainer.shadowRoot.querySelector('button');
        if (shadowButton && !shadowButton.disabled) {
          console.log('Found active button in shadow DOM, clicking...');
          shadowButton.click();
          return true;
        }
      }

      console.log('Clicking post container directly');
      postContainer.click();
      return true;
    }

    const alternativeSelectors = [
      'button[type="submit"]',
      '[data-testid="submit-post"]',
      'button:contains("Post")',
      '.post-button'
    ];

    for (const selector of alternativeSelectors) {
      const button = this.deepQuery(selector);
      if (button && (button.textContent?.toLowerCase().includes('post') || button.textContent?.toLowerCase().includes('submit'))) {
        console.log(`Found post button with selector: ${selector}, clicking...`);
        button.click();
        return true;
      }
    }

    console.log('Post button not found with any selector');
    return false;
  }

  async createPost() {
    console.log('Creating post...');

    if (!window.location.href.includes('/submit')) {
      console.log('Redirecting to submission page...');
      window.location.href = 'https://www.reddit.com/r/sphynx/submit';
      await this.sleep(5000);
    }

    console.log('Waiting for post creation page to load...');
    await this.sleep(4000);

    console.log('=== STEP 1: TEXT TAB - Filling title ===');
    if (await this.clickTab('TEXT')) {
      await this.fillTitle();
    } else {
      console.log('Cannot proceed without TEXT tab');
      return false;
    }

    console.log('=== STEP 2: LINK TAB - Filling URL ===');
    if (await this.clickTab('LINK')) {
      await this.fillUrl();
    } else {
      console.log('Cannot proceed without LINK tab');
      return false;
    }

    console.log('=== STEP 3: Activating Post button by clicking body field ===');
    await this.clickBodyField();
    await this.sleep(2000);

    console.log('=== STEP 4: Filling body text ===');
    await this.fillBodyText();

    console.log('=== STEP 5: Final activation click on body field ===');
    await this.clickBodyField();
    await this.sleep(2000);

    console.log('=== STEP 6: Clicking Post button ===');
    const postClicked = await this.clickPostButton();

    if (postClicked) {
      console.log('Post button clicked, waiting for response...');
      await this.sleep(5000);

      if (!window.location.href.includes('/submit')) {
        console.log('SUCCESS: Redirected from submission page - post submitted!');

        // НОВИЙ КОД: Перехід на сторінку користувача та перевірка постів
        console.log('=== STEP 7: Navigating to user profile and checking posts ===');
        await this.sleep(3000);

        const profileSuccess = await this.navigateToUserProfile();
        if (profileSuccess) {
          const postsTabSuccess = await this.navigateToPostsTab();
          if (postsTabSuccess) {
            const postsInfo = await this.checkUserPosts();
            console.log('=== FINAL POSTS SUMMARY ===');
            console.log(`User ${this.currentUser} has ${postsInfo.total} posts`);
            console.log(`Last post date: ${postsInfo.lastPostDate || 'Not available'}`);
          }
        }

        return true;
      } else {
        console.log('Still on submission page, post may not have been submitted');

        const errorMessages = this.qsAll('[role="alert"], .error-message, [class*="error"], [class*="moderator"]');
        for (const error of errorMessages) {
          const text = error.textContent?.toLowerCase() || '';
          if (text.includes('rule') || text.includes('violation') || text.includes('remove')) {
            console.log('Post rejected due to rule violations:', text.substring(0, 100));
          }
        }
        return false;
      }
    } else {
      console.log('FAILED: Could not click Post button');
      return false;
    }
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

  deepQuery(selector, root = document) {
    const el = root.querySelector(selector);
    if (el) return el;
    for (const elem of root.querySelectorAll('*')) {
      if (elem.shadowRoot) {
        const found = this.deepQuery(selector, elem.shadowRoot);
        if (found) return found;
      }
    }
    return null;
  }

  async init() {
    if (this.hasExecuted) return;
    this.hasExecuted = true;
    console.log('Initializing...');

    const start = async () => {
      console.log('Page ready');

      if (this.isOnTargetPage()) {
        console.log('Already on target subreddit');
        const result = await this.createPost();
        console.log('Post creation result:', result);
        return;
      }

      const userStatus = await this.detectUserStatus();
      if (userStatus === 'locked' || userStatus === 'not_found') {
        console.log('Cannot proceed due to user status:', userStatus);
        return;
      }

      await this.search('r/sphynx');

      if (this.isOnTargetPage()) {
        await this.sleep(3000);
        const result = await this.createPost();
        console.log('Post creation result:', result);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', async () => {
        await this.sleep(3000);
        await start();
      });
    } else {
      await this.sleep(4000);
      await start();
    }
  }
}

if (!window.RedditHelperExecuted) {
  window.RedditHelperExecuted = true;
  try { new RedditHelper(); } catch { console.log('Initialization failed'); }
}
