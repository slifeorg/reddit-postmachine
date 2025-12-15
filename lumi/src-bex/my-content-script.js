import { contentLogger } from "./logger.js";/**
 * Content script for Reddit Post Machine
 * Handles DOM manipulation and page interaction on Reddit
 */

// Initialize content script
contentLogger.log('Reddit Post Machine content script loaded')

// Inject dom.js into page context
function injectDomScript() {
  // Check if dom.js is already injected
  if (window.RedditDOMHelper) {
    contentLogger.log('DOM script already loaded')
    return
  }

  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('dom.js')
  script.onload = () => {
    contentLogger.log('DOM script injected successfully')
  }
  script.onerror = () => {
    contentLogger.error('Failed to inject DOM script')
  }
  document.documentElement.appendChild(script)
}

// Inject DOM script immediately
injectDomScript()

// Global error suppression for known harmless errors
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('Connection has been terminated')) {
    // Silently ignore this error – it occurs during some third‑party script loads (e.g., Stripe) and does not affect our flow
    e.stopPropagation && e.stopPropagation();
    contentLogger.warn('[Content Script] Ignored benign error:', e.message);
  }
});
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && e.reason.message && e.reason.message.includes('Connection has been terminated')) {
    contentLogger.warn('[Content Script] Ignored unhandled rejection:', e.reason.message);
    // Prevent noisy console output
    e.preventDefault && e.preventDefault();
  }
});

// Check if we're on Reddit
const isRedditPage = window.location.hostname.includes('reddit.com')

// Auto-run script routing
async function routeAutoRunScript() {
  const url = window.location.href
  const hostname = window.location.hostname

  // Exclude chat.reddit.com
  if (hostname === 'chat.reddit.com') {
    contentLogger.log('Skipping auto-run scripts on chat.reddit.com')
    return
  }

  // Check auto-run settings
  let autoRunSettings
  try {
    const result = await chrome.storage.sync.get(['autoRunSettings'])
    autoRunSettings = result.autoRunSettings || { profileDetection: true, postSubmission: true }
  } catch (error) {
    contentLogger.warn('Failed to get auto-run settings, using defaults:', error)
    autoRunSettings = { profileDetection: true, postSubmission: true }
  }

  // Check if we're already running a script to prevent duplicates
  const scriptStage = sessionStorage.getItem('reddit-post-machine-script-stage')

  // Script 1: Profile detection and data collection (only on home page and specific pages)
  const pathname = window.location.pathname
  if (autoRunSettings.profileDetection &&
      (url.includes('reddit.com') && (pathname === '/' || pathname === '/hot' || pathname === '/new' || pathname === '/popular') && !scriptStage)) {
    contentLogger.log('Auto-running profile detection script')
    sessionStorage.setItem('reddit-post-machine-script-stage', 'profile-started')
    setTimeout(() => runProfileDetectionScript(), 2000)
  }

  // Continue profile script after navigation
  if (scriptStage === 'profile-navigating' && url.includes('/u/')) {
    contentLogger.log('Continuing profile detection script after navigation')
    setTimeout(() => continueProfileDetectionScript(), 2000)
  }

  // Continue profile script after switching to posts
  if (scriptStage === 'profile-switching-to-posts' && url.includes('/submitted')) {
    contentLogger.log('Continuing profile detection script on posts page')
    setTimeout(() => continueProfileDataCollection(), 2000)
  }

  // Script 2: Post submission script
  if (autoRunSettings.postSubmission && url.includes('reddit.com/submit')) {
    contentLogger.log('Auto-running post submission script')
    setTimeout(() => runPostSubmissionScript(), 2000)
  }
}

if (isRedditPage) {
  initializeRedditIntegration()
  // Auto-run scripts disabled to prevent tab creation issues
  // routeAutoRunScript()

  // Initialize username cache from storage
  initializeUsernameCache()
}

function removeBeforeUnloadListeners() {
  contentLogger.log('Removing Reddit\'s beforeunload event listeners to prevent "Leave site?" dialog')

  // Remove window onbeforeunload handler
  window.onbeforeunload = null

  // Add our own passive beforeunload listener that prevents the dialog
  window.addEventListener('beforeunload', (e) => {
    // Prevent the default behavior and don't show any dialog
    e.preventDefault()
    e.returnValue = null
    return null
  }, true)

  contentLogger.log('Beforeunload listeners disabled successfully')
}

function initializeRedditIntegration() {
  contentLogger.log('Initializing Reddit integration')

  // Remove Reddit's beforeunload event listeners to prevent "Leave site?" dialog
  removeBeforeUnloadListeners()

  // Notify background that we are ready immediately
  chrome.runtime.sendMessage({
      type: 'CONTENT_SCRIPT_READY',
      url: window.location.href
  });

  // URL Poller for SPA navigation detection
  let lastUrl = window.location.href;
  setInterval(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          contentLogger.log('URL Changed (Poller):', currentUrl);
          chrome.runtime.sendMessage({
              type: 'URL_CHANGED',
              url: currentUrl
          }).catch(err => {
             // Ignore context invalidation during development
             if (!err.message.includes('Extension context invalidated')) {
                 contentLogger.warn('URL Poller error:', err);
             }
          });
      }
  }, 1000);

  // Add extension button to Reddit interface
  addExtensionButton()

  // Track recently processed messages to prevent duplicates
  const recentMessages = new Set();

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    contentLogger.log('Content script received message:', message)

    if (message.type === 'PING') {
      sendResponse({ pong: true, url: window.location.href })
      return true
    }

    // For START_POST_CREATION, use more specific deduplication to avoid blocking valid retries
    if (message.type === 'START_POST_CREATION') {
      const msgKey = `${message.type}-${message.userName}-${JSON.stringify(message.postData)}`;
      if (recentMessages.has(msgKey)) {
        contentLogger.log('Ignoring duplicate START_POST_CREATION message');
        sendResponse({ received: true, deduplicated: true });
        return true;
      }
      recentMessages.add(msgKey);
      setTimeout(() => recentMessages.delete(msgKey), 5000); // Longer timeout for post creation
    } else {
      // General debounce for other message types
      const msgKey = `${message.type}-recent`;
      if (recentMessages.has(msgKey)) {
        sendResponse({ received: true, deduplicated: true });
        return true;
      }
      recentMessages.add(msgKey);
      setTimeout(() => recentMessages.delete(msgKey), 500);
    }

    switch (message.type) {
      case 'REDDIT_PAGE_LOADED':
        handlePageLoaded(message.url)
        break

      case 'FILL_POST_FORM':
        fillPostForm(message.data)
        break

      case 'GET_PAGE_INFO':
        sendResponse(getPageInfo())
        break

      case 'START_POST_CREATION':
        handleStartPostCreation(message.userName, message.postData)
        break

      case 'EXTRACT_USERNAME_AND_CREATE_POST':
        handleExtractUsernameAndCreatePost()
        break

      case 'CHECK_USER_STATUS':
        handleCheckUserStatus(message.userName)
        break

      case 'DELETE_LAST_POST':
        handleDeleteLastPost(message.userName)
        break

      case 'BG_LOG':
        // Visual logging for debugging from background script
        contentLogger.log(`%c[BACKGROUND] ${message.message}`, 'color: #ff00ff; font-weight: bold;')
        break

      case 'REDDIT_POST_MACHINE_NAVIGATE_POSTS':
        contentLogger.log('[Content Script] Received command: NAVIGATE_POSTS', message)
        sendResponse({ started: true })
        window.postMessage({
          type: 'REDDIT_POST_MACHINE_NAVIGATE_POSTS',
          payload: message.payload
        }, '*')
        break

      case 'REDDIT_POST_MACHINE_GET_POSTS':
        contentLogger.log('[Content Script] Received command: GET_POSTS', message)
        sendResponse({ started: true })
        window.postMessage({
          type: 'REDDIT_POST_MACHINE_GET_POSTS',
          payload: message.payload
        }, '*')
        break

      case 'REDDIT_POST_MACHINE_NAVIGATE_PROFILE':
        contentLogger.log('[Content Script] Received command: NAVIGATE_PROFILE', message)
        sendResponse({ started: true })
        handleCheckUserStatus(message.payload.userName)
        break

      case 'REDDIT_POST_MACHINE_DELETE_POST':
        contentLogger.log('[Content Script] Received command: DELETE_POST', message)
        sendResponse({ started: true })
        window.postMessage({
          type: 'REDDIT_POST_MACHINE_DELETE_POST',
          payload: message.payload
        }, '*')
        break

      case 'MANUAL_TRIGGER_SCRIPT':
        contentLogger.log('[Content Script] Received manual trigger:', message)
        handleManualScriptTrigger(message.scriptType, message.mode)
        sendResponse({ started: true })
        break

      case 'GET_FRESH_POSTS_FOR_DECISION':
        contentLogger.log('[Content Script] Received GET_FRESH_POSTS_FOR_DECISION:', message)
        handleGetFreshPostsForDecision(message.userName)
        sendResponse({ started: true })
        break

      default:
        contentLogger.warn('Unknown message type:', message.type)
    }

    return true
  })
}

function addExtensionButton() {
  // Look for the submit post button or create post area
  const submitArea = document.querySelector('[data-testid="submit-page"]') ||
                    document.querySelector('.submit-page') ||
                    document.querySelector('#newlink')

  if (submitArea && !document.querySelector('.reddit-post-machine-btn')) {
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
    `

    button.addEventListener('click', (e) => {
      e.preventDefault()
      openExtensionPopup()
    })

    // Insert the button
    submitArea.insertBefore(button, submitArea.firstChild)
    contentLogger.log('Reddit Post Machine button added')
  }
}

function openExtensionPopup() {
  // Send message to background script to open extension
  chrome.runtime.sendMessage({
    type: 'OPEN_EXTENSION',
    source: 'content-script'
  })
}

function handlePageLoaded(url) {
  contentLogger.log('Reddit page loaded:', url)

  // Re-add button if needed (in case page was dynamically loaded)
  setTimeout(() => {
    addExtensionButton()
  }, 1000)

  // Check if we're on the submit page and have post data to continue
  if (url.includes('reddit.com/submit')) {
    contentLogger.log('On submit page, checking for post data')

    const storedPostData = sessionStorage.getItem('reddit-post-machine-postdata')
    if (storedPostData) {
      const postData = JSON.parse(storedPostData)
      contentLogger.log('Found stored post data, continuing post creation:', postData)

      // Extract username from post data or use a default
      const userName = postData.userName || 'User'

      // Show welcome message and fill form
      showWelcomeMessage(userName)
      setTimeout(() => fillPostForm(postData), 1000)
    } else {
      contentLogger.log('No stored post data found')
    }
  }
}

function fillPostForm(data) {
  contentLogger.log('Starting post creation with working logic:', data)

  // Use the working post creation logic
  createPostWithWorkingCode(data)
}

// Working post creation logic from postm-page.js
async function createPostWithWorkingCode(postData) {
  contentLogger.log('Creating post with working logic...')

  // Remove beforeunload listeners to prevent "Leave site?" dialog
  removeBeforeUnloadListeners()

  if (!window.location.href.includes('/submit')) {
    contentLogger.log('Redirecting to submission page...')
    window.location.href = 'https://www.reddit.com/submit'
    await sleep(5000)
  }

  contentLogger.log('Waiting for post creation page to load...')
  await sleep(2000)

  // Remove beforeunload listeners again after page load
  removeBeforeUnloadListeners()

  contentLogger.log('=== STEP 1: TEXT TAB - Filling title ===')
  if (await clickTab('TEXT')) {
    await fillTitle(postData.title)
  } else {
    contentLogger.log('Cannot proceed without TEXT tab')
    return false
  }

  contentLogger.log('=== STEP 2: LINK TAB - Filling URL ===')
  if (await clickTab('LINK')) {
    await fillUrl(postData.url)
  } else {
    contentLogger.log('Cannot proceed without LINK tab')
    return false
  }

  contentLogger.log('=== STEP 3: Activating Post button by clicking body field ===')
  await clickBodyField()
  await sleep(1000)

  contentLogger.log('=== STEP 4: Filling body text ===')
  await fillBodyText(postData.body || postData.description)

  contentLogger.log('=== STEP 5: Final activation click on body field ===')
  await clickBodyField()
  await sleep(1000)

  contentLogger.log('=== STEP 6: Clicking Post button ===')
  const postClicked = await clickPostButton()

  if (postClicked) {
    contentLogger.log('Post button clicked, waiting for response...')

    // Monitor for submission completion for up to 30 seconds
    const startTime = Date.now()
    const timeout = 30000 // 30 seconds

    while (Date.now() - startTime < timeout) {
      await sleep(1000)

      // Check if we've been redirected away from submit page (success)
      if (!window.location.href.includes('/submit')) {
        contentLogger.log('SUCCESS: Redirected from submission page - post submitted!')

        // Notify background that post creation is complete
        chrome.runtime.sendMessage({
          type: 'ACTION_COMPLETED',
          action: 'POST_CREATION_COMPLETED',
          success: true
        }).catch(err => {
          contentLogger.warn('Failed to notify background of completion:', err)
        })

        return true
      }

      // Check for error messages (post rejected)
      const errorMessages = qsAll('[role="alert"], .error-message, [class*="error"], [class*="moderator"]')
      for (const error of errorMessages) {
        const text = error.textContent?.toLowerCase() || ''
        if (text.includes('rule') || text.includes('violation') || text.includes('remove')) {
          contentLogger.log('Post rejected due to rule violations:', text.substring(0, 100))

          // Notify background that post creation failed
          chrome.runtime.sendMessage({
            type: 'ACTION_COMPLETED',
            action: 'POST_CREATION_COMPLETED',
            success: false,
            error: 'Post rejected due to rule violations'
          }).catch(err => {
            contentLogger.warn('Failed to notify background of failure:', err)
          })

          return false
        }
      }

      // Check if post is still being processed (loading states)
      const loadingElements = qsAll('[data-testid*="loading"], .loading, [class*="loading"], [aria-busy="true"]')
      if (loadingElements.length > 0) {
        contentLogger.log('Post still being processed...')
        continue
      }
    }

    // Timeout reached - unclear what happened
    contentLogger.log('Post submission timeout - status unclear')

    // Notify background of timeout
    chrome.runtime.sendMessage({
      type: 'ACTION_COMPLETED',
      action: 'POST_CREATION_COMPLETED',
      success: false,
      error: 'Post submission timeout'
    }).catch(err => {
      contentLogger.warn('Failed to notify background of timeout:', err)
    })

    return false

  } else {
    contentLogger.log('FAILED: Could not click Post button')

    // Notify background that post creation failed
    chrome.runtime.sendMessage({
      type: 'ACTION_COMPLETED',
      action: 'POST_CREATION_COMPLETED',
      success: false,
      error: 'Could not click Post button'
    }).catch(err => {
      contentLogger.warn('Failed to notify background of button failure:', err)
    })

    return false
  }
}

// Click tab function from working code
async function clickTab(tabValue) {
  contentLogger.log(`Clicking tab with data-select-value="${tabValue}"`)
  const tab = deepQuery(`[data-select-value="${tabValue}"]`)
  if (tab) {
    tab.click()
    await sleep(1000)
    return true
  }
  contentLogger.log(`Tab with data-select-value="${tabValue}" not found`)
  return false
}

// Fill title function from working code
async function fillTitle(title) {
  contentLogger.log('Filling title...')
  const titleInputElement = deepQuery('faceplate-textarea-input[name="title"]')
  if (titleInputElement) {
    const shadowRoot = titleInputElement.shadowRoot
    if (shadowRoot) {
      const titleInput = shadowRoot.querySelector('#innerTextArea')
      if (titleInput) {
        titleInput.focus()
        await sleep(200)
        titleInput.value = title || "Cute sphynx babies capture your heart"
        titleInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
        titleInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
        contentLogger.log('Title set')
        await sleep(500)
        return true
      }
    }
  }
  contentLogger.log('Failed to fill title')
  return false
}

// Fill URL function from working code
async function fillUrl(url) {
  contentLogger.log('Filling URL...')
  const urlInputElement = deepQuery('faceplate-textarea-input[name="link"]')
  if (urlInputElement) {
    const shadowRoot = urlInputElement.shadowRoot
    if (shadowRoot) {
      const urlInput = shadowRoot.querySelector('#innerTextArea')
      if (urlInput) {
        const targetUrl = url || 'https://youtube.com/shorts/0xmhrS_VNNY?si=awYc8i5YljycesXq'
        urlInput.focus()
        await sleep(200)
        urlInput.value = targetUrl
        urlInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
        urlInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
        contentLogger.log('URL set')
        await sleep(500)
        return true
      }
    }
  }
  contentLogger.log('Failed to fill URL')
  return false
}

// Click body field function from working code
async function clickBodyField() {
  contentLogger.log('Clicking body text field to activate Post button...')

  const bodyComposer = deepQuery('shreddit-composer[name="optionalBody"]')
  if (bodyComposer) {
    const bodyEditable = bodyComposer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]')
    if (bodyEditable) {
      contentLogger.log('Found Lexical editor, clicking to activate Post button...')

      bodyEditable.click()
      await sleep(100)
      bodyEditable.focus()
      await sleep(100)
      bodyEditable.click()

      bodyEditable.dispatchEvent(new Event('focus', { bubbles: true, cancelable: true }))
      bodyEditable.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }))

      await sleep(1000)
      return true
    }
  }

  contentLogger.log('Body text field not found')
  return false
}

// Fill body text function from working code
async function fillBodyText(bodyText) {
  contentLogger.log('Filling body text...')

  const bodyComposer = deepQuery('shreddit-composer[name="optionalBody"]')
  if (bodyComposer) {
    const bodyEditable = bodyComposer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]')
    if (bodyEditable) {
      contentLogger.log('Found Lexical editor, setting text...')

      bodyEditable.focus()
      await sleep(200)

      bodyEditable.innerHTML = '<p><br></p>'

      const text = bodyText || "#shorts  #sphynx #missmermaid #kitten #cat"

      for (let i = 0; i < text.length; i++) {
        const char = text[i]

        bodyEditable.dispatchEvent(new KeyboardEvent('keydown', {
          key: char,
          code: char === ' ' ? 'Space' : `Key${char.toUpperCase()}`,
          keyCode: char.charCodeAt(0),
          which: char.charCodeAt(0),
          bubbles: true,
          cancelable: true
        }))

        if (document.execCommand && document.execCommand('insertText', false, char)) {
        } else {
          const selection = window.getSelection()
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            range.deleteContents()
            const textNode = document.createTextNode(char)
            range.insertNode(textNode)
            range.setStartAfter(textNode)
            range.setEndAfter(textNode)
            selection.removeAllRanges()
            selection.addRange(range)
          }
        }

        bodyEditable.dispatchEvent(new InputEvent('input', {
          inputType: 'insertText',
          data: char,
          bubbles: true,
          cancelable: true
        }))

        bodyEditable.dispatchEvent(new KeyboardEvent('keyup', {
          key: char,
          code: char === ' ' ? 'Space' : `Key${char.toUpperCase()}`,
          keyCode: char.charCodeAt(0),
          which: char.charCodeAt(0),
          bubbles: true,
          cancelable: true
        }))

        await sleep(5)
      }

      bodyEditable.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))

      contentLogger.log('Body text set successfully')
      await sleep(500)
      return true
    }
  }

  contentLogger.log('Failed to find body editor')
  return false
}

// Click post button function from working code
async function clickPostButton() {
  contentLogger.log('Clicking Post button...')

  // Remove beforeunload listeners right before posting to prevent dialog
  removeBeforeUnloadListeners()

  const checkButtonActive = () => {
    const innerButton = deepQuery('#inner-post-submit-button')
    if (innerButton) {
      const isDisabled = innerButton.disabled || innerButton.getAttribute('aria-disabled') === 'true'
      contentLogger.log('Inner post button active:', !isDisabled)
      return !isDisabled
    }

    const postContainer = deepQuery('r-post-form-submit-button#submit-post-button')
    if (postContainer && postContainer.shadowRoot) {
      const shadowButton = postContainer.shadowRoot.querySelector('button')
      if (shadowButton) {
        const isShadowDisabled = shadowButton.disabled || shadowButton.getAttribute('aria-disabled') === 'true'
        contentLogger.log('Shadow post button active:', !isShadowDisabled)
        return !isShadowDisabled
      }
    }

    return false
  }

  const startTime = Date.now()
  while (Date.now() - startTime < 10000) {
    if (checkButtonActive()) {
      break
    }
    await sleep(500)
  }

  const innerPostButton = deepQuery('#inner-post-submit-button')
  if (innerPostButton && !innerPostButton.disabled) {
    contentLogger.log('Found active inner post button, clicking...')
    innerPostButton.click()
    return true
  }

  const postContainer = deepQuery('r-post-form-submit-button#submit-post-button')
  if (postContainer) {
    contentLogger.log('Found post container')

    if (postContainer.shadowRoot) {
      const shadowButton = postContainer.shadowRoot.querySelector('button')
      if (shadowButton && !shadowButton.disabled) {
        contentLogger.log('Found active button in shadow DOM, clicking...')
        shadowButton.click()
        return true
      }
    }

    contentLogger.log('Clicking post container directly')
    postContainer.click()
    return true
  }

  const alternativeSelectors = [
    'button[type="submit"]',
    '[data-testid="submit-post"]',
    'button:contains("Post")',
    '.post-button'
  ]

  for (const selector of alternativeSelectors) {
    const button = deepQuery(selector)
    if (button && (button.textContent?.toLowerCase().includes('post') || button.textContent?.toLowerCase().includes('submit'))) {
      contentLogger.log(`Found post button with selector: ${selector}, clicking...`)
      button.click()
      return true
    }
  }

  contentLogger.log('Post button not found with any selector')
  return false
}

function selectSubreddit(subreddit) {
  // Try to find and select the subreddit
  const subredditSelect = document.querySelector('[data-testid="subreddit-selector"]') ||
                         document.querySelector('.subreddit-input')

  if (subredditSelect) {
    // Handle different types of subreddit selectors
    if (subredditSelect.tagName === 'SELECT') {
      // Dropdown select
      const option = Array.from(subredditSelect.options).find(opt =>
        opt.text.toLowerCase().includes(subreddit.toLowerCase())
      )
      if (option) {
        subredditSelect.value = option.value
        subredditSelect.dispatchEvent(new Event('change', { bubbles: true }))
      }
    } else if (subredditSelect.tagName === 'INPUT') {
      // Input field
      subredditSelect.value = subreddit
      subredditSelect.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }
}

function getPageInfo() {
  const url = window.location.href
  const hostname = window.location.hostname
  const pathname = window.location.pathname

  // Detect page type
  let pageType = 'unknown'
  if (pathname.includes('/submit')) {
    pageType = 'submit'
  } else if (pathname.includes('/r/')) {
    pageType = 'subreddit'
  } else if (pathname === '/' || pathname === '/hot' || pathname === '/new') {
    pageType = 'home'
  }

  // Get current subreddit if on subreddit page
  let currentSubreddit = null
  const subredditMatch = pathname.match(/\/r\/([^\/]+)/)
  if (subredditMatch) {
    currentSubreddit = subredditMatch[1]
  }

  return {
    url,
    hostname,
    pathname,
    pageType,
    currentSubreddit,
    isLoggedIn: checkIfLoggedIn()
  }
}

// Helper functions from working code
function qs(s, r = document) {
  try {
    return (r || document).querySelector(s)
  } catch {
    return null
  }
}

function qsAll(s, r = document) {
  try {
    return Array.from((r || document).querySelectorAll(s))
  } catch {
    return []
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// Deep query function for shadow DOM support (from working code)
function deepQuery(selector, root = document) {
  const el = root.querySelector(selector);
  if (el) return el;
  for (const elem of root.querySelectorAll('*')) {
    if (elem.shadowRoot) {
      const found = deepQuery(selector, elem.shadowRoot);
      if (found) return found;
    }
  }
  return null;
}

// Wait for element with timeout
async function waitForElement(selector, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const element = deepQuery(selector);
    if (element) return element;
    await sleep(100);
  }
  return null;
}

async function waitForElements(selector, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) return Array.from(elements);
    await sleep(100);
  }
  return [];
}

async function openUserDropdown() {
  contentLogger.log('Opening user dropdown...')

  // Try multiple selectors for the user avatar/dropdown button
  const selectors = [
    'rpl-dropdown div',
    '[data-testid="user-avatar"]',
    'button[aria-label*="user"]',
    '#expand-user-drawer-button',
    'button[data-testid="user-menu-trigger"]',
    '[data-click-id="profile"]',
    'button[id*="user-dropdown"]',
    'button[aria-haspopup="true"]',
    '.header-user-dropdown',
    'button[aria-label*="User"]',
    'button[title*="profile"]'
  ]

  for (const selector of selectors) {
    const avatarButton = qs(selector)
    if (avatarButton) {
      contentLogger.log(`Found avatar button with selector: ${selector}`)
      contentLogger.log('Avatar button element:', avatarButton)
      avatarButton.click()
      await sleep(2000)
      return true
    }
  }

  contentLogger.log('Avatar button not found with any selector')

  // Log all buttons to help debug
  const allButtons = document.querySelectorAll('button')
  contentLogger.log('All buttons on page:', allButtons.length)
  allButtons.forEach((btn, i) => {
    if (i < 10) { // Log first 10 buttons
      contentLogger.log(`Button ${i}:`, btn.outerHTML.substring(0, 200))
    }
  })

  return false
}

// Cache variables to prevent unnecessary re-extractions
let cachedUsername = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Initialize cache from storage on script load
async function initializeUsernameCache() {
  try {
    const storedUser = await getStoredUsername()
    if (storedUser && storedUser.seren_name) {
      cachedUsername = storedUser.seren_name
      cacheTimestamp = storedUser.timestamp || Date.now()
      contentLogger.log(`Initialized cache from storage: ${cachedUsername}`)
    }
  } catch (error) {
    contentLogger.warn('Failed to initialize username cache:', error)
  }
}

// Get authenticated username from user dropdown/avatar (shows YOUR username)
async function getAuthenticatedUsername() {
  // Check cache first
  if (cachedUsername && Date.now() - cacheTimestamp < CACHE_DURATION) {
    contentLogger.log(`Using cached authenticated username: ${cachedUsername}`)
    return cachedUsername
  }

  // Try to get username from user dropdown without opening it
  const authSelectors = [
    'button[id*="user-dropdown"] [class*="text-12"]',
    '[data-testid="user-menu-trigger"] span[class*="text-12"]',
    '.header-user-dropdown [class*="text-12"]',
    'button[aria-label*="User"] span[class*="text-12"]'
  ]

  for (const selector of authSelectors) {
    const element = qs(selector)
    if (element) {
      const text = element.textContent?.trim()
      if (text && text.startsWith('u/')) {
        // Update cache
        cachedUsername = text
        cacheTimestamp = Date.now()
        return text
      }
    }
  }

  // If not found, try opening dropdown and getting username
  if (await openUserDropdown()) {
    // Wait longer for dropdown to fully load and use waitForElement
    await sleep(2000)

    const dropdownSelectors = [
      'span.text-12.text-secondary-weak',
      '[id*="user-drawer"] span[class*="text-12"]',
      '.text-12'
    ]

    for (const selector of dropdownSelectors) {
      // Wait for elements to appear
      const elements = await waitForElements(selector, 3000)
      for (const element of elements) {
        const text = element.textContent?.trim()
        if (text && text.startsWith('u/')) {
          // Close dropdown by clicking outside
          document.body.click()
          await sleep(500)

          // Update cache
          cachedUsername = text
          cacheTimestamp = Date.now()
          return text
        }
      }
    }
  }

  return null
}

// Check if we're on our own profile page vs someone else's
async function isOwnProfilePage(username) {
  // Try to find edit profile button or other indicators this is our profile
  const ownProfileIndicators = [
    'button[data-testid="edit-profile-button"]',
    'a[href*="/settings/profile"]',
    'a[href*="/r/ModTool"]',
    '[data-click-id="user_profile"]'
  ]

  for (const selector of ownProfileIndicators) {
    const element = qs(selector)
    if (element) {
      contentLogger.log('Found own profile indicator, this is our profile')
      return true
    }
  }

  // Check button text content for "Edit" indicators
  const buttons = document.querySelectorAll('button')
  for (const button of buttons) {
    const text = button.textContent?.trim().toLowerCase()
    if (text && (text.includes('edit profile') || text.includes('edit flair'))) {
      contentLogger.log('Found edit profile button by text content, this is our profile')
      return true
    }
  }

  // Check if cached authenticated username matches URL username (avoid recursive call)
  if (cachedUsername && Date.now() - cacheTimestamp < CACHE_DURATION) {
    const cleanAuthUsername = cachedUsername.replace('u/', '')
    return cleanAuthUsername === username
  }

  return false
}

// Global detection lock to prevent concurrent extractions
let isExtractingUsername = false

async function extractUsernameFromPage() {
  contentLogger.log('Extracting username from Reddit page using multiple methods...')

  // Prevent concurrent extractions
  if (isExtractingUsername) {
    contentLogger.log('Username extraction already in progress, skipping...')
    return null
  }

  isExtractingUsername = true

  try {
  // Method 1: Prioritize authenticated user indicators (dropdown/avatar)
  // These show YOUR username, not just any username on the page
  const authUsername = await getAuthenticatedUsername()
  if (authUsername) {
    contentLogger.log(`Found authenticated username: ${authUsername}`)
    await storeUsernameInStorage(authUsername)
    return authUsername
  }

  // Method 2: Only check URL if we're on our own profile page
  // (This requires additional validation to ensure it's our profile)
  const urlMatch = window.location.pathname.match(/\/u\/([^\/]+)/)
  if (urlMatch && await isOwnProfilePage(urlMatch[1])) {
    const username = `u/${urlMatch[1]}`
    contentLogger.log(`Found username from own profile URL: ${username}`)
    await storeUsernameInStorage(username)
    return username
  }

  // Method 3: Generic page element scanning as final fallback
  // (Only used if authenticated detection fails)
  const usernameSelectors = [
    'span[id*="user-"]',
    '[data-testid*="user"]',
    'a[href*="/u/"]',
    '.header-user-dropdown .text-12',
    '[aria-label*="u/"]'
  ]

  for (const selector of usernameSelectors) {
    const elements = qsAll(selector)
    for (const element of elements) {
      const text = element.textContent?.trim() || element.getAttribute('aria-label') || element.href
      if (text && text.includes('u/')) {
        const match = text.match(/u\/([a-zA-Z0-9_-]+)/)
        if (match) {
          const username = `u/${match[1]}`
          contentLogger.log(`Found username from page element fallback: ${username}`)
          // Only store if not already cached to prevent overwriting with wrong user
          if (!cachedUsername) {
            await storeUsernameInStorage(username)
          }
          return username
        }
      }
    }
  }

  // Method 3: Fallback - navigate to profile page to extract username
  contentLogger.log('All methods failed, trying profile page navigation fallback...')
  return await tryProfilePageFallback()

  } finally {
    isExtractingUsername = false
  }
}

// Fallback method - navigate to profile page to extract username
async function tryProfilePageFallback() {
  contentLogger.log('Attempting profile page navigation fallback...')

  // First, try to find any link to user profile in the current page
  const profileLinks = document.querySelectorAll('a[href*="/user/"], a[href*="/u/"]')
  if (profileLinks.length > 0) {
    // Get the first profile link (likely our own)
    const profileUrl = profileLinks[0].href
    contentLogger.log(`Found profile link: ${profileUrl}`)

    // Extract username from URL
    const urlMatch = profileUrl.match(/\/(user|u)\/([^\/]+)/)
    if (urlMatch) {
      const username = `u/${urlMatch[2]}`
      contentLogger.log(`Extracted username from profile link: ${username}`)
      await storeUsernameInStorage(username)
      return username
    }
  }

  // If no profile link found, try opening dropdown again with longer wait
  contentLogger.log('No profile link found, trying dropdown with extended wait...')
  if (await openUserDropdown()) {
    await sleep(3000) // Wait 3 seconds for dropdown to fully load

    const dropdownSelectors = [
      'span.text-12.text-secondary-weak',
      '[id*="user-drawer"] span[class*="text-12"]',
      '.text-12'
    ]

    for (const selector of dropdownSelectors) {
      const elements = await waitForElements(selector, 5000)
      for (const element of elements) {
        const text = element.textContent?.trim()
        if (text && text.startsWith('u/')) {
          document.body.click() // Close dropdown
          await sleep(500)

          cachedUsername = text
          cacheTimestamp = Date.now()
          await storeUsernameInStorage(text)
          contentLogger.log(`Found username with extended wait: ${text}`)
          return text
        }
      }
    }
  }

  contentLogger.log('Could not extract username using any method')
  return null
}

// Store seren_name (username) in Chrome storage
async function storeUsernameInStorage(username) {
  try {
    const data = {
      seren_name: username,
      timestamp: Date.now(),
      pageUrl: window.location.href
    }

    // Store in chrome.storage.sync for cross-device sync
    await chrome.storage.sync.set({ redditUser: data })
    contentLogger.log(`Stored seren_name in Chrome storage: ${username}`)

    // Also store in local storage as backup
    await chrome.storage.local.set({ redditUser: data })

    // Notify background script about the username update
    await chrome.runtime.sendMessage({
      type: 'USERNAME_STORED',
      username: username,
      timestamp: Date.now()
    })
  } catch (error) {
    contentLogger.error('Failed to store username in Chrome storage:', error)
  }
}

// Retrieve seren_name from Chrome storage
async function getStoredUsername() {
  try {
    // Try sync storage first, fallback to local storage
    const syncResult = await chrome.storage.sync.get(['redditUser'])
    if (syncResult.redditUser && syncResult.redditUser.seren_name) {
      contentLogger.log(`Retrieved seren_name from sync storage: ${syncResult.redditUser.seren_name}`)
      return syncResult.redditUser
    }

    const localResult = await chrome.storage.local.get(['redditUser'])
    if (localResult.redditUser && localResult.redditUser.seren_name) {
      contentLogger.log(`Retrieved seren_name from local storage: ${localResult.redditUser.seren_name}`)
      return localResult.redditUser
    }

    contentLogger.log('No stored username found')
    return null
  } catch (error) {
    contentLogger.error('Failed to retrieve username from Chrome storage:', error)
    return null
  }
}

function checkIfLoggedIn() {
  contentLogger.log('Checking if user is logged in using proven method...')

  // Look for the avatar button that would indicate logged in state
  const avatarButton = qs('rpl-dropdown div, [data-testid="user-avatar"], button[aria-label*="user"], #expand-user-drawer-button')

  if (avatarButton) {
    contentLogger.log('Found user avatar button - user is logged in')
    return true
  }

  // Also check for login/signup buttons which would indicate NOT logged in
  const loginButtons = qsAll('a[href*="login"], button[title*="Log In"], a[href*="register"]')
  if (loginButtons.length > 0) {
    contentLogger.log('Found login buttons - user is not logged in')
    return false
  }

  contentLogger.log('Could not determine login status')
  return false
}

async function handleExtractUsernameAndCreatePost() {
  contentLogger.log('Extracting username and creating post...')

  // Check if user is logged in
  if (!checkIfLoggedIn()) {
    contentLogger.log('User is not logged in to Reddit')
    showLoginMessage()
    return
  }

  // Extract username (this is now async)
  const username = await extractUsernameFromPage()

  if (username) {
    contentLogger.log(`Extracted username: ${username}`)
    // Store the username for later use
    sessionStorage.setItem('reddit-post-machine-username', username)
  } else {
    contentLogger.log('Could not extract username from page')
    showUsernameNotFoundMessage()
    return
  }
}

function showLoginMessage() {
  const messageDiv = createMessageDiv('⚠️', 'Please Log In', 'You need to be logged in to Reddit to create posts.', '#f57c00')
  showTemporaryMessage(messageDiv)
}

function showUsernameNotFoundMessage() {
  const messageDiv = createMessageDiv('❓', 'Username Not Found', 'Could not detect your Reddit username. Please make sure you are logged in.', '#d32f2f')
  showTemporaryMessage(messageDiv)
}

function createMessageDiv(icon, title, message, color) {
  const messageDiv = document.createElement('div')
  messageDiv.className = 'reddit-post-machine-message'
  messageDiv.innerHTML = `
    <div style="
      background: ${color};
      color: white;
      padding: 16px;
      margin: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 10000;
      min-width: 300px;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 24px;">${icon}</div>
        <div>
          <div style="font-weight: bold; font-size: 16px;">${title}</div>
          <div style="font-size: 14px; opacity: 0.9;">${message}</div>
        </div>
      </div>
    </div>
  `
  return messageDiv
}

function showTemporaryMessage(messageDiv) {
  document.body.appendChild(messageDiv)

  // Auto-remove after 4 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out'
      messageDiv.style.opacity = '0'
      messageDiv.style.transform = 'translateX(-100%)'
      setTimeout(() => messageDiv.remove(), 500)
    }
  }, 4000)
}

// Auto-run Script 1: Profile Detection and Data Collection
async function runProfileDetectionScript() {
  contentLogger.log('=== PROFILE DETECTION SCRIPT STARTED ===')

  try {
    // Detect username
    const username = await extractUsernameFromPage()
    if (!username) {
      contentLogger.log('Profile script: Could not detect username')
      sessionStorage.removeItem('reddit-post-machine-script-stage')
      return
    }

    contentLogger.log(`Profile script: Detected username ${username}`)

    // Navigate to profile page if not already there
    if (!window.location.href.includes(username.replace('u/', ''))) {
      contentLogger.log(`Profile script: Navigating to ${username} profile`)
      sessionStorage.setItem('reddit-post-machine-script-stage', 'profile-navigating')
      window.location.href = `https://www.reddit.com/${username}`
      return
    }

    // Switch to posts tab
    await switchToPostsTab()

    // Capture data from posts page
    const postsData = await capturePostsData(username)

    // Store in Chrome storage
    await storeProfileData(username, postsData)

    // Clear script stage
    sessionStorage.removeItem('reddit-post-machine-script-stage')

    contentLogger.log('=== PROFILE DETECTION SCRIPT COMPLETED ===')

  } catch (error) {
    contentLogger.error('Profile detection script error:', error)
    sessionStorage.removeItem('reddit-post-machine-script-stage')
  }
}

async function switchToPostsTab() {
  contentLogger.log('Switching to posts tab...')

  const postsTabSelectors = [
    'a[href*="/submitted"]',
    'button[data-tab="posts"]',
    'a:contains("Posts")',
    'span:contains("Posts")',
    '[data-testid="posts-tab"]'
  ]

  for (const selector of postsTabSelectors) {
    const element = qs(selector)
    if (element) {
      contentLogger.log(`Found posts tab with selector: ${selector}`)
      element.click()
      await sleep(2000)
      return true
    }
  }

  // Try to navigate directly to posts URL
  const currentUrl = window.location.href
  const usernameMatch = currentUrl.match(/\/u\/([^\/]+)/)
  if (usernameMatch) {
    const postsUrl = `https://www.reddit.com/u/${usernameMatch[1]}/submitted`
    contentLogger.log(`Navigating directly to posts URL: ${postsUrl}`)
    sessionStorage.setItem('reddit-post-machine-script-stage', 'profile-switching-to-posts')
    window.location.href = postsUrl
    return true
  }

  contentLogger.log('Could not find posts tab')
  return false
}

async function capturePostsData(username) {
  contentLogger.log('Capturing posts data...')

  const posts = []
  let attempts = 0
  const maxAttempts = 10

  // Wait for posts to load with timeout mechanism
  while (attempts < maxAttempts && posts.length === 0) {
    const postElements = document.querySelectorAll('[data-testid="post-container"], article, div[data-click-id="text"]')

    for (const element of postElements.slice(0, 10)) { // Limit to first 10 posts
      try {
        const titleElement = element.querySelector('h3, [data-testid="post-title"], a[href*="/comments/"]')
        const scoreElement = element.querySelector('[data-testid="post-vote-score"], div:contains("vote")')
        const commentsElement = element.querySelector('a[href*="/comments/"] span')
        const linkElement = element.querySelector('a[href*="/comments/"]')

        if (titleElement) {
          const post = {
            title: titleElement.textContent?.trim() || '',
            score: scoreElement?.textContent?.trim() || '0',
            comments: commentsElement?.textContent?.trim() || '0',
            url: linkElement?.href || '',
            timestamp: Date.now(),
            username: username
          }
          posts.push(post)
        }
      } catch (error) {
        contentLogger.warn('Error parsing post element:', error)
      }
    }

    if (posts.length === 0) {
      contentLogger.log(`No posts found, attempt ${attempts + 1}/${maxAttempts}`)
      await sleep(1000)
      attempts++
    }
  }

  contentLogger.log(`Captured ${posts.length} posts`)
  return posts
}

async function storeProfileData(username, postsData) {
  try {
    const profileData = {
      username: username,
      posts: postsData,
      lastUpdated: Date.now(),
      pageUrl: window.location.href
    }

    // Store in Chrome storage
    await chrome.storage.local.set({ redditProfileData: profileData })
    await chrome.storage.sync.set({ redditProfileData: profileData })

    contentLogger.log(`Stored profile data for ${username} with ${postsData.length} posts`)

    // Notify background script
    chrome.runtime.sendMessage({
      type: 'PROFILE_DATA_STORED',
      username: username,
      postsCount: postsData.length
    }).catch(() => {})

  } catch (error) {
    contentLogger.error('Failed to store profile data:', error)
  }
}

// Auto-run Script 2: Post Submission Script
async function runPostSubmissionScript() {
  contentLogger.log('=== POST SUBMISSION SCRIPT STARTED ===')

  try {
    // Check if this tab was created by background script to prevent duplicate execution
    const tabStateResponse = await chrome.runtime.sendMessage({
      type: 'GET_TAB_STATE'
    })

    if (tabStateResponse.success && tabStateResponse.isBackgroundPostTab) {
      contentLogger.log('Skipping auto-run post submission - this tab was created by background script')
      return
    }

    // Ensure page is fully loaded and operable
    await ensureSubmitPageReady()

    // Fetch post data (using existing stubs)
    const postData = await fetchPostDataForSubmission()
    if (!postData) {
      contentLogger.log('Post submission script: No post data available')
      return
    }

    contentLogger.log('Post submission script: Got post data:', postData.title)

    // Fill fields one by one
    await fillPostFieldsSequentially(postData)

    // Press submit
    const submitSuccess = await submitPost()

    if (submitSuccess) {
      contentLogger.log('Post submitted successfully, waiting 10 seconds...')
      await sleep(10000)

      // Clear post data to prevent reuse
      sessionStorage.removeItem('reddit-post-machine-postdata')

      // Close tab
      contentLogger.log('Closing tab after successful submission')
      chrome.runtime.sendMessage({
        type: 'CLOSE_CURRENT_TAB'
      }).catch(() => {
        // Fallback: try to close window
        window.close()
      })
    } else {
      contentLogger.log('Post submission failed')
      // Clear post data even on failure to prevent retry loops
      sessionStorage.removeItem('reddit-post-machine-postdata')
    }

    contentLogger.log('=== POST SUBMISSION SCRIPT COMPLETED ===')

  } catch (error) {
    contentLogger.error('Post submission script error:', error)
  }
}

async function ensureSubmitPageReady() {
  contentLogger.log('Ensuring submit page is ready...')

  // Wait for key elements to be available
  const maxWaitTime = 10000
  const startTime = Date.now()

  while (Date.now() - startTime < maxWaitTime) {
    const titleInput = deepQuery('faceplate-textarea-input[name="title"]')
    const postButton = deepQuery('#inner-post-submit-button, r-post-form-submit-button')

    if (titleInput && postButton) {
      contentLogger.log('Submit page is ready')
      // Remove beforeunload listeners
      removeBeforeUnloadListeners()
      return true
    }

    await sleep(500)
  }

  throw new Error('Submit page did not become ready in time')
}

async function fetchPostDataForSubmission() {
  // Check if we have stored post data
  const storedData = sessionStorage.getItem('reddit-post-machine-postdata')
  if (storedData) {
    try {
      return JSON.parse(storedData)
    } catch (error) {
      contentLogger.warn('Failed to parse stored post data')
    }
  }

  // If no stored data, this means the script is running without proper initialization
  // This should not happen in normal flow since background script provides the data
  throw new Error('No post data found - script may be running incorrectly')
}

async function fillPostFieldsSequentially(postData) {
  contentLogger.log('Filling post fields sequentially...')

  // Step 1: Fill title
  contentLogger.log('Step 1: Filling title')
  await clickTab('TEXT')
  await fillTitle(postData.title)

  // Step 2: Fill URL
  contentLogger.log('Step 2: Filling URL')
  await clickTab('LINK')
  await fillUrl(postData.url)

  // Step 3: Activate post button
  contentLogger.log('Step 3: Activating post button')
  await clickBodyField()

  // Step 4: Fill body text
  contentLogger.log('Step 4: Filling body text')
  await fillBodyText(postData.body)

  // Step 5: Final activation
  contentLogger.log('Step 5: Final activation')
  await clickBodyField()

  contentLogger.log('All fields filled sequentially')
}

async function submitPost() {
  contentLogger.log('Submitting post...')

  const postClicked = await clickPostButton()

  if (postClicked) {
    // Monitor for submission completion
    const startTime = Date.now()
    const timeout = 15000 // 15 seconds

    while (Date.now() - startTime < timeout) {
      await sleep(1000)

      // Check if redirected away from submit page
      if (!window.location.href.includes('/submit')) {
        contentLogger.log('Post submitted successfully')
        return true
      }

      // Check for errors
      const errorElements = qsAll('[role="alert"], .error-message, [class*="error"]')
      for (const error of errorElements) {
        const text = error.textContent?.toLowerCase() || ''
        if (text.includes('error') || text.includes('rule') || text.includes('violation')) {
          contentLogger.log('Post submission failed:', text)
          return false
        }
      }
    }

    contentLogger.log('Post submission timed out')
    return false
  }

  contentLogger.log('Could not click post button')
  return false
}

// Continue profile detection after navigation
async function continueProfileDetectionScript() {
  contentLogger.log('=== CONTINUING PROFILE DETECTION AFTER NAVIGATION ===')

  try {
    // Switch to posts tab
    await switchToPostsTab()

  } catch (error) {
    contentLogger.error('Continue profile detection error:', error)
    sessionStorage.removeItem('reddit-post-machine-script-stage')
  }
}

// Continue profile data collection on posts page
async function continueProfileDataCollection() {
  contentLogger.log('=== CONTINUING PROFILE DATA COLLECTION ===')

  try {
    // Extract username from URL
    const usernameMatch = window.location.pathname.match(/\/u\/([^\/]+)/)
    if (!usernameMatch) {
      contentLogger.log('Could not extract username from posts page URL')
      sessionStorage.removeItem('reddit-post-machine-script-stage')
      return
    }

    const username = `u/${usernameMatch[1]}`
    contentLogger.log(`Extracted username from posts page: ${username}`)

    // Capture data from posts page
    const postsData = await capturePostsData(username)

    // Store in Chrome storage
    await storeProfileData(username, postsData)

    // Clear script stage
    sessionStorage.removeItem('reddit-post-machine-script-stage')

    contentLogger.log('=== PROFILE DETECTION SCRIPT COMPLETED ===')

  } catch (error) {
    contentLogger.error('Continue profile data collection error:', error)
    sessionStorage.removeItem('reddit-post-machine-script-stage')
  }
}

// Note: Post generation is now handled exclusively by background.js via API

// Handle manual script trigger from background/popup
async function handleManualScriptTrigger(scriptType, mode) {
  contentLogger.log(`=== MANUAL TRIGGER: ${scriptType} (mode: ${mode}) ===`)

  try {
    if (scriptType === 'profile') {
      // Clear any existing script stage for manual execution
      sessionStorage.removeItem('reddit-post-machine-script-stage')
      contentLogger.log('Manually triggering profile detection script')
      await runProfileDetectionScript()
    } else if (scriptType === 'post') {
      contentLogger.log('Manually triggering post submission script')
      await runPostSubmissionScript()
    } else {
      contentLogger.warn('Unknown script type for manual trigger:', scriptType)
    }

    contentLogger.log(`=== MANUAL TRIGGER COMPLETED: ${scriptType} ===`)
  } catch (error) {
    contentLogger.error(`Manual trigger error for ${scriptType}:`, error)
  }
}

function handleStartPostCreation(userName, postData) {
  //contentLogger.log(`Starting post creation for user: ${userName}`, postData)

  if (postData) {
      sessionStorage.setItem('reddit-post-machine-postdata', JSON.stringify(postData));
  }

  // Check if user is logged in first
  //contentLogger.log('Checking if user is logged in using proven method...')

  // Look for the avatar button that would indicate logged in state
  const avatarButton = qs('rpl-dropdown div, [data-testid="user-avatar"], button[aria-label*="user"], #expand-user-drawer-button')

  if (avatarButton) {
    //contentLogger.log('Found user avatar button - user is logged in')
  } else {
    //contentLogger.log('User avatar button not found - user may not be logged in')
    return
  }

  // Request background script to create new tab instead of navigating
  contentLogger.log('Requesting background script to create new post tab')
  chrome.runtime.sendMessage({
    type: 'CREATE_POST_TAB',
    postData: postData // Only use data provided by background script
  }).then(response => {
    if (response.success) {
      contentLogger.log('Background script created post tab successfully:', response.tabId)
    } else {
      contentLogger.error('Failed to create post tab:', response.error)
    }
  }).catch(error => {
    contentLogger.error('Error requesting post tab creation:', error)
  })
}

function findCreatePostElement() {
  // Try direct DOM search first
  let element = document.querySelector('span.flex.items-center.gap-xs')
  if (element && element.textContent.includes('Create Post')) {
    return element
  }

  // Search for spans containing "Create Post"
  const spans = document.querySelectorAll('span')
  for (let span of spans) {
    if (span.textContent.trim() === 'Create Post') {
      return span
    }
  }

  // Check shadow roots (common in modern web apps)
  const allElements = document.querySelectorAll('*')
  for (let el of allElements) {
    if (el.shadowRoot) {
      const shadowSpans = el.shadowRoot.querySelectorAll('span')
      for (let span of shadowSpans) {
        if (span.textContent.trim() === 'Create Post') {
          return span
        }
      }
    }
  }

  return null
}

function showWelcomeMessage(userName) {
  // Remove any existing welcome message
  const existingMessage = document.querySelector('.reddit-post-machine-welcome')
  if (existingMessage) {
    existingMessage.remove()
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeRedditIntegration()
    checkForStoredUsername()
    checkForStoredPostData()
    // DISABLED: Auto-detect username on page load to prevent automatic tab creation
    setTimeout(() => {
      tryAutoDetectUsername()
    }, 3000)
  })
} else {
  initializeRedditIntegration()
  checkForStoredUsername()
  checkForStoredPostData()
  // DISABLED: Auto-detect username on page load to prevent automatic tab creation
  setTimeout(() => {
    tryAutoDetectUsername()
  }, 3000)
}

// Function to auto-detect username on page load for testing
async function tryAutoDetectUsername() {
  contentLogger.log('Auto-detecting username on page load...')

  // Only try if we don't already have a stored username
  const storedUser = await getStoredUsername()
  if (storedUser && storedUser.seren_name) {
    contentLogger.log('Already have stored username:', storedUser.seren_name)
    return
  }

  // Try to extract username from the page
  const username = await extractUsernameFromPage()
  if (username) {
    contentLogger.log('Successfully auto-detected username:', username)
    // Show a brief success message
    const messageDiv = createMessageDiv('✅', 'Username Detected', `Successfully detected: ${username}`, '#4caf50')
    showTemporaryMessage(messageDiv)
  } else {
    contentLogger.log('Could not auto-detect username')
  }
}

function checkForStoredUsername() {
  // Check if we're on submit page and have a stored username
  setTimeout(() => {
    const storedUsername = sessionStorage.getItem('reddit-post-machine-username')
    if (storedUsername && window.location.pathname.includes('/submit')) {
      contentLogger.log(`Using stored username: ${storedUsername}`)
      showWelcomeMessage(storedUsername)
      // Clear the stored username
      sessionStorage.removeItem('reddit-post-machine-username')
    }
  }, 1000) // Wait for page to fully load
}

// [Removed local state machine logic]

// Handle action results from DOM script
window.addEventListener('message', async (event) => {
    // Check for both action result OR direct request from background (via window.postMessage from content script itself?? No.)
    // We only care about results from DOM script here

    if (event.data.type === 'REDDIT_POST_MACHINE_ACTION_RESULT') {
        const { action, success, data } = event.data;
        contentLogger.log(`Action Result: ${action} Success: ${success}`, data);

        // Forward result to background script
        try {
            chrome.runtime.sendMessage({
                type: 'ACTION_COMPLETED',
                action: action,
                success: success,
                data: data
            }).catch(err => {
                // Ignore "Extension context invalidated" errors that happen during reloads
                if (!err.message.includes('Extension context invalidated')) {
                    contentLogger.warn('[Content Script] Failed to send ACTION_COMPLETED:', err);
                }
            });
        } catch (e) {
            contentLogger.warn('[Content Script] Error sending message:', e);
        }

        // Show visual feedback to user
        if (!success) {
             const messageDiv = createMessageDiv('❌', 'Action Failed', `Step ${action} failed.`, '#d32f2f');
             showTemporaryMessage(messageDiv);
        } else if (action === 'GET_POSTS') {
             // Save posts data to Chrome storage for popup consumption
             // 'data' here comes from dom.js checkUserPosts() and has { total, lastPostDate, posts }

             // We want to store it so the Popup can read it immediately
             const storageData = {
                 postsInfo: data,
                 lastUpdated: Date.now()
             };

             chrome.storage.local.set({ 'latestPostsData': storageData }, () => {
                 contentLogger.log('Posts data saved to local storage', storageData);

                 // Notify popup (if open) to refresh its view
                 chrome.runtime.sendMessage({
                     type: 'POSTS_UPDATED',
                     data: storageData
                 }).catch(() => {
                     // Popup might be closed, ignore error
                 });
             });

             // Also restore the legacy status update logic to ensure the Main Status Card in the popup updates
             saveUserStatusToStorage(data.userName || 'User', data);
        }
    }
});

function checkForStoredPostData() {
    setTimeout(() => {
        const storedData = sessionStorage.getItem('reddit-post-machine-postdata');
        if (storedData && window.location.pathname.includes('/submit')) {
            contentLogger.log('Found stored post data, attempting to fill form...');
            try {
                const postData = JSON.parse(storedData);
                fillPostForm(postData);

                // Clear after use
                sessionStorage.removeItem('reddit-post-machine-postdata');

                // Don't notify completion yet - wait for actual post submission
                // We'll monitor for successful submission separately

            } catch (e) {
                contentLogger.error('Error parsing stored post data', e);
            }
        }
    }, 2000);
}

// Start the process - triggered by background now
// We still keep this function but it's simpler
async function handleCheckUserStatus(userName) {
  contentLogger.log(`Checking user status for: ${userName}`)
  const statusDiv = createMessageDiv('🔍', 'Checking Status', `Checking status for ${userName}...`, '#2196f3')
  showTemporaryMessage(statusDiv)

  // Trigger DOM action
  window.postMessage({
    type: 'REDDIT_POST_MACHINE_NAVIGATE_PROFILE',
    payload: { userName }
  }, '*');
}

// Check if account is locked (from postm-page.js)
function checkAccountLocked() {
  const phrases = ["we've locked your account", "locked your account", "account suspended"]
  const pageText = document.body.textContent.toLowerCase()

  const hasLockedPhrase = phrases.some(phrase => pageText.includes(phrase))

  const errorBanners = qsAll('faceplate-banner[appearance="error"]')
  const hasLockedBanner = errorBanners.some(el =>
    el.textContent?.toLowerCase().includes('locked') || el.textContent?.toLowerCase().includes('suspended'))

  return hasLockedPhrase || hasLockedBanner
}

// Helper for robust waiting
async function waitForCondition(conditionFn, timeout = 10000, interval = 500) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (await conditionFn()) return true
    await sleep(interval)
  }
  return false
}


// Check user posts (from postm-page.js)
async function checkUserPosts() {
  contentLogger.log('Checking user posts...')

  // Wait for posts to appear
  let posts = []
  await waitForCondition(() => {
    posts = qsAll('shreddit-post, [data-testid="post-container"], .Post, [data-testid*="post"]')
    return posts.length > 0
  }, 5000, 500)

  contentLogger.log(`Found ${posts.length} posts`)

  if (posts.length > 0) {
    // Sort posts by date (newest first)
    const postsWithDates = posts.map(post => {
      const timestamp = post.getAttribute('created-timestamp') ||
        post.querySelector('time, [data-testid="post_timestamp"]')?.getAttribute('datetime') ||
        post.querySelector('span[data-testid="post_timestamp"]')?.textContent ||
        post.querySelector('time')?.getAttribute('datetime')

      // Capture minimal moderation status for deletion decisions
      const moderationStatus = {
        isRemoved: post.textContent?.includes('removed by the moderators') || 
                  post.querySelector('[icon-name="remove"]') !== null || false,
        isLocked: post.querySelector('[icon-name="lock-fill"]') !== null
      }

      return { element: post, timestamp, moderationStatus }
    }).filter(post => post.timestamp)

    // Sort by date (newest first)
    postsWithDates.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    contentLogger.log('=== POSTS SUMMARY ===')
    contentLogger.log(`Total posts: ${posts.length}`)

    postsWithDates.forEach((post, index) => {
      contentLogger.log(`Post ${index + 1}: ${post.timestamp}`)
    })

    if (postsWithDates.length > 0) {
      contentLogger.log(`Last post date: ${postsWithDates[0].timestamp}`)
      return {
        total: posts.length,
        lastPostDate: postsWithDates[0].timestamp,
        posts: postsWithDates
      }
    }
  } else {
    contentLogger.log('No posts found')
  }

  return {
    total: 0,
    lastPostDate: null,
    posts: []
  }
}

// Save user status results to Chrome storage
async function saveUserStatusToStorage(userName, postsInfo) {
  contentLogger.log('=== USER STATUS RESULTS ===')
  contentLogger.log(`User: ${userName}`)
  contentLogger.log(`Total posts: ${postsInfo.total}`)
  contentLogger.log(`Last post date: ${postsInfo.lastPostDate || 'Not available'}`)

  // Format the last post date
  let lastPostText = 'No posts found'
  if (postsInfo.lastPostDate) {
    try {
      const lastPostDate = new Date(postsInfo.lastPostDate)
      const now = new Date()
      const diffTime = Math.abs(now - lastPostDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        lastPostText = 'Yesterday'
      } else if (diffDays < 7) {
        lastPostText = `${diffDays} days ago`
      } else if (diffDays < 30) {
        const weeks = Math.ceil(diffDays / 7)
        lastPostText = `${weeks} week${weeks > 1 ? 's' : ''} ago`
      } else {
        lastPostText = lastPostDate.toLocaleDateString()
      }
    } catch (error) {
      lastPostText = postsInfo.lastPostDate
    }
  }

  // Create user status data object
  const userStatusData = {
    userName: userName,
    totalPosts: postsInfo.total,
    lastPostDate: postsInfo.lastPostDate,
    lastPostText: lastPostText,
    timestamp: Date.now(),
    checkUrl: window.location.href
  }

  try {
    // Save to both sync and local storage
    await chrome.storage.sync.set({ userStatus: userStatusData })
    await chrome.storage.local.set({ userStatus: userStatusData })

    contentLogger.log('User status saved to Chrome storage:', userStatusData)

    // Show brief success message
    const messageDiv = createMessageDiv('✅', 'Status Saved', 'User status data saved successfully', '#4caf50')
    showTemporaryMessage(messageDiv)

    // Notify background script
    await chrome.runtime.sendMessage({
      type: 'USER_STATUS_SAVED',
      data: userStatusData
    })
  } catch (error) {
    contentLogger.error('Failed to save user status to Chrome storage:', error)
    const messageDiv = createMessageDiv('❌', 'Save Failed', 'Failed to save user status data', '#d32f2f')
    showTemporaryMessage(messageDiv)
  }
}

// Handle delete last post request from popup
async function handleDeleteLastPost(userName) {
  contentLogger.log(`Deleting last post for: ${userName}`)

  // Show initial delete message
  const statusDiv = createMessageDiv('🗑️', 'Deleting Post', `Finding and deleting last post for ${userName}...`, '#ff5722')
  showTemporaryMessage(statusDiv)

  try {
    // First check if account is locked
    if (checkAccountLocked()) {
      contentLogger.log('Account locked')
      const messageDiv = createMessageDiv('🔒', 'Account Locked', 'Your Reddit account appears to be locked or suspended.', '#d32f2f')
      showTemporaryMessage(messageDiv)
      return
    }

    // Check user posts directly (no navigation needed since we're already on posts page)
    const postsInfo = await checkUserPosts()

    if (postsInfo.total === 0) {
      const messageDiv = createMessageDiv('ℹ️', 'No Posts Found', 'No posts found to delete.', '#2196f3')
      showTemporaryMessage(messageDiv)
      return
    }

    // Get the most recent post
    const mostRecentPost = postsInfo.posts[0]
    if (!mostRecentPost || !mostRecentPost.element) {
      const messageDiv = createMessageDiv('❌', 'Post Not Found', 'Could not find the most recent post.', '#ff5722')
      showTemporaryMessage(messageDiv)
      return
    }

    // Attempt to delete the post
    const deleteSuccess = await deletePost(mostRecentPost.element)
    if (deleteSuccess) {
      const messageDiv = createMessageDiv('✅', 'Post Deleted', 'Last post has been successfully deleted!', '#4caf50')
      showTemporaryMessage(messageDiv)

      // Notify background script of successful deletion
      chrome.runtime.sendMessage({
        type: 'ACTION_COMPLETED',
        action: 'DELETE_POST_COMPLETED',
        success: true,
        postId: mostRecentPost.id || null
      }).catch(() => {})
    } else {
      const messageDiv = createMessageDiv('❌', 'Delete Failed', 'Could not delete the post. Please try manually.', '#ff5722')
      showTemporaryMessage(messageDiv)

      // Notify background script of failed deletion
      chrome.runtime.sendMessage({
        type: 'ACTION_COMPLETED',
        action: 'DELETE_POST_COMPLETED',
        success: false,
        error: 'Could not delete the post'
      }).catch(() => {})
    }

  } catch (error) {
    contentLogger.error('Error deleting last post:', error)
    const messageDiv = createMessageDiv('❌', 'Error', 'Failed to delete last post.', '#d32f2f')
    showTemporaryMessage(messageDiv)
  }
}

// Function to delete a specific post element
async function deletePost(postElement) {
  contentLogger.log('Attempting to delete post element:', postElement)

  try {
    // Look for delete/more options button on the post
    const moreOptionsSelectors = [
      'button[aria-label="Open user actions"]',
      'button[id="overflow-trigger"]',
      'button[aria-label*="user actions"]',
      'shreddit-overflow-menu button',
      'shreddit-overflow-menu',
      'button[aria-label*="more options"]',
      'button[aria-label*="More options"]',
      'button[data-testid="post-menu-trigger"]',
      '[data-testid*="overflow-menu"]',
      'button[aria-haspopup="true"]',
      '[data-click-id="overflow"]',
      'button[title*="more"]',
      'faceplate-dropdown-menu button',
      'button[aria-label*="More post actions"]',
      'button svg[fill="currentColor"]',
      '[slot="post-stats-entry-point"] button',
      'button:has(svg)'
    ]

    // Look for delete/more options button on the post - check Shadow DOM too
    const findOverflowButton = (element) => {
      contentLogger.log('Searching for overflow button in element:', element.tagName)

      // First try normal querySelector
      for (const selector of moreOptionsSelectors) {
        const button = element.querySelector(selector)
        if (button) {
          contentLogger.log(`Found overflow button with selector: ${selector}`)
          return button
        }
      }

      // Then check shadow roots
      const allElements = element.querySelectorAll('*')
      contentLogger.log(`Checking ${allElements.length} elements for shadow roots`)

      for (const el of allElements) {
        if (el.shadowRoot) {
          contentLogger.log(`Found shadow root in element: ${el.tagName}`)
          for (const selector of moreOptionsSelectors) {
            const button = el.shadowRoot.querySelector(selector)
            if (button) {
              contentLogger.log(`Found overflow button in shadow DOM with selector: ${selector}`)
              return button
            }
          }
        }
      }

      contentLogger.log('No overflow button found in normal DOM or shadow roots')
      return null
    }

    let moreButton = findOverflowButton(postElement)

    if (moreButton) {
      contentLogger.log('Found overflow button using Shadow DOM search')
    }

    if (!moreButton) {
      contentLogger.log('More options button not found in post, trying alternative approach...')

      // Debug: Log all buttons in the post element
      const allButtons = postElement.querySelectorAll('button')
      contentLogger.log(`Found ${allButtons.length} buttons in post:`)
      allButtons.forEach((btn, i) => {
        contentLogger.log(`Button ${i}:`, {
          ariaLabel: btn.getAttribute('aria-label'),
          className: btn.className,
          innerHTML: btn.innerHTML?.substring(0, 100),
          outerHTML: btn.outerHTML?.substring(0, 200)
        })
      })

      // Try to find any button that might be the overflow menu
      for (const btn of allButtons) {
        const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || ''
        const className = btn.className?.toLowerCase() || ''
        const innerHTML = btn.innerHTML?.toLowerCase() || ''

        if (ariaLabel.includes('more') || ariaLabel.includes('menu') || ariaLabel.includes('options') ||
            className.includes('overflow') || className.includes('menu') ||
            innerHTML.includes('svg') || innerHTML.includes('⋯') || innerHTML.includes('...')) {
          contentLogger.log('Found potential overflow menu button:', btn)
          moreButton = btn
          break
        }
      }

      if (!moreButton) {
        contentLogger.log('No overflow menu button found in post element')
        return false
      }
    }

    // Click the more options button
    moreButton.click()
    await sleep(1500)

    // Enhanced search for delete option with retry logic and shadow DOM support
    const findDeleteOption = (root = document) => {
      // Check ALL elements in current root for text match
      const allElements = Array.from(root.querySelectorAll('*')).reverse()

      for (const el of allElements) {
        // Skip common non-interactive structural tags
        if (['SCRIPT', 'STYLE', 'HTML', 'BODY', 'HEAD'].includes(el.tagName)) continue

        const text = el.textContent?.toLowerCase().trim() || ''
        const ariaLabel = el.getAttribute('aria-label')?.toLowerCase() || ''
        const testId = el.getAttribute('data-testid')?.toLowerCase() || ''

        // Check for 'delete' keyword
        const isDeleteMatch =
          text === 'delete' ||
          (text.includes('delete') && text.length < 20) ||
          ariaLabel.includes('delete') ||
          testId.includes('delete')

        if (isDeleteMatch) {
          // Check visibility
          if (el.offsetParent === null && window.getComputedStyle(el).display === 'none') {
            continue
          }

          contentLogger.log('Found potential delete element:', el)

          // Find closest clickable ancestor
          const clickable = el.closest('button, a, div[role="menuitem"], faceplate-dropdown-menu-item') || el
          return clickable
        }
      }

      // Recursively search shadow roots
      const all = Array.from(root.querySelectorAll('*'))
      for (const el of all) {
        if (el.shadowRoot) {
          const found = findDeleteOption(el.shadowRoot)
          if (found) return found
        }
      }
      return null
    }

    // Retry loop for finding delete option
    let deleteOption = null
    for (let attempts = 0; attempts < 3; attempts++) {
      deleteOption = findDeleteOption()
      if (deleteOption) break

      // Also check explicitly for portals which might be outside standard flow
      const portals = document.querySelectorAll('faceplate-portal, .portal, [id*="portal"]')
      for (const portal of portals) {
        if (portal.shadowRoot) {
          const found = findDeleteOption(portal.shadowRoot)
          if (found) {
            deleteOption = found
            break
          }
        } else {
          const found = findDeleteOption(portal)
          if (found) {
            deleteOption = found
            break
          }
        }
      }
      if (deleteOption) break

      contentLogger.log(`Delete option not found, retrying... (${attempts + 1}/3)`)
      await sleep(1000)
    }

    // Fallback: Look for danger elements
    if (!deleteOption) {
      contentLogger.log('Standard delete text search failed, looking for danger elements...')
      const dangerElements = document.querySelectorAll('[appearance="danger"], .icon-delete, [icon-name="delete"]')
      if (dangerElements.length > 0) {
        deleteOption = dangerElements[0].closest('button, a, div[role="menuitem"]') || dangerElements[0]
      }
    }

    if (!deleteOption) {
      contentLogger.log('Delete option not found in dropdown menu')
      return false
    }

    // Click the delete option
    deleteOption.click()
    await sleep(1500)

    // Enhanced search for confirmation button with shadow DOM and portal support
    const findConfirmButton = (root = document) => {
      // Check ALL elements in current root for confirmation text match
      const allElements = Array.from(root.querySelectorAll('*')).reverse()

      for (const el of allElements) {
        // Skip common non-interactive structural tags
        if (['SCRIPT', 'STYLE', 'HTML', 'BODY', 'HEAD'].includes(el.tagName)) continue

        // Only check button elements for confirmation to avoid matching individual spans
        const isClickableElement =
          el.tagName === 'BUTTON' ||
          el.tagName === 'A' ||
          (el.tagName === 'DIV' && el.getAttribute('role') === 'button') ||
          el.tagName === 'FACEPLATE-BUTTON' ||
          el.tagName.toLowerCase() === 'faceplate-button'

        // Debug logging to see what's being processed
        if (el.textContent?.toLowerCase().includes('delete')) {
          contentLogger.log('Debug - Element with delete text:', el.tagName, el, 'Is clickable:', isClickableElement)
        }

        if (!isClickableElement) {
          continue
        }

        const text = el.textContent?.toLowerCase().trim() || ''
        const ariaLabel = el.getAttribute('aria-label')?.toLowerCase() || ''
        const testId = el.getAttribute('data-testid')?.toLowerCase() || ''

        // Match confirmation text patterns - be more strict to find actual "Yes, Delete" button
        const isConfirmMatch =
          text === 'yes, delete' ||
          text.includes('yes, delete') ||
          (text.includes('delete') && text.includes('yes')) ||
          (ariaLabel.includes('delete') && ariaLabel.includes('yes')) ||
          (testId.includes('delete') && testId.includes('confirm'))

        if (isConfirmMatch) {
          // Check visibility
          if (el.offsetParent === null && window.getComputedStyle(el).display === 'none') {
            continue
          }

          contentLogger.log('Found potential confirmation element:', el, 'Text:', text)

          // Find closest clickable ancestor
          const clickable = el.closest('button, a, div[role="button"], faceplate-button') || el
          return clickable
        }
      }

      // Recursively search shadow roots
      const all = Array.from(root.querySelectorAll('*'))
      for (const el of all) {
        if (el.shadowRoot) {
          const found = findConfirmButton(el.shadowRoot)
          if (found) return found
        }
      }
      return null
    }

    // Retry loop for finding confirmation button
    let confirmButton = null
    for (let attempts = 0; attempts < 3; attempts++) {
      confirmButton = findConfirmButton()
      if (confirmButton) break

      // Also check explicitly for portals which might contain the confirmation dialog
      const portals = document.querySelectorAll('faceplate-portal, .portal, [id*="portal"], .modal, .overlay')
      for (const portal of portals) {
        if (portal.shadowRoot) {
          const found = findConfirmButton(portal.shadowRoot)
          if (found) {
            confirmButton = found
            break
          }
        } else {
          const found = findConfirmButton(portal)
          if (found) {
            confirmButton = found
            break
          }
        }
      }
      if (confirmButton) break

      contentLogger.log(`Confirmation button not found, retrying... (${attempts + 1}/3)`)
      await sleep(1000)
    }

    if (confirmButton) {
      contentLogger.log('Clicking confirmation button to delete post')
      confirmButton.click()

      // Wait longer for deletion to process and check multiple times
      let deletionConfirmed = false
      for (let check = 0; check < 5; check++) {
        await sleep(1000)

        // Check if post was successfully deleted by seeing if it's still in the DOM
        const postStillExists = document.contains(postElement)
        if (!postStillExists) {
          contentLogger.log('Post successfully deleted - element no longer in DOM')
          deletionConfirmed = true
          break
        }

        // Alternative check - look for success message or page change
        const successMessages = document.querySelectorAll('[data-testid*="success"], .success-message, [class*="success"], [role="alert"]')
        for (const msg of successMessages) {
          if (msg.textContent?.toLowerCase().includes('delete') || msg.textContent?.toLowerCase().includes('removed')) {
            contentLogger.log('Post deletion success message found:', msg.textContent)
            deletionConfirmed = true
            break
          }
        }

        // Check if we're redirected away from post page
        if (!window.location.href.includes('/comments/') && !window.location.href.includes('/r/')) {
          contentLogger.log('Redirected from post page - deletion likely successful')
          deletionConfirmed = true
          break
        }

        if (deletionConfirmed) break
      }

      if (deletionConfirmed) {
        return true
      } else {
        contentLogger.log('Post deletion status unclear after multiple checks')
        return true // Assume success if we clicked the button
      }
    } else {
      contentLogger.log('Confirmation button not found')
      return false
    }

  } catch (error) {
    contentLogger.error('Error in deletePost function:', error)
    return false
  }
}

// ⚡ AUTOFLOW HELPER: Quick post status check for immediate decisions
async function quickGetPostStatus(username) {
  contentLogger.log('⚡ Quick post status check for autoflow...')
  
  // Look for posts directly on current page
  const posts = qsAll('shreddit-post[id^="t3_"], [data-testid="post-container"], .Post, [data-testid*="post"]')
  
  if (posts.length === 0) {
    return { 
      hasPost: false, 
      decision: 'create',
      reason: 'no_posts',
      userName: username 
    }
  }
  
  // Get the first (most recent) post
  const firstPost = posts[0]
  
  // Quick moderation check
  const isRemoved = firstPost.textContent?.includes('removed by the moderators') || 
                   firstPost.querySelector('[icon-name="remove"]') !== null
  
  // Quick engagement check  
  const scoreEl = firstPost.querySelector('[data-testid="post-vote-score"], faceplate-number')
  const score = parseInt(scoreEl?.textContent?.trim() || '0')
  
  // Get post timestamp for age check
  const timeEl = firstPost.querySelector('time')
  const timestamp = timeEl?.getAttribute('datetime') || timeEl?.textContent
  let ageHours = 0
  
  if (timestamp) {
    try {
      const postDate = new Date(timestamp)
      ageHours = (Date.now() - postDate.getTime()) / (1000 * 60 * 60)
    } catch (e) {
      contentLogger.warn('Could not parse timestamp:', timestamp)
    }
  }
  
  contentLogger.log(`⚡ Quick check: removed=${isRemoved}, score=${score}, age=${ageHours.toFixed(1)}h`)
  
  // Quick decision logic
  if (isRemoved) {
    return { 
      hasPost: true, 
      decision: 'create_with_delete', 
      reason: 'post_removed',
      lastPost: { isRemoved, score, ageHours },
      userName: username 
    }
  }
  
  if (score < 0) {
    return { 
      hasPost: true, 
      decision: 'create_with_delete', 
      reason: 'post_downvoted',
      lastPost: { isRemoved, score, ageHours },
      userName: username 
    }
  }
  
  if (ageHours < 1) {
    return { 
      hasPost: true, 
      decision: 'wait', 
      reason: 'recent_post',
      lastPost: { isRemoved, score, ageHours },
      userName: username 
    }
  }
  
  return { 
    hasPost: true, 
    decision: 'no_create', 
    reason: 'post_active',
    lastPost: { isRemoved, score, ageHours },
    userName: username 
  }
}

// Handle fresh posts request for background decision making
async function handleGetFreshPostsForDecision(userName) {
  contentLogger.log('[Content Script] Handling GET_FRESH_POSTS_FOR_DECISION for:', userName)
  
  try {
    // Get fresh posts data from the current page
    const postsInfo = await checkUserPosts()
    
    // Normalize the data with userName for the background script
    const freshData = {
      userName: userName,
      postsInfo: postsInfo,
      lastUpdated: Date.now(),
      dataFresh: true // Flag to indicate this is fresh data
    }
    
    contentLogger.log('[Content Script] Sending fresh posts data to background:', freshData)
    
    // Send the fresh data back to background script
    chrome.runtime.sendMessage({
      type: 'FRESH_POSTS_COLLECTED',
      data: freshData
    }).catch(err => {
      contentLogger.warn('[Content Script] Failed to send fresh posts data:', err)
    })
    
  } catch (error) {
    contentLogger.error('[Content Script] Error getting fresh posts for decision:', error)
    
    // Send error response
    chrome.runtime.sendMessage({
      type: 'FRESH_POSTS_COLLECTED',
      data: {
        userName: userName,
        error: error.message,
        dataFresh: false
      }
    }).catch(() => {})
  }
}

// Export for global access
window.quickGetPostStatus = quickGetPostStatus
contentLogger.log('⚡ Quick status function available: quickGetPostStatus(username)')

// Export default function for Quasar bridge compatibility
export default function (bridge) {
  // This function is called by Quasar's BEX bridge system
  contentLogger.log('Content script bridge initialized', bridge)
}
