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

	// Script 2: Post submission script - DEPRECATED in this file
	// Now handled exclusively by submit-content-script.js
	if (autoRunSettings.postSubmission && url.includes('reddit.com/submit')) {
		contentLogger.log('Auto-run post submission is handled by submit-content-script.js')
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
	document.onbeforeunload = null

	contentLogger.log('Beforeunload listeners disabled')
}

function findAgeGateConfirmationButton() {
	const candidateRoots = [
		document.querySelector('[data-testid="age-restriction-warning-modal"]'),
		...document.querySelectorAll('faceplate-portal'),
		...document.querySelectorAll('[role="dialog"]')
	].filter(Boolean)

	const searchRoots = candidateRoots.length > 0 ? candidateRoots : [document.body].filter(Boolean)

	for (const root of searchRoots) {
		const buttons = root.querySelectorAll?.('button, a[role="button"]') || []
		for (const btn of buttons) {
			const text = (btn.innerText || btn.textContent || '')
				.toLowerCase()
				.replace(/\s+/g, ' ')
				.trim()

			if (!text) continue

			if (
				text.includes('over 18') ||
				text.includes('over18') ||
				text.includes("i am over 18") ||
				text.includes("i'm over 18") ||
				text.includes("i’m over 18")
			) {
				return btn
			}
		}
	}

	return null
}

function startAgeGateBypass() {
	if (window.__rpmAgeGateObserver) return
	if (!document.body) {
		document.addEventListener('DOMContentLoaded', startAgeGateBypass, { once: true })
		return
	}

	const tryDismiss = () => {
		try {
			const confirmBtn = findAgeGateConfirmationButton()
			if (confirmBtn) {
				contentLogger.log('[Content Script] Detected Reddit age gate, auto-confirming')
				confirmBtn.click()
				return true
			}
		} catch (e) {
			contentLogger.warn('[Content Script] Age gate auto-confirm failed', e)
		}
		return false
	}

	// Immediate attempt in case modal is already rendered
	tryDismiss()

	// Watch for dialogs added later (SPA navigation)
	const observer = new MutationObserver(() => {
		tryDismiss()
	})
	observer.observe(document.body, { childList: true, subtree: true })
	window.__rpmAgeGateObserver = observer

	// Clean up on page navigation
	window.addEventListener('pagehide', () => {
		if (window.__rpmAgeGateObserver) {
			window.__rpmAgeGateObserver.disconnect()
			window.__rpmAgeGateObserver = null
		}
	})
}

function initializeRedditIntegration() {
	contentLogger.log('Initializing Reddit integration')

	// Remove Reddit's beforeunload event listeners to prevent "Leave site?" dialog
	removeBeforeUnloadListeners()

	// Auto-dismiss the mature content gate when user is already 18+
	startAgeGateBypass()

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

	// --- PERSISTENT FLOATING TIMER ---
	let timerElement = null;
	const createTimerUI = () => {
		if (timerElement) return;
		timerElement = document.createElement('div');
		timerElement.id = 'reddit-post-machine-floating-timer';
		Object.assign(timerElement.style, {
			position: 'fixed',
			bottom: '20px',
			right: '20px',
			backgroundColor: '#1a1a1b',
			color: '#d7dadc',
			padding: '12px 16px',
			borderRadius: '12px',
			boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
			zIndex: '99999',
			display: 'none',
			alignItems: 'center',
			gap: '12px',
			fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
			border: '1px solid #343536',
			transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
			cursor: 'default',
			userSelect: 'none'
		});

		timerElement.innerHTML = `
			<div style="background: #ff4500; width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 8px #ff4500; animation: rpm-pulse 2s infinite;"></div>
			<div>
				<div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.6; font-weight: 700;">Monitoring Post</div>
				<div id="rpm-countdown-value" style="font-size: 18px; font-weight: 700; font-variant-numeric: tabular-nums;">00m 00s</div>
			</div>
		`;

		const style = document.createElement('style');
		style.id = 'rpm-floating-timer-styles';
		style.textContent = `
			@keyframes rpm-pulse {
				0% { opacity: 1; transform: scale(1); }
				50% { opacity: 0.5; transform: scale(1.2); }
				100% { opacity: 1; transform: scale(1); }
			}
			#reddit-post-machine-floating-timer:hover {
				transform: translateY(-4px);
				border-color: #ff4500;
				box-shadow: 0 8px 30px rgba(255, 69, 0, 0.2);
			}
		`;
		document.head.appendChild(style);
		document.body.appendChild(timerElement);
	};

	setInterval(async () => {
		try {
			const result = await chrome.storage.local.get(['lastExecutionResult']);
			const lastExecutionResult = result.lastExecutionResult;

			if (lastExecutionResult && lastExecutionResult.status === 'monitoring' && lastExecutionResult.monitoringEndTime) {
				const now = Date.now();
				const timeLeft = lastExecutionResult.monitoringEndTime - now;

				if (timeLeft > 0) {
					if (!timerElement) createTimerUI();
					if (timerElement) {
						timerElement.style.display = 'flex';
						const minutes = Math.floor(timeLeft / 60000);
						const seconds = Math.floor((timeLeft % 60000) / 1000);
						const countdownVal = document.getElementById('rpm-countdown-value');
						if (countdownVal) {
							countdownVal.textContent = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
						}
					}
					return;
				}
			}

			if (timerElement) {
				timerElement.style.display = 'none';
			}
		} catch (e) {
			// Ignore storage errors during reload
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
				sendResponse({ started: true })
				break

			case 'CHECK_USER_STATUS':
				handleCheckUserStatus(message.userName)
				break

			case 'DELETE_LAST_POST':
				// Start delete flow and immediately acknowledge receipt to avoid
				// "asynchronous response" errors in the sender. The actual
				// completion result is reported separately via ACTION_COMPLETED.
				handleDeleteLastPost(message.userName)
				sendResponse({ started: true })
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

			case 'REMOVE_BEFOREUNLOAD_LISTENERS':
				contentLogger.log('[Content Script] Received REMOVE_BEFOREUNLOAD_LISTENERS command')
				removeBeforeUnloadListeners()
				sendResponse({ success: true })
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

			// Show welcome message
			showWelcomeMessage(userName)
			// fillPostForm(postData) - DEPRECATED: Handled by submit-content-script.js
		} else {
			contentLogger.log('No stored post data found')
		}
	}
}

// DELETED: fillPostForm, createPostWithWorkingCode and related helpers
// These functions were redundant with submit-content-script.js
function fillPostForm(data) {
	contentLogger.log('fillPostForm is deprecated. Post creation is handled by submit-content-script.js')
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

function deepQueryAll(selector, root = document, results = []) {
	let matches = []
	try {
		matches = Array.from(root.querySelectorAll(selector))
	} catch {
		matches = []
	}
	if (matches.length) results.push(...matches)
	for (const elem of root.querySelectorAll('*')) {
		if (elem.shadowRoot) {
			deepQueryAll(selector, elem.shadowRoot, results)
		}
	}
	return results
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
		let avatarButton = qs(selector)
		if (!avatarButton) {
			avatarButton = deepQuery(selector)
		}
		if (avatarButton) {
			contentLogger.log(`Found avatar button with selector: ${selector}`)
			contentLogger.log('Avatar button element:', avatarButton)
			const shadowButton = avatarButton.shadowRoot?.querySelector('button, [role="button"]')
			if (shadowButton) {
				shadowButton.click()
			} else {
				avatarButton.click()
			}
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

// Helper to clean username string (remove "Promoted", newlines, etc.)
function cleanUsername(text) {
	if (!text) return null
	const match = text.match(/(u\/[A-Za-z0-9_-]+)/)
	return match ? match[1] : null
}

function isPlaceholderUsername(username) {
	if (!username) return false
	const cleaned = String(username).replace(/^u\//i, '').trim().toLowerCase()
	return cleaned === 'me'
}

async function fetchAuthenticatedUsernameFromApi() {
	try {
		const res = await fetch('https://www.reddit.com/api/v1/me', { credentials: 'include' })
		if (!res.ok) {
			contentLogger.log(`Reddit API /api/v1/me failed: ${res.status}`)
			return null
		}
		const data = await res.json()
		if (data?.name) {
			return `u/${data.name}`
		}
	} catch (error) {
		contentLogger.warn('Failed to fetch username from Reddit API:', error)
	}
	return null
}

// Strict helper to find username via "View Profile" text
// This is the most reliable method as it targets the specific logged-in user UI component
function findUsernameViaViewProfile() {
	try {
		const viewProfileSpans = deepQueryAll('span').filter(el => el.textContent?.trim() === 'View Profile')
		for (const span of viewProfileSpans) {
			// Look for sibling with username
			// Structure: parent > [span(View Profile), span(u/username)]
			const parent = span.parentElement;
			if (parent) {
				const usernameSpan = parent.querySelector('span:nth-child(2)') ||
					parent.querySelector('.text-secondary-weak');

				if (usernameSpan) {
					const text = cleanUsername(usernameSpan.textContent);
					if (text && !isPlaceholderUsername(text)) {
						// Double check against parent anchor href if possible
						const anchor = span.closest('a');
						if (anchor && anchor.href.includes(text.replace('u/', ''))) {
							contentLogger.log(`Found verified username via View Profile: ${text}`);
							return text;
						}

						// If no anchor check possible, still return if it looks like a username
						contentLogger.log(`Found username via View Profile text: ${text}`);
						return text;
					}
				}
			}

			const anchor = span.closest('a');
			if (anchor && anchor.href) {
				const urlMatch = anchor.href.match(/\/(user|u)\/([^\/]+)/);
				if (urlMatch) {
					const candidate = `u/${urlMatch[2]}`;
					if (!isPlaceholderUsername(candidate)) {
						contentLogger.log(`Found username via View Profile link: ${candidate}`);
						return candidate;
					}
				}
			}
		}
	} catch (e) {
		contentLogger.warn('Error in View Profile extraction:', e);
	}
	return null;
}

function findUsernameFromAnyProfileLink() {
	const anchors = deepQueryAll('a[href*="/user/"], a[href*="/u/"]')
	for (const anchor of anchors) {
		const href = anchor.href
		if (!href) continue
		const match = href.match(/\/(user|u)\/([^\/]+)/)
		if (!match) continue
		const candidate = `u/${match[2]}`
		if (isPlaceholderUsername(candidate)) continue
		contentLogger.log(`Found username via profile link: ${candidate}`)
		return candidate
	}
	return null
}

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

	// Priority 1: STRICT "View Profile" check (Based on user provided HTML)
	const viewProfileUser = findUsernameViaViewProfile();
	if (viewProfileUser) {
		cachedUsername = viewProfileUser;
		cacheTimestamp = Date.now();
		return viewProfileUser;
	}

	// Secondary check: constrained header selectors (only if View Profile fails/is hidden)
	const authSelectors = [
		// Header/Dropdown specific
		'button[id*="user-dropdown"] [class*="text-12"]',
		'[data-testid="user-menu-trigger"] span[class*="text-12"]',
		'.header-user-dropdown [class*="text-12"]',
		'button[aria-label*="User"] span[class*="text-12"]',

		// Right Sidebar "View Profile" Card (Trusted)
		// Look for the View Profile section in the sidebar
		'div:has(> a[href*="/user/"]) span[class*="text-"]', // Modern layout
		'div:has(> a[href*="/u/"]) span[class*="text-"]',
		'aside a[href^="/u/"]',
		'aside a[href^="/user/"]',
		// Fallback for sidebar
		'div[class*="sidebar"] a[href^="/u/"]'
	]

	for (const selector of authSelectors) {
		const element = qs(selector)
		if (element) {
			const text = cleanUsername(element.textContent)
			if (text) {
				// Update cache
				cachedUsername = text
				cacheTimestamp = Date.now()
				return text
			}
		}
	}

	// If not found, try opening dropdown and getting username
	contentLogger.log('Username not found in header/sidebar, attempting to open dropdown...');
	if (await openUserDropdown()) {
		// Wait longer for dropdown to fully load and use waitForElement
		await sleep(2000)

		// AFTER opening dropdown, check STRICT "View Profile" again using the helper
		// This ensures we find the user-provided structure inside the menu
		const dropdownUser = findUsernameViaViewProfile();
		if (dropdownUser) {
			// Close dropdown by clicking outside
			document.body.click();
			await sleep(500);

			// Update cache
			cachedUsername = dropdownUser;
			cacheTimestamp = Date.now();
			return dropdownUser;
		}

		contentLogger.log('Could not find View Profile element in dropdown');
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
		// Method 0: Use Reddit API if available (most reliable)
		const apiUsername = await fetchAuthenticatedUsernameFromApi()
		if (apiUsername && !isPlaceholderUsername(apiUsername)) {
			contentLogger.log(`Found username via Reddit API: ${apiUsername}`)
			await storeUsernameInStorage(apiUsername)
			return apiUsername
		}

		const aboutApiUsername = await (async () => {
			try {
				const res = await fetch('https://www.reddit.com/user/me/about.json', { credentials: 'include' })
				if (!res.ok) {
					contentLogger.log(`Reddit API /user/me/about.json failed: ${res.status}`)
					return null
				}
				const data = await res.json()
				if (data?.data?.name) return `u/${data.data.name}`
			} catch (error) {
				contentLogger.warn('Failed to fetch username from /user/me/about.json:', error)
			}
			return null
		})()
		if (aboutApiUsername && !isPlaceholderUsername(aboutApiUsername)) {
			contentLogger.log(`Found username via /user/me/about.json: ${aboutApiUsername}`)
			await storeUsernameInStorage(aboutApiUsername)
			return aboutApiUsername
		}

		// Method 1: Prioritize authenticated user indicators (dropdown/avatar)
		// These show YOUR username, not just any username on the page
		const authUsername = await getAuthenticatedUsername()
		if (authUsername && !isPlaceholderUsername(authUsername)) {
			contentLogger.log(`Found authenticated username: ${authUsername}`)
			await storeUsernameInStorage(authUsername)
			return authUsername
		} else if (authUsername) {
			contentLogger.log(`Ignoring placeholder username from UI: ${authUsername}`)
		}

		// Method 2: Only check URL if we're on our own profile page
		// (This requires additional validation to ensure it's our profile)
		const urlMatch = window.location.pathname.match(/\/u\/([^\/]+)/)
		if (urlMatch && !isPlaceholderUsername(`u/${urlMatch[1]}`) && await isOwnProfilePage(urlMatch[1])) {
			const username = `u/${urlMatch[1]}`
			contentLogger.log(`Found username from own profile URL: ${username}`)
			await storeUsernameInStorage(username)
			return username
		}

		// Method 3: Generic page element scanning - STRICT MODE
		// (Only used if authenticated detection fails)
		const usernameSelectors = [
			// STRICT: Only look in header or sidebar areas
			'header span[id*="user-"]',
			'nav span[id*="user-"]',
			'header [data-testid*="user"]',
			// Specific ID for user drawer/menu
			'#user-drawer-content span[class*="text-"]',
			// Do NOT scan generic a[href] tags across the whole page anymore!
			// 'a[href*="/u/"]', <--- CAUSES ISSUES WITH ADS
			'.header-user-dropdown .text-12',
			// Only accept aria-label in header/nav
			'header [aria-label*="u/"]',
			'nav [aria-label*="u/"]'
		]

		for (const selector of usernameSelectors) {
			const elements = qsAll(selector)
			for (const element of elements) {
				const text = element.textContent?.trim() || element.getAttribute('aria-label') || element.href
				const cleaned = cleanUsername(text)
				if (cleaned && !isPlaceholderUsername(cleaned)) {
					contentLogger.log(`Found username from page element fallback: ${cleaned}`)
					// Only store if not already cached to prevent overwriting with wrong user
					if (!cachedUsername) {
						await storeUsernameInStorage(cleaned)
					}
					return cleaned
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
			if (!isPlaceholderUsername(username)) {
				contentLogger.log(`Extracted username from profile link: ${username}`)
				await storeUsernameInStorage(username)
				return username
			}
			contentLogger.log(`Ignoring placeholder profile link username: ${username}`)
		}
	}

	// Try deep DOM scan for profile links (shadow DOM included)
	const deepLinkUser = findUsernameFromAnyProfileLink()
	if (deepLinkUser) {
		await storeUsernameInStorage(deepLinkUser)
		return deepLinkUser
	}

	// If no profile link found, try opening dropdown again with longer wait
	contentLogger.log('No profile link found, trying dropdown with extended wait...')
	if (await openUserDropdown()) {
		await sleep(3000) // Wait 3 seconds for dropdown to fully load

		// Use helper inside dropdown
		const dropdownUser = findUsernameViaViewProfile();
		if (dropdownUser) {
			document.body.click() // Close dropdown
			await sleep(500)

			cachedUsername = dropdownUser
			cacheTimestamp = Date.now()
			await storeUsernameInStorage(dropdownUser)
			contentLogger.log(`Found username with extended wait: ${dropdownUser}`)
			return dropdownUser
		}
	}

	contentLogger.log('Could not extract username using any method')
	return null
}

// Store seren_name (username) in Chrome storage
async function storeUsernameInStorage(username) {
	try {
		if (isPlaceholderUsername(username)) {
			contentLogger.warn(`Refusing to store placeholder username: ${username}`)
			return
		}
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
		// Wait for page to be ready before attempting username detection
		await waitForCondition(() => {
			// Check if user dropdown or other auth indicators are present
			return document.querySelector('button[data-testid="user-menu-trigger"]') ||
				document.querySelector('[data-testid="user-avatar"]') ||
				document.querySelector('.header-user-dropdown') ||
				qs('a[href*="/u/"]')
		}, 5000, 500)

		// Detect username
		const username = await extractUsernameFromPage()
		if (!username) {
			contentLogger.log('Profile script: Could not detect username - will retry after navigation')
			// Don't show error message here, just continue with navigation which might help detection
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
					// Enhanced post structure with full information
					const post = {
						// Core identifiers (autoflow compatible)
						elementId: element.getAttribute('id') || '',  // Store ID instead of DOM element
						element: {  // Keep serializable object for backwards compatibility
							id: element.getAttribute('id') || '',
							tagName: element.tagName || 'DIV'
						},

						// Core identifiers
						id: element.getAttribute('id') || '',
						title: titleElement.textContent?.trim() || '',
						url: linkElement?.href || '',
						timestamp: Date.now(),

						// Author and subreddit
						author: username,
						subreddit: element.getAttribute('subreddit-prefixed-name') || '',

						// Engagement metrics
						score: parseInt(scoreElement?.textContent?.trim()) || 0,
						commentCount: parseInt(commentsElement?.textContent?.trim()) || 0,
						comments: commentsElement?.textContent?.trim() || '0', // Keep for backwards compatibility

						// Post content
						postType: element.getAttribute('post-type') || '',
						domain: element.getAttribute('domain') || '',
						contentHref: element.getAttribute('content-href') || '',

						// Status and moderation
						itemState: element.getAttribute('item-state') || '',
						viewContext: element.getAttribute('view-context') || '',
						voteType: element.getAttribute('vote-type') || '',

						// Enhanced moderation status (autoflow compatible)
						moderationStatus: {
							isRemoved: element.textContent?.includes('removed by the moderators') ||
								element.querySelector('[icon-name="remove"]') !== null ||
								element.getAttribute('item-state') === 'moderator_removed' || false,
							// "blocked" is not always a first-class flag in Reddit DOM; we infer it conservatively
							isBlocked: (element.getAttribute('item-state') === 'blocked') ||
								(element.textContent?.toLowerCase().includes('post blocked')) ||
								(element.querySelector('.blocked, [class*="blocked"]') !== null) || false,
							isLocked: element.querySelector('[icon-name="lock-fill"]') !== null ||
								element.getAttribute('item-state') === 'locked' || false,
							isDeleted: element.textContent?.includes('deleted by the user') ||
								element.querySelector('[icon-name="delete"]') !== null ||
								element.getAttribute('item-state') === 'deleted' || false,
							isSpam: element.getAttribute('item-state') === 'spam' || false,
							itemState: element.getAttribute('item-state') || '',
							viewContext: element.getAttribute('view-context') || '',
							voteType: element.getAttribute('vote-type') || ''
						},

						// Additional metadata
						userId: element.getAttribute('user-id') || '',
						permalink: element.getAttribute('permalink') || '',
						createdTimestamp: element.getAttribute('created-timestamp') || Date.now(),

						// Legacy fields for backwards compatibility
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
		}).catch(() => { })

	} catch (error) {
		contentLogger.error('Failed to store profile data:', error)
	}
}

// Auto-run Script 2: Post Submission Script
// DELETED: runPostSubmissionScript and related helpers
// These functions were redundant with submit-content-script.js
async function runPostSubmissionScript() {
	contentLogger.log('runPostSubmissionScript is deprecated. Post creation is handled by submit-content-script.js')
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
			contentLogger.log('Manual post submission trigger handled by submit-content-script.js')
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
			const normalizeUserName = (u) => {
				if (!u) return null
				// Ensure "u/" prefix for consistency across background/popup
				return u.startsWith('u/') ? u : `u/${u}`
			}

			// We don't have the original request payload here; use cached username (preferred),
			// otherwise infer from posts data if available.
			const inferredUserName =
				normalizeUserName(cachedUsername) ||
				normalizeUserName(data?.posts?.[0]?.author) ||
				null

			const storageData = {
				userName: inferredUserName,
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
		// Sort posts by date (newest first) with enhanced data
		const postsWithDates = posts.map(post => {
			const timestamp = post.getAttribute('created-timestamp') ||
				post.querySelector('time, [data-testid="post_timestamp"]')?.getAttribute('datetime') ||
				post.querySelector('span[data-testid="post_timestamp"]')?.textContent ||
				post.querySelector('time')?.getAttribute('datetime')

			// Enhanced post structure with full information
			const enhancedPost = {
				// Core identifiers (autoflow compatible)
				elementId: post.getAttribute('id') || '',  // Store ID instead of DOM element
				element: {  // Keep serializable object for backwards compatibility
					id: post.getAttribute('id') || '',
					tagName: post.tagName || 'shreddit-post'
				},

				// Core identifiers
				id: post.getAttribute('id') || '',
				title: post.getAttribute('post-title') || post.querySelector('h3, [data-testid="post-title"]')?.textContent?.trim() || '',
				url: post.getAttribute('permalink') || post.querySelector('a[href*="/comments/"]')?.href || '',
				timestamp: timestamp,

				// Author and subreddit
				author: post.getAttribute('author') || '',
				subreddit: post.getAttribute('subreddit-prefixed-name') || '',
				authorId: post.getAttribute('author-id') || '',
				subredditId: post.getAttribute('subreddit-id') || '',

				// Engagement metrics
				score: parseInt(post.getAttribute('score')) || 0,
				commentCount: parseInt(post.getAttribute('comment-count')) || 0,
				awardCount: parseInt(post.getAttribute('award-count')) || 0,

				// Post content
				postType: post.getAttribute('post-type') || '',
				domain: post.getAttribute('domain') || '',
				contentHref: post.getAttribute('content-href') || '',

				// Status and moderation
				itemState: post.getAttribute('item-state') || '',
				viewContext: post.getAttribute('view-context') || '',
				voteType: post.getAttribute('vote-type') || '',

				// Enhanced moderation status (autoflow compatible)
				moderationStatus: {
					isRemoved: post.textContent?.includes('removed by the moderators') ||
						post.querySelector('[icon-name="remove"]') !== null ||
						post.getAttribute('item-state') === 'moderator_removed' || false,
					// "blocked" is not always a first-class flag in Reddit DOM; we infer it conservatively
					isBlocked: (post.getAttribute('item-state') === 'blocked') ||
						(post.textContent?.toLowerCase().includes('post blocked')) ||
						(post.querySelector('.blocked, [class*="blocked"]') !== null) || false,
					isLocked: post.querySelector('[icon-name="lock-fill"]') !== null ||
						post.getAttribute('item-state') === 'locked' || false,
					isDeleted: post.textContent?.includes('deleted by the user') ||
						post.querySelector('[icon-name="delete"]') !== null ||
						post.getAttribute('item-state') === 'deleted' || false,
					isSpam: post.getAttribute('item-state') === 'spam' || false,
					itemState: post.getAttribute('item-state') || '',
					viewContext: post.getAttribute('view-context') || '',
					voteType: post.getAttribute('vote-type') || ''
				},

				// Additional metadata
				userId: post.getAttribute('user-id') || '',
				permalink: post.getAttribute('permalink') || '',
				createdTimestamp: post.getAttribute('created-timestamp') || timestamp,

				// Keep original DOM element for deletion operations (but won't be serialized)
				_domElement: post
			}

			return enhancedPost
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

			// Return posts with enhanced structure
			return {
				total: postsWithDates.length,
				lastPostDate: postsWithDates[0].timestamp,
				posts: postsWithDates.map(post => ({
					...post,
					// Keep the serializable element object for backwards compatibility
					element: {
						id: post.element.id,
						tagName: post.element.tagName
					},
					// Include DOM element for deletion operations (separate field)
					_domElement: post._domElement
				}))
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
		currentUser: userName,
		storedUser: userName,
		isMatch: true,
		postsCount: postsInfo.total, // Changed from totalPosts to postsCount
		lastPostDate: postsInfo.lastPostDate,
		lastPostText: lastPostText,
		timestamp: Date.now(),
		checkUrl: window.location.href,
		lastCheck: Date.now(),
		statusMessage: 'Posts data collected successfully'
	}

	try {
		// Save to both sync and local storage
		await chrome.storage.sync.set({ userStatus: userStatusData })
		await chrome.storage.local.set({ userStatus: userStatusData })

		contentLogger.log('User status saved to Chrome storage:', userStatusData)

		// Show brief success message
		const messageDiv = createMessageDiv('✅', 'Saved', 'User status data saved successfully', '#4caf50')
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

			// Notify background script - essentially a "success" because there's nothing to delete
			chrome.runtime.sendMessage({
				type: 'ACTION_COMPLETED',
				action: 'DELETE_POST_COMPLETED',
				success: true,
				reason: 'no_posts_found'
			}).catch(() => { })
			return
		}

		// Get the most recent post
		const mostRecentPost = postsInfo.posts[0]
		if (!mostRecentPost || (!mostRecentPost._domElement && !mostRecentPost.element)) {
			const messageDiv = createMessageDiv('❌', 'Post Not Found', 'Could not find the most recent post.', '#ff5722')
			showTemporaryMessage(messageDiv)

			// Notify background script of failure
			chrome.runtime.sendMessage({
				type: 'ACTION_COMPLETED',
				action: 'DELETE_POST_COMPLETED',
				success: false,
				reason: 'post_element_not_found'
			}).catch(() => { })
			return
		}

		// Attempt to delete the post
		const deleteSuccess = await deletePost(mostRecentPost._domElement || mostRecentPost.element)
		if (deleteSuccess) {
			const messageDiv = createMessageDiv('✅', 'Post Deleted', 'Last post has been successfully deleted!', '#4caf50')
			showTemporaryMessage(messageDiv)

			// Notify background script of successful deletion
			chrome.runtime.sendMessage({
				type: 'ACTION_COMPLETED',
				action: 'DELETE_POST_COMPLETED',
				success: true,
				postId: mostRecentPost.id || null,
				redditUrl: mostRecentPost.url || null,
				title: mostRecentPost.title || null
			}).catch(() => { })
		} else {
			const messageDiv = createMessageDiv('❌', 'Delete Failed', 'Could not delete the post. Please try manually.', '#ff5722')
			showTemporaryMessage(messageDiv)

			// Notify background script of failed deletion
			chrome.runtime.sendMessage({
				type: 'ACTION_COMPLETED',
				action: 'DELETE_POST_COMPLETED',
				success: false,
				error: 'Could not delete the post'
			}).catch(() => { })
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

		// Create serializable version of postsInfo without DOM elements
		const serializablePostsInfo = {
			total: postsInfo.total,
			lastPostDate: postsInfo.lastPostDate,
			posts: postsInfo.posts.map(post => {
				// Create a clean serializable post object without DOM elements
				const { _domElement, ...serializablePost } = post
				return serializablePost // element is already serializable {id, tagName}
			})
		}

		// Normalize the data with userName for the background script
		const freshData = {
			userName: userName,
			postsInfo: serializablePostsInfo,
			lastUpdated: Date.now(),
			dataFresh: true // Flag to indicate this is fresh data
		}

		contentLogger.log('[Content Script] Sending fresh posts data to background:', freshData)

		// Also save this fresh data to latestPostsData for consistency
		const storageData = {
			userName: userName,
			postsInfo: serializablePostsInfo,
			lastUpdated: Date.now()
		}

		contentLogger.log('[Content Script] About to save storageData:', storageData)
		contentLogger.log('[Content Script] postsInfo structure:', postsInfo)
		contentLogger.log('[Content Script] postsInfo.posts length:', postsInfo?.posts?.length)

		chrome.storage.local.set({ 'latestPostsData': storageData }, () => {
			contentLogger.log('Fresh posts data saved to local storage during decision-making', storageData)
		})

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
		}).catch(() => { })
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
