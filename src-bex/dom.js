/**
 * DOM script for Reddit Post Machine BEX
 * This script runs in the context of web pages to handle DOM manipulation
 */
import { bexDom } from 'quasar/wrappers'

// Initialize DOM script
console.log('Reddit Post Machine DOM script loaded')

// DOM manipulation utilities for Reddit pages
const RedditDOMHelper = {
  // Deep query for Shadow DOM traversal
  deepQuery(selector, root = document) {
    const el = root.querySelector(selector)
    if (el) return el
    for (const elem of root.querySelectorAll('*')) {
      if (elem.shadowRoot) {
        const found = this.deepQuery(selector, elem.shadowRoot)
        if (found) return found
      }
    }
    return null
  },

  // Async sleep helper
  async sleep(ms) {
    return new Promise(r => setTimeout(r, ms))
  },

  // Robust wait for element using deepQuery
  async waitForElement(selector, timeout = 10000) {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      const element = this.deepQuery(selector)
      if (element) return element
      await this.sleep(100)
    }
    return null
  },

  // Get current Reddit page info
  getPageInfo() {
    const url = window.location.href
    const pathname = window.location.pathname

    let pageType = 'unknown'
    let subreddit = null

    if (pathname.includes('/submit')) {
      pageType = 'submit'
    } else if (pathname.includes('/r/')) {
      pageType = 'subreddit'
      const match = pathname.match(/\/r\/([^\/]+)/)
      if (match) subreddit = match[1]
    } else if (pathname === '/' || pathname.includes('/hot') || pathname.includes('/new')) {
      pageType = 'home'
    }

    return {
      url,
      pathname,
      pageType,
      subreddit,
      isOldReddit: url.includes('old.reddit.com'),
      isNewReddit: url.includes('www.reddit.com') && !url.includes('old.reddit.com')
    }
  },

  async clickTab(tabValue) {
    console.log(`Clicking tab with data-select-value="${tabValue}"`)
    const tab = this.deepQuery(`[data-select-value="${tabValue}"]`)
    if (tab) {
      tab.click()
      await this.sleep(2000)
      return true
    }
    console.log(`Tab with data-select-value="${tabValue}" not found`)
    return false
  },

  async fillTitle(titleText) {
    console.log('Filling title...')
    const titleInputElement = this.deepQuery('faceplate-textarea-input[name="title"]')
    if (titleInputElement) {
      const shadowRoot = titleInputElement.shadowRoot
      if (shadowRoot) {
        const titleInput = shadowRoot.querySelector('#innerTextArea')
        if (titleInput) {
          titleInput.focus()
          await this.sleep(500)
          titleInput.value = titleText
          titleInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
          titleInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
          console.log('Title set')
          await this.sleep(1500)
          return true
        }
      }
    }
    console.log('Failed to fill title')
    return false
  },

  async fillUrl(urlText) {
    console.log('Filling URL...')
    const urlInputElement = this.deepQuery('faceplate-textarea-input[name="link"]')
    if (urlInputElement) {
      const shadowRoot = urlInputElement.shadowRoot
      if (shadowRoot) {
        const urlInput = shadowRoot.querySelector('#innerTextArea')
        if (urlInput) {
          urlInput.focus()
          await this.sleep(500)
          urlInput.value = urlText
          urlInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
          urlInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
          console.log('URL set')
          await this.sleep(1500)
          return true
        }
      }
    }
    console.log('Failed to fill URL')
    return false
  },

  async clickBodyField() {
    console.log('Clicking body text field to activate Post button...')
    const bodyComposer = this.deepQuery('shreddit-composer[name="optionalBody"]')
    if (bodyComposer) {
      const bodyEditable = bodyComposer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]')
      if (bodyEditable) {
        console.log('Found Lexical editor, clicking...')
        bodyEditable.click()
        await this.sleep(100)
        bodyEditable.focus()
        await this.sleep(100)
        bodyEditable.click()
        bodyEditable.dispatchEvent(new Event('focus', { bubbles: true, cancelable: true }))
        bodyEditable.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }))
        await this.sleep(1000)
        return true
      }
    }
    console.log('Body text field not found')
    return false
  },

  async fillBodyText(bodyText) {
    console.log('Filling body text...')
    const bodyComposer = this.deepQuery('shreddit-composer[name="optionalBody"]')
    if (bodyComposer) {
      const bodyEditable = bodyComposer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]')
      if (bodyEditable) {
        console.log('Found Lexical editor, setting text...')
        bodyEditable.focus()
        await this.sleep(500)
        
        // Clear logic if needed, but here we just set innerHTML for simplicity as base
        // Or strictly follow the character-by-character if needed. 
        // For simplicity in this port, we'll try the direct innerHTML + event simulation approach first 
        // as the character loop is very slow, but we can include the loop if robust matches require it.
        // Let's use a slightly optimized version of the loop from legacy.
        
        bodyEditable.innerHTML = '<p><br></p>'
        
        for (let i = 0; i < bodyText.length; i++) {
          const char = bodyText[i]
          
          bodyEditable.dispatchEvent(new KeyboardEvent('keydown', {
            key: char,
            code: char === ' ' ? 'Space' : `Key${char.toUpperCase()}`,
            keyCode: char.charCodeAt(0),
            bubbles: true,
            cancelable: true
          }))

          // Try execCommand for text insertion
          const inserted = document.execCommand('insertText', false, char)
          if (!inserted) {
             // Fallback for newer browsers that might block execCommand or if it fails
             const selection = window.getSelection()
             if (selection.rangeCount > 0) {
               const range = selection.getRangeAt(0)
               range.deleteContents()
               range.insertNode(document.createTextNode(char))
               range.collapse(false) // move to end
             }
          }

          bodyEditable.dispatchEvent(new InputEvent('input', {
             inputType: 'insertText',
             data: char,
             bubbles: true,
             cancelable: true
          }))
          
          await this.sleep(5) // Faster than 10ms
        }

        bodyEditable.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
        console.log('Body text set successfully')
        await this.sleep(1500)
        return true
      }
    }
    console.log('Failed to find body editor')
    return false
  },

  // Main orchestrator for filling the form
  async fillPostForm(data) {
    console.log('Starting robust form fill with Frappe model...', data)
    
    // Map Frappe fields to local variables
    const {
        title,
        subreddit_name, // New field
        post_type,      // "Text" or "Link"
        url_to_share,   // URL if Link type
        body_text       // Body if Text type
    } = data;

    // 0. Select Subreddit (if provided)
    if (subreddit_name) {
        if (await this.selectSubreddit(subreddit_name)) {
            console.log(`Subreddit ${subreddit_name} selected`);
            await this.sleep(1000);
        } else {
            console.warn(`Failed to select subreddit ${subreddit_name}`);
        }
    }

    // Determine type based on data
    const isLinkPost = post_type === 'Link';
    const targetTab = isLinkPost ? 'LINK' : 'TEXT'

    console.log(`Targeting ${targetTab} tab`)
    
    // 1. Select the correct tab
    if (await this.clickTab(targetTab)) {
       // 2. Fill Title
       if (title) {
         await this.fillTitle(title)
       }

       // 3. Fill Content
       if (isLinkPost && url_to_share) {
         await this.fillUrl(url_to_share)
       } else if (body_text) {
         // Activate body first
         await this.clickBodyField()
         await this.fillBodyText(body_text)
         // Re-activate to ensure state is captured
         await this.clickBodyField()
       }

       console.log('Form fill sequence completed')
    } else {
       console.error('Could not switch to target tab')
    }
  },

  async selectSubreddit(subredditName) {
      console.log(`Selecting subreddit: ${subredditName}...`);
      
      // 1. Find the Search input for subreddit
      // Common selector on new reddit submit page
      const searchInput = this.deepQuery('input[placeholder="Choose a community"], input[placeholder="Search for a community"]');
      
      if (searchInput) {
          searchInput.click();
          searchInput.focus();
          await this.sleep(500);
          
          // Type the subreddit name
          // We can use the execCommand or value setter approach
          searchInput.value = subredditName;
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          await this.sleep(1000);
          
          // 2. Select from dropdown
          // The dropdown usually appears in a specific list container
          // We look for an element that matches exactly or starts with the name
          
          // Helper to find the dropdown option
          const findOption = () => {
              const options = Array.from(document.querySelectorAll('[role="option"], li[id*="community-"]'));
              return options.find(opt => {
                  const text = opt.textContent?.toLowerCase().trim();
                  return text === `r/${subredditName.toLowerCase()}` || text === subredditName.toLowerCase();
              });
          };
          
          let option = findOption();
          if (option) {
              option.click();
              return true;
          }
          
          // If not found immediately, wait a bit
          await this.sleep(1000);
          option = findOption();
          if (option) {
              option.click();
              return true;
          }
      } else {
          // Fallback for older interfaces or different layouts
          // Check for a standard select box (rare on modern Reddit but possible)
          const selectBox = this.deepQuery('select[name="subreddit"], select#subreddit');
          if (selectBox) {
              selectBox.value = subredditName;
              selectBox.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
          }
      }
      
      return false;
  },

  // Add extension UI elements
  addExtensionButton() {
    const pageInfo = this.getPageInfo()
    
    // Don't add button if not on a relevant page
    if (pageInfo.pageType !== 'submit' && pageInfo.pageType !== 'subreddit' && pageInfo.pageType !== 'home') {
      return
    }

    // Check if button already exists
    if (document.querySelector('.reddit-post-machine-btn')) {
      return
    }

    const button = document.createElement('button')
    button.className = 'reddit-post-machine-btn'
    button.innerHTML = '🚀 Post Machine'
    button.style.cssText = `
      background: #1976d2;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      margin: 8px;
      cursor: pointer;
      font-weight: bold;
      z-index: 9999;
      position: fixed;
      top: 10px;
      right: 10px;
    `

    button.addEventListener('click', (e) => {
      e.preventDefault()
      // Send message to extension popup
      window.postMessage({
        type: 'REDDIT_POST_MACHINE_OPEN',
        source: 'reddit-dom'
      }, '*')
    })

    document.body.appendChild(button)
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
   // RedditDOMHelper.addExtensionButton()
  })
} else {
  // RedditDOMHelper.addExtensionButton()
}

// Listen for messages from extension
window.addEventListener('message', (event) => {
  if (event.data.type === 'REDDIT_POST_MACHINE_FILL_FORM') {
    RedditDOMHelper.fillPostForm(event.data.payload)
  }
})

// Export for use by content scripts
window.RedditDOMHelper = RedditDOMHelper

// Export default BEX DOM hook
export default bexDom((bridge) => {
  console.log('Reddit Post Machine DOM script initialized')
  
  // Bridge is available for communication with content script
  window.bridge = bridge
})
// Add logic to handle user status checks and navigation
Object.assign(RedditDOMHelper, {
  qsAll(s, r = document) { try { return Array.from((r || document).querySelectorAll(s)) } catch { return [] } },

  checkAccountLocked() {
    const phrases = ["we've locked your account", "locked your account", "account suspended"]
    const pageText = document.body.textContent.toLowerCase()
    return phrases.some(phrase => pageText.includes(phrase)) ||
      this.qsAll('faceplate-banner[appearance="error"]').some(el =>
        el.textContent?.toLowerCase().includes('locked') || el.textContent?.toLowerCase().includes('suspended'))
  },

  async openUserDropdown() {
    console.log('Attempting to open user dropdown (robust)...');
    
    // 1. Check if already open (optimization)
    const openMenu = this.qsAll('[role="menu"], [role="dialog"], faceplate-dropdown-menu').find(el => 
        this.isVisible(el) && el.textContent.toLowerCase().includes('profile')
    );
    if (openMenu) {
        console.log('User menu appears to be already open');
        return true;
    }

    // 2. Try to find the button
    // We prioritize the legacy selectors but add visibility checks
    const selectors = [
        '#expand-user-drawer-button', // Common on new reddit
        '[data-testid="user-avatar"]', // New reddit
        'button[aria-label="Open user menu"]',
        'button[aria-label="User Drawer"]',
        'button[aria-label*="user"]', // Legacy fallback
        'rpl-dropdown div', // Legacy fallback (generic)
        '#user-dropdown-trigger'
    ];

    let button = null;
    for (const sel of selectors) {
        const candidates = this.qsAll(sel).concat(Array.from(document.querySelectorAll(sel))); // Check both helpers just in case
        for (const el of candidates) {
            if (this.isVisible(el)) {
                button = el;
                console.log(`Found user menu button with selector: ${sel}`);
                break;
            }
        }
        if (button) break;
    }
    
    // Deep query fallback if standard selectors failed
    if (!button) {
        button = this.deepQuery('button[aria-label*="user"], [data-testid="user-avatar"]');
    }

    if (button) {
        // Check if it says it's already expanded
        if (button.getAttribute('aria-expanded') === 'true') {
             console.log('Button says menu is already expanded');
             return true;
        }

        // Helper to check if menu is open
        const isMenuOpen = () => {
             return this.qsAll('[role="menu"], [role="dialog"], faceplate-dropdown-menu').some(el => 
                 this.isVisible(el) && el.textContent.toLowerCase().includes('profile')
             ) || button.getAttribute('aria-expanded') === 'true';
        };

        // Attempt click with retry
        for (let i = 0; i < 2; i++) {
            console.log(`Clicking user menu button (Attempt ${i+1}/2)...`);
            button.click();
            await this.sleep(2000);
            
            if (isMenuOpen()) {
                console.log('User menu confirmed open.');
                return true;
            }
            console.log('🔄 Navigation fallback: User menu not detected open, retrying...');
        }
        
        console.log('🔄 Navigation fallback: Using direct URL navigation since menu approach failed');
        return false;
    }
    
    console.log('User dropdown button not found');
    return false
  },

  async getUsername() {
    // Try to get from URL first if on user profile
    const urlMatch = window.location.pathname.match(/\/user\/([^\/]+)/)
    if (urlMatch) return 'u/' + urlMatch[1]

    if (!await this.openUserDropdown()) return null
    await this.sleep(1500)
    
    // Look for username in dropdown
    const userElement = this.qsAll('span.text-12.text-secondary-weak, [id*="user-drawer"] span, .text-12').find(el =>
      el.textContent?.trim().startsWith('u/'))
      
    if (userElement) {
      const username = userElement.textContent.trim()
      // Close dropdown
      userElement.click()
      await this.sleep(500)
      return username
    }
    return null
  },

  // Check if element is visible
  isVisible(el) {
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  },

  // Robustly find element by text content across Shadow DOMs
  deepFindByText(text, tag = '*', root = document) {
    // 1. Search in current root for matches
    // REVERSE the array to find deepest/leaf elements first
    const elements = Array.from(root.querySelectorAll(tag)).reverse();
    const ignoredTags = ['HTML', 'BODY', 'HEAD', 'SCRIPT', 'STYLE', 'NOSCRIPT'];
    
    for (const el of elements) {
        if (ignoredTags.includes(el.tagName)) continue;

        // Ensure exactish match and visibility
        // Prioritize exact match, but allow includes if it's tight
        const content = el.textContent?.trim();
        if ((content === text || (content?.includes(text) && content.length < text.length + 50)) && this.isVisible(el)) {
            return el;
        }
    }
    
    // 2. Recurse into matching Shadow DOMs
    // We must check ALL elements for shadow roots, not just 'tag' matches
    const allElements = Array.from(root.querySelectorAll('*'));
    for (const el of allElements) {
        if (el.shadowRoot) {
            const found = this.deepFindByText(text, tag, el.shadowRoot);
            if (found) return found;
        }
    }
    return null;
  },

  async navigateToUserProfile(username) {
    console.log(`Navigating to user profile... Target: ${username}`)

    // 0. Direct navigation if username is provided and we want to be safe
    // This mimics legacy behavior which was robust
    const cleanUsername = username ? username.replace('u/', '') : null;
    
    // Support multiple profile navigation flows
    
    // 1. Try "View Profile" from User Dropdown (User request)
    // We wrap clicks in try-catch to ignore AbortError/Navigation interruption
    try {
        console.log('Attempting User Dropdown -> View Profile flow')
        if (await this.openUserDropdown()) {
            await this.sleep(2000)
            
            // Robust Deep Search for "View Profile"
            const findViewProfile = (root = document) => {
                const allElements = Array.from(root.querySelectorAll('*')).reverse();
                for (const el of allElements) {
                     if (['SCRIPT', 'STYLE', 'HTML', 'BODY', 'HEAD'].includes(el.tagName)) continue;

                     const text = el.textContent?.toLowerCase().trim() || '';
                     const ariaLabel = el.getAttribute('aria-label')?.toLowerCase() || '';
                     
                     // Matches: "View Profile", "Profile", "My Profile"
                     const isProfileMatch = (text.includes('profile') || ariaLabel.includes('profile')) &&
                                            (text.includes('view') || text.includes('my') || text === 'profile');
                     
                     if (isProfileMatch) {
                          if (el.offsetParent === null && window.getComputedStyle(el).display === 'none') continue;
                          console.log('Found potential View Profile element:', el);
                          return el.closest('a, button, div[role="menuitem"]') || el;
                     }
                }
                
                // Recurse
                const all = Array.from(root.querySelectorAll('*'));
                for (const el of all) {
                    if (el.shadowRoot) {
                        const found = findViewProfile(el.shadowRoot);
                        if (found) return found;
                    }
                }
                return null;
            }

            let viewProfileEl = findViewProfile();
            
            // Check portals if not found initially
            if (!viewProfileEl) {
                 const portals = document.querySelectorAll('faceplate-portal, .portal, [id*="portal"]');
                 for (const portal of portals) {
                     const root = portal.shadowRoot || portal;
                     const found = findViewProfile(root);
                     if (found) { viewProfileEl = found; break; }
                 }
            }

            if (viewProfileEl) {
                console.log('Found "View Profile" element, clicking...', viewProfileEl)
                viewProfileEl.click()
                
                // User Request: Wait for "Overview" element to appear
                console.log('Waiting for "Overview" element to confirm profile load...');
                // We use a broader search to catch explicit "Overview" tab or URL change evidence
                const overviewEl = await this.waitForElement('[data-testid="profile-overview-tab"], a[href$="/overview/"], a[href$="/overview"]', 10000) ||
                                   await this.deepFindByText('Overview', 'a');
                
                if (overviewEl) {
                     console.log('Profile loaded (Overview detected). Waiting 2s for stability...');
                     await this.sleep(2000);
                } else {
                     console.warn('Overview element not found after click. Proceeding with caution...');
                     await this.sleep(4000); // Fallback to original sleep if detection fails
                }
                
                return true
            }
            console.log('"View Profile" link not found in dropdown.')
        }
    } catch (e) {
        console.warn('Click navigation interrupted (likely success):', e);
        return true; 
    }

    // 2. Fallback: Check if we can find a profile link directly
    try {
        const profileLink = this.deepQuery('faceplate-tracker[source="user_drawer"] a') ||
                            this.deepQuery('a[href^="/user/"][class*="avatar"]');

        if (profileLink) {
            console.log('Found alternative profile link, clicking...')
            profileLink.click()
            await this.sleep(4000)
            return true
        }
    } catch (e) {
         console.warn('Alternative link click interrupted:', e);
         return true;
    }

    // 3. Ultimate Fallback: Direct URL Navigation
    // 3. Ultimate Fallback: Direct URL Navigation
    if (cleanUsername) {
        try {
            console.log('🔄 Navigation fallback: Using direct URL navigation since menu approach failed');
            window.location.href = `https://www.reddit.com/user/${cleanUsername}`;
            await this.sleep(5000); // Wait for reload
        } catch (e) {
            console.log('🔄 Navigation fallback: URL navigation interrupted (this is normal):', e.message);
        }
        return true;
    }

    return false
  },

  async navigateToPostsTab(username) {
    console.log('Navigating to Posts tab...')
    
    // Removed early‑exit guard – always attempt to click the Posts tab, even if already on /submitted
    // This ensures a click event is fired for debugging / UI‑interaction purposes.
    // (If already on the page, the click will be a no‑op but still logged.)
    
    // Wait for profile page to be ready
    console.log('Waiting for profile page to stabilize...');
    await this.sleep(2000);
    
    // Try multiple methods to find and click the Posts tab
    
    // Method 1: Direct selector for Posts tab link
    const postsTabSelectors = [
      'a[href*="/submitted"]',
      'a[href*="/submitted/"]',
      '[data-testid="profile-posts-tab"]',
      'faceplate-tracker[noun="posts_tab"] a',
      '#profile-tab-posts_tab a',
      '#profile-tab-posts_tab'
    ];
    
    for (const selector of postsTabSelectors) {
      const tab = this.deepQuery(selector);
      if (tab && this.isVisible(tab)) {
        console.log(`Found Posts tab with selector: ${selector}, clicking...`);
        try {
          tab.click();
        } catch (e) {
          if (e.message && e.message.includes('AbortError')) {
            console.warn('Ignoring AbortError during Posts tab click (navigation interrupted):', e.message);
          } else {
            throw e;
          }
        }
        await this.sleep(3000);
        
        // Verify we navigated
        if (window.location.pathname.includes('/submitted')) {
          console.log('Successfully navigated to Posts tab via click!');
          return true;
        }
      }
    }
    
    // Method 2: Find by text content "Posts"
    console.log('Trying to find Posts tab by text content...');
    const postsTabByText = this.deepFindByText('Posts', 'a');
    if (postsTabByText && this.isVisible(postsTabByText)) {
      console.log('Found "Posts" tab by text, clicking...');
      try {
        postsTabByText.click();
      } catch (e) {
        if (e.message && e.message.includes('AbortError')) {
          console.warn('Ignoring AbortError during Posts tab text click (navigation interrupted):', e.message);
        } else {
          throw e;
        }
      }
      await this.sleep(3000);
      
      if (window.location.pathname.includes('/submitted')) {
        console.log('Successfully navigated to Posts tab via text click!');
        return true;
      }
    }
    
    // Method 3: Look for tab buttons that might contain "Posts"
    console.log('Trying to find Posts in tab buttons...');
    const allTabs = this.qsAll('a, button, [role="tab"]');
    for (const tab of allTabs) {
      const text = tab.textContent?.trim().toLowerCase() || '';
      if (text === 'posts' && this.isVisible(tab)) {
        console.log('Found Posts tab button, clicking...', tab);
        try {
          tab.click();
        } catch (e) {
          if (e.message && e.message.includes('AbortError')) {
            console.warn('Ignoring AbortError during Posts tab button click (navigation interrupted):', e.message);
          } else {
            throw e;
          }
        }
        await this.sleep(3000);
        
        if (window.location.pathname.includes('/submitted')) {
          console.log('Successfully navigated to Posts tab!');
          return true;
        }
      }
    }
    
    // Method 4: Fallback to direct URL navigation
    console.log('Could not click Posts tab, falling back to URL navigation...');
    const inferredUser = username || window.location.pathname.match(/\/user\/([^\/]+)/)?.[1];
    
    if (inferredUser) {
      const cleanUser = inferredUser.replace('u/', '');
      console.log(`Navigating directly to /user/${cleanUser}/submitted/`);
      window.location.href = `https://www.reddit.com/user/${cleanUser}/submitted/`;
      await this.sleep(4000);
      return true;
    }

    console.log('Posts tab not found and no username for fallback');
    return false;
  },

  async checkUserPosts() {
    console.log('Checking user posts with enhanced metadata extraction...')
    await this.sleep(3000)

    // Get all posts using comprehensive selectors
    const posts = this.qsAll('shreddit-post, [data-testid="post-container"], .Post, [data-testid*="post"]')
    console.log(`Found ${posts.length} posts`)

    if (posts.length > 0) {
      console.log('Raw posts found:', posts.length)
      
      // Debug: Log the first few post elements to understand structure
      posts.slice(0, 3).forEach((post, index) => {
        console.log(`Post ${index} HTML structure:`, post.outerHTML.substring(0, 500))
      })
      
      // Enhanced post data extraction with metadata
      const postsWithMetadata = posts.map(post => {
        // Extract data attributes from shreddit-post element
        const postAttributes = {
          postTitle: post.getAttribute('post-title'),
          author: post.getAttribute('author'),
          subredditPrefixedName: post.getAttribute('subreddit-prefixed-name'),
          score: post.getAttribute('score'),
          commentCount: post.getAttribute('comment-count'),
          createdTimestamp: post.getAttribute('created-timestamp'),
          postType: post.getAttribute('post-type'),
          contentHref: post.getAttribute('content-href'),
          permalink: post.getAttribute('permalink'),
          postId: post.getAttribute('id'),
          domain: post.getAttribute('domain'),
          itemState: post.getAttribute('item-state'),
          viewContext: post.getAttribute('view-context'),
          voteType: post.getAttribute('vote-type'),
          awardCount: post.getAttribute('award-count'),
          userId: post.getAttribute('user-id'),
          authorId: post.getAttribute('author-id'),
          subredditId: post.getAttribute('subreddit-id')
        }

        // Extract timestamp with multiple fallback methods
        const timestampElement = post.querySelector('time, [data-testid="post_timestamp"], faceplate-time')
        const timestamp = postAttributes.createdTimestamp ||
                          timestampElement?.getAttribute('datetime') ||
                          timestampElement?.getAttribute('created-timestamp') ||
                          post.getAttribute('created-timestamp') ||
                          timestampElement?.textContent

        // Extract post URL/ID for deletion
        const postLink = post.querySelector('a[data-testid="post-content"], a[href*="/comments/"]')
        const postUrl = postAttributes.permalink || postLink?.href || post.getAttribute('permalink')
        const postId = this.extractPostId(postAttributes.postId || postUrl)

        // Extract post title for identification
        const titleElement = post.querySelector('h3, [data-testid="post-content"], .title, [slot="title"], div[data-click-id="text"], [data-adclicklocation="title"], a[data-click-id="text"], .PostTitle, h1, h2')
        const title = postAttributes.postTitle || 
                     titleElement?.textContent?.trim() || 
                     post.getAttribute('post-title') ||
                     post.querySelector('[data-post-title]')?.textContent?.trim() ||
                     post.querySelector('a[href*="/comments/"]')?.textContent?.trim() ||
                     'Untitled Post' // Fallback to prevent filtering

        // Extract engagement metrics
        const score = postAttributes.score || '0'
        const commentCount = postAttributes.commentCount || '0'
        const awardCount = postAttributes.awardCount || '0'

        // Check post status flags
        const isRemoved = this.checkPostStatus(post, 'removed')
        const isBlocked = this.checkPostStatus(post, 'blocked')
        const isDeleted = this.checkPostStatus(post, 'deleted')

        // Check for moderator removal indicators
        const moderatorFlags = this.qsAll('[class*="moderator"], [class*="removed"], [class*="deleted"]', post)
        const hasModeratorAction = moderatorFlags.length > 0

        return {
          // Core metadata
          timestamp: timestamp || new Date().toISOString(),
          postUrl: postUrl || '',
          postId: postId || '',
          title: title,
          
          // Enhanced Reddit-specific metadata
          author: postAttributes.author || '',
          subreddit: postAttributes.subredditPrefixedName || '',
          score: parseInt(score) || 0,
          commentCount: parseInt(commentCount) || 0,
          awardCount: parseInt(awardCount) || 0,
          postType: postAttributes.postType || '',
          domain: postAttributes.domain || '',
          contentHref: postAttributes.contentHref || '',
          
          // Status and moderation
          isRemoved: isRemoved || hasModeratorAction,
          isBlocked: isBlocked,
          deleted: isDeleted,
          hasModeratorAction: hasModeratorAction,
          itemState: postAttributes.itemState || '',
          
          // Additional metadata
          viewContext: postAttributes.viewContext || '',
          voteType: postAttributes.voteType || '',
          userId: postAttributes.userId || '',
          authorId: postAttributes.authorId || '',
          subredditId: postAttributes.subredditId || ''
        }
      }).filter(post => {
        // Debug: Log what we're extracting for each post
        console.log('Post extraction debug:', {
          timestamp: post.timestamp,
          postId: post.postId, 
          postUrl: post.postUrl,
          title: post.title,
          author: post.author,
          subreddit: post.subreddit,
          score: post.score
        })
        
        // Filter out invalid posts - must have valid postId, postUrl, and title
        return post.timestamp && post.postId && post.postUrl && post.title
      })

      // Sort by timestamp (newest first)
      postsWithMetadata.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

      console.log('=== ENHANCED POSTS SUMMARY ===')
      console.log(`Total posts: ${posts.length}`)
      console.log(`Posts with valid metadata: ${postsWithMetadata.length}`)

      postsWithMetadata.forEach((post, index) => {
        console.log(`Post ${index + 1}: ${post.timestamp} | Status: ${post.isRemoved ? 'Removed' : post.isBlocked ? 'Blocked' : 'Active'} | URL: ${post.postUrl}`)
      })

      if (postsWithMetadata.length > 0) {
        const lastPost = postsWithMetadata[0]
        console.log(`Last post details:`, lastPost)
        
        // Return comprehensive data for background script analysis
        return {
          total: posts.length,
          lastPostDate: lastPost.timestamp,
          posts: postsWithMetadata,
          lastPost: lastPost // Include most recent post for easy access
        }
      }
    } else {
      console.log('No posts found')
    }

    return {
      total: 0,
      lastPostDate: null,
      posts: [],
      lastPost: null
    }
  },

  // Helper method to extract post ID from URL
  extractPostId(postUrl) {
    if (!postUrl) return null
    
    // Extract ID from Reddit URL patterns
    const patterns = [
      /\/comments\/([a-z0-9]+)/i,
      /\/r\/[^\/]+\/comments\/([a-z0-9]+)/i,
      /id=([a-z0-9]+)/i
    ]
    
    for (const pattern of patterns) {
      const match = postUrl.match(pattern)
      if (match) return match[1]
    }
    
    return null
  },

  // Helper method to check post status
  checkPostStatus(postElement, statusType) {
    const statusClasses = [
      `[class*="${statusType}"]`,
      `[class*="moderator"]`,
      `[data-testid*="${statusType}"]`,
      '.removed',
      '.deleted',
      '.blocked'
    ]
    
    // Check post element and its children for status indicators
    for (const selector of statusClasses) {
      const elements = this.qsAll(selector, postElement)
      if (elements.length > 0) {
        // Verify it's not just a class name coincidence
        const text = elements[0].textContent?.toLowerCase() || ''
        if (text.includes(statusType) || text.includes('moderator') || text.includes('removed') || text.includes('deleted')) {
          return true
        }
      }
    }
    
    // Check for specific status text patterns
    const statusTexts = [
      'removed by moderator',
      'deleted by moderator', 
      'this post has been removed',
      'post blocked',
      'moderator action'
    ]
    
    const postText = postElement.textContent?.toLowerCase() || ''
    return statusTexts.some(statusText => postText.includes(statusText))
  },

  async deleteLastPost(postData) {
    console.log('[DOM Script] Attempting to delete specific post:', postData);
    
    try {
      // Find the specific post to delete using the post data
      let targetPost = null;
      
      if (postData && postData.postId) {
        // Try to find post by ID first (most reliable)
        targetPost = document.querySelector(`shreddit-post[id="t3_${postData.postId}"]`) ||
                     document.querySelector(`[data-ks-id="t3_${postData.postId}"]`);
        console.log('[DOM Script] Looking for post by ID t3_' + postData.postId + ':', targetPost);
      }
      
      if (!targetPost && postData && postData.postUrl) {
        // Try to find post by URL as fallback
        const postLinks = document.querySelectorAll(`a[href="${postData.postUrl}"]`);
        if (postLinks.length > 0) {
          targetPost = postLinks[0].closest('shreddit-post') || 
                      postLinks[0].closest('[data-testid="post-container"]');
          console.log('[DOM Script] Looking for post by URL ' + postData.postUrl + ':', targetPost);
        }
      }
      
      if (!targetPost && postData && postData.title) {
        // Final fallback: find by title matching
        const allPosts = document.querySelectorAll('shreddit-post[id^="t3_"], [data-testid="post-container"]');
        for (const post of allPosts) {
          const titleElement = post.querySelector('a[slot="title"]') ||
                              post.querySelector('[data-testid="post-title"]') ||
                              post.querySelector('h3');
          if (titleElement && titleElement.textContent?.trim() === postData.title) {
            targetPost = post;
            console.log('[DOM Script] Found post by title matching:', postData.title);
            break;
          }
        }
      }
      
      if (!targetPost) {
        console.log('[DOM Script] Target post not found, falling back to first post in DOM');
        targetPost = document.querySelector('[data-testid="post-container"]');
      }
      
      if (!targetPost) {
        console.log('[DOM Script] No posts found on page');
        return false;
      }
      
      // Look for the post options menu (three dots)
      const optionsButton = targetPost.querySelector('button[aria-label*="Options"], button[aria-label*="More options"], [data-testid="post-dropdown"]');
      
      if (!optionsButton) {
        console.log('[DOM Script] Options button not found for target post');
        return false;
      }
      
      // Click options to open dropdown
      optionsButton.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Look for delete option in the dropdown
      const deleteButton = document.querySelector('button[aria-label*="Delete"], button:has-text("Delete"), [role="menuitem"]:has-text("Delete")');
      
      if (!deleteButton) {
        console.log('[DOM Script] Delete option not found in dropdown');
        // Close dropdown by clicking elsewhere
        document.body.click();
        return false;
      }
      
      // Click delete button
      deleteButton.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Look for confirmation dialog and click confirm
      const confirmButton = document.querySelector('button:has-text("Delete post"), button[aria-label*="Delete post"], button:has-text("Confirm delete")');
      
      if (confirmButton) {
        confirmButton.click();
        console.log('[DOM Script] Delete confirmation clicked');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      } else {
        console.log('[DOM Script] Delete confirmation button not found');
        return false;
      }
      
    } catch (error) {
      console.error('[DOM Script] Error during post deletion:', error);
      return false;
    }
  }
})

// Track processed messages to prevent duplicates
const processedMessages = new Set();

// Update message listener
window.addEventListener('message', async (event) => {
  const { type, payload } = event.data;
  
  // Skip if not our message type
  if (!type || !type.startsWith('REDDIT_POST_MACHINE_')) {
    return;
  }
  
  // Create unique message ID to prevent duplicate handling
  const messageId = `${type}-${Date.now()}`;
  
  // Debounce: Skip if we've seen a similar message very recently (within 500ms)
  const recentKey = `${type}-recent`;
  if (processedMessages.has(recentKey)) {
    return;
  }
  processedMessages.add(recentKey);
  setTimeout(() => processedMessages.delete(recentKey), 500);

  if (type === 'REDDIT_POST_MACHINE_FILL_FORM') {
    RedditDOMHelper.fillPostForm(payload);
  } else if (type === 'REDDIT_POST_MACHINE_NAVIGATE_PROFILE') {
    const success = await RedditDOMHelper.navigateToUserProfile(payload?.userName); 
    window.postMessage({ 
        type: 'REDDIT_POST_MACHINE_ACTION_RESULT', 
        action: 'NAVIGATE_PROFILE',
        success: success 
    }, '*');
  } else if (type === 'REDDIT_POST_MACHINE_NAVIGATE_POSTS') {
    const success = await RedditDOMHelper.navigateToPostsTab(payload?.userName);
    window.postMessage({ 
        type: 'REDDIT_POST_MACHINE_ACTION_RESULT', 
        action: 'NAVIGATE_POSTS',
        success: success
    }, '*');
  } else if (type === 'REDDIT_POST_MACHINE_DELETE_POST') {
    console.log('[DOM Script] Handling DELETE_POST request:', payload)
    const success = await RedditDOMHelper.deleteLastPost(payload?.post);
    window.postMessage({ 
        type: 'REDDIT_POST_MACHINE_ACTION_RESULT', 
        action: 'DELETE_POST',
        success: success,
        data: payload?.post
    }, '*');
  } else if (type === 'REDDIT_POST_MACHINE_GET_POSTS') {
    console.log('[DOM Script] Handling GET_POSTS request:', payload)
    const postsData = await RedditDOMHelper.checkUserPosts();
    window.postMessage({ 
        type: 'REDDIT_POST_MACHINE_ACTION_RESULT', 
        action: 'GET_POSTS',
        success: true,
        data: postsData
    }, '*');
  }
})