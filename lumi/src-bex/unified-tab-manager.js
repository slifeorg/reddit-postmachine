import { bgLogger } from "./logger.js"

/**
 * Unified Tab Manager
 * Manages a single dedicated tab for ALL extension operations
 * Implements single-tab pattern where one tab is reused for all operations
 * by reloading with new URLs as needed
 */

const UNIFIED_TAB_ID_KEY = 'unifiedTabId'

// Track listeners per tab to prevent duplicates
const tabListeners = {}

// Track the current controlled tab ID to enforce single-tab control
let currentControlledTabId = null

// Track the current operation type for the tab
let currentOperationType = null

// Track post creation lock to avoid premature tab switches
let postCreationInFlight = false
let postCreationResolver = null
let postCreationTimeoutId = null
let postCreationFocusListener = null

// Operation types
const OPERATIONS = {
	EXTENSION: 'extension',
	REDDIT: 'reddit',
	POST_CREATION: 'post_creation',
	POST_COLLECTION: 'post_collection',
	POST_DELETION: 'post_deletion'
}

/**
 * True if URL points to Reddit chat. We never want to close or "adopt" chat tabs.
 */
export function isRedditChatUrl(url) {
	try {
		if (!url) return false
		const u = new URL(url)
		return u.hostname === 'chat.reddit.com'
	} catch (_) {
		return false
	}
}

/**
 * Get the stored unified tab ID from storage
 */
export async function getStoredUnifiedTabId() {
	try {
		const result = await chrome.storage.local.get([UNIFIED_TAB_ID_KEY])
		return result[UNIFIED_TAB_ID_KEY] || null
	} catch (error) {
		bgLogger.error('[UnifiedTabMgr] Failed to get stored unified tab ID:', error)
		return null
	}
}

/**
 * Save the unified tab ID to storage
 */
export async function saveUnifiedTabId(tabId) {
	try {
		await chrome.storage.local.set({ [UNIFIED_TAB_ID_KEY]: tabId })
		bgLogger.log(`[UnifiedTabMgr] Saved unified tab ID: ${tabId}`)
	} catch (error) {
		bgLogger.error('[UnifiedTabMgr] Failed to save unified tab ID:', error)
	}
}

/**
 * Clear the stored unified tab ID
 */
export async function clearUnifiedTabId() {
	try {
		await chrome.storage.local.remove([UNIFIED_TAB_ID_KEY])
		bgLogger.log('[UnifiedTabMgr] Cleared unified tab ID')
	} catch (error) {
		bgLogger.error('[UnifiedTabMgr] Failed to clear unified tab ID:', error)
	}
}

/**
 * Validate if a tab ID is still valid and accessible
 */
export async function isTabValid(tabId) {
	if (!tabId) return false
	try {
		const tab = await chrome.tabs.get(tabId)
		return tab && !tab.discarded
	} catch (error) {
		bgLogger.log(`[UnifiedTabMgr] Tab ${tabId} is no longer valid:`, error.message)
		return false
	}
}

/**
 * Get the unified tab for operations
 * Implements single-tab pattern:
 * - If a valid tab exists, navigate it to the target URL
 * - If the stored tab ID is invalid, create a new one
 * - Otherwise create a new tab
 *
 * @param {string} targetUrl - The URL to navigate to
 * @param {string} operationType - The type of operation (optional)
 * @returns {Promise<number>} Tab ID
 */
export async function getUnifiedTab(targetUrl, operationType = null) {
	try {
		// Wait for post creation to finish before switching to another operation
		if (operationType !== OPERATIONS.POST_CREATION && postCreationInFlight) {
			bgLogger.log('[UnifiedTabMgr] Post creation in-flight; waiting before opening/reusing tab for new operation')
			await waitForPostCreationCompletion()
		}

		const storedTabId = await getStoredUnifiedTabId()

		// Check if stored tab is still valid
		if (storedTabId && await isTabValid(storedTabId)) {
			bgLogger.log(`[UnifiedTabMgr] Reusing unified tab ${storedTabId} for ${operationType || 'operation'}`)

			// Clean up old listeners before reusing the tab
			cleanupTabListeners(storedTabId)

			// Navigate to the new URL
			await chrome.tabs.update(storedTabId, { url: targetUrl, active: true })

			// Set this as the controlled tab
			setCurrentControlledTabId(storedTabId, operationType)
			return storedTabId
		}

		// Stored tab is invalid, clear it
		if (storedTabId) {
			bgLogger.log(`[UnifiedTabMgr] Stored tab ${storedTabId} is no longer valid, clearing`)
			cleanupTabListeners(storedTabId)
			await clearUnifiedTabId()
		}

		// Create new unified tab
		bgLogger.log(`[UnifiedTabMgr] Creating new unified tab with URL: ${targetUrl} for ${operationType || 'operation'}`)
		const newTab = await chrome.tabs.create({
			url: targetUrl,
			active: true
		})

		await saveUnifiedTabId(newTab.id)
		// Set this as the controlled tab
		setCurrentControlledTabId(newTab.id, operationType)
		bgLogger.log(`[UnifiedTabMgr] Created new unified tab ${newTab.id}`)
		return newTab.id
	} catch (error) {
		bgLogger.error('[UnifiedTabMgr] Failed to get unified tab:', error)
		throw error
	}
}

/**
 * Convenience method to get the extension UI tab
 */
export async function getExtensionTab() {
	const extensionUrl = `chrome-extension://${chrome.runtime.id}/www/index.html#/popup`
	return getUnifiedTab(extensionUrl, OPERATIONS.EXTENSION)
}

/**
 * Convenience method to get a Reddit tab
 */
export async function getRedditTab(targetUrl = 'https://www.reddit.com/submit') {
	return getUnifiedTab(targetUrl, OPERATIONS.REDDIT)
}

/**
 * Convenience method to get a post creation tab
 */
export async function getPostCreationTab(postData) {
	const cleanSubreddit = (postData.subreddit || 'sphynx').replace(/^r\//i, '')
	const submitUrl = `https://www.reddit.com/r/${cleanSubreddit}/submit`
	startPostCreationLock()
	return getUnifiedTab(submitUrl, OPERATIONS.POST_CREATION)
}

/**
 * Convenience method to get a post collection tab
 */
export async function getPostCollectionTab(userName) {
	const cleanUsername = userName.replace(/^u\//, '')
	const postsUrl = `https://www.reddit.com/user/${cleanUsername}/submitted/`
	return getUnifiedTab(postsUrl, OPERATIONS.POST_COLLECTION)
}

/**
 * Clean up old listeners for a tab
 */
export function cleanupTabListeners(tabId) {
	if (tabListeners[tabId]) {
		bgLogger.log(`[UnifiedTabMgr] Cleaning up ${tabListeners[tabId].length} old listeners for tab ${tabId}`)
		tabListeners[tabId].forEach(listener => {
			chrome.tabs.onUpdated.removeListener(listener)
		})
		delete tabListeners[tabId]
	}
}

/**
 * Register a listener for a tab
 */
export function registerTabListener(tabId, listener) {
	if (!tabListeners[tabId]) {
		tabListeners[tabId] = []
	}
	tabListeners[tabId].push(listener)
	chrome.tabs.onUpdated.addListener(listener)
}

/**
 * Handle tab closure cleanup
 */
export async function handleTabClosed(tabId) {
	try {
		// Clean up any listeners for this tab
		cleanupTabListeners(tabId)

		const storedTabId = await getStoredUnifiedTabId()
		if (storedTabId === tabId) {
			bgLogger.log(`[UnifiedTabMgr] Unified tab ${tabId} was closed, clearing stored ID`)
			await clearUnifiedTabId()
		}

		// Clear controlled tab tracking if this was the controlled tab
		if (currentControlledTabId === tabId) {
			bgLogger.log(`[UnifiedTabMgr] Controlled tab ${tabId} was closed, clearing control`)
			currentControlledTabId = null
			currentOperationType = null
			releasePostCreationLock('tab_closed')
		}
	} catch (error) {
		bgLogger.error('[UnifiedTabMgr] Failed to handle tab closure:', error)
	}
}

/**
 * Get the current controlled tab ID and operation type
 */
export function getCurrentControlledTab() {
	return {
		tabId: currentControlledTabId,
		operationType: currentOperationType
	}
}

/**
 * Set the current controlled tab ID and operation type
 */
export function setCurrentControlledTabId(tabId, operationType = null) {
	if (currentControlledTabId !== null && currentControlledTabId !== tabId) {
		bgLogger.log(`[UnifiedTabMgr] Replacing controlled tab ${currentControlledTabId} with ${tabId}`)
	}
	currentControlledTabId = tabId
	currentOperationType = operationType

	if (operationType === OPERATIONS.POST_CREATION) {
		startPostCreationLock()
		ensurePostCreationTabActive()
	}

	bgLogger.log(`[UnifiedTabMgr] Set controlled tab to ${tabId} for operation: ${operationType}`)
}

/**
 * Clear the current controlled tab ID
 */
export function clearCurrentControlledTabId() {
	if (currentControlledTabId !== null) {
		bgLogger.log(`[UnifiedTabMgr] Clearing controlled tab ${currentControlledTabId}`)
	}
	currentControlledTabId = null
	currentOperationType = null
	releasePostCreationLock('control_cleared')
}

/**
 * Reload the unified tab with a new URL
 * This is the primary method for switching between operations
 */
export async function reloadUnifiedTab(newUrl, operationType = null) {
	const current = getCurrentControlledTab()

	// Do not switch away from post creation until it finishes
	if (operationType !== OPERATIONS.POST_CREATION && postCreationInFlight) {
		bgLogger.log('[UnifiedTabMgr] Waiting for post creation lock to release before reloading tab')
		await waitForPostCreationCompletion()
	}

	if (!current.tabId) {
		// No tab currently controlled, get a new one
		return getUnifiedTab(newUrl, operationType)
	}

	try {
		// Validate the tab still exists
		if (await isTabValid(current.tabId)) {
			bgLogger.log(`[UnifiedTabMgr] Reloading tab ${current.tabId} with new URL: ${newUrl}`)
			await chrome.tabs.update(current.tabId, { url: newUrl, active: true })
			setCurrentControlledTabId(current.tabId, operationType)
			return current.tabId
		} else {
			// Tab is invalid, clear and get new
			bgLogger.log(`[UnifiedTabMgr] Current tab ${current.tabId} is invalid, getting new tab`)
			await clearUnifiedTabId()
			clearCurrentControlledTabId()
			return getUnifiedTab(newUrl, operationType)
		}
	} catch (error) {
		bgLogger.error('[UnifiedTabMgr] Failed to reload unified tab:', error)
		throw error
	}
}

/**
 * Initialize the unified Reddit tab for autoflow without closing existing tabs.
 *
 * Behavior:
 * - If a Reddit tab is currently active, reuse it
 * - Otherwise, reuse the first existing Reddit tab
 * - Only create a new Reddit tab if no Reddit tab exists at all
 * - Always navigate the chosen tab to the target URL and mark it as the unified tab
 *
 * @param {string} userName - Optional username to navigate directly to submitted page
 */
export async function closeAllRedditTabsAndOpenFresh(userName) {
	try {
		bgLogger.log('[UnifiedTabMgr] Initializing unified Reddit tab for autoflow (reuse active, close others)')

		// Determine the URL to navigate to
		let targetUrl = 'https://www.reddit.com/'
		if (userName) {
			const cleanUsername = userName.replace('u/', '')
			targetUrl = `https://www.reddit.com/user/${cleanUsername}/submitted/`
			bgLogger.log(`[UnifiedTabMgr] 🚀 Using direct navigation to user's submitted page: ${targetUrl}`)
		}

		// Find existing Reddit tabs (excluding chat tabs — we must not close or control those)
		const allRedditTabs = await chrome.tabs.query({ url: '*://*.reddit.com/*' })
		const redditTabs = allRedditTabs.filter(tab => !isRedditChatUrl(tab.url))

		// Try to find the currently active (non-chat) Reddit tab in the current window
		const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true })
		let preferredTab = null
		if (activeTabs.length > 0) {
			const activeTab = activeTabs[0]
			if (activeTab.url && activeTab.url.includes('reddit.com') && !isRedditChatUrl(activeTab.url)) {
				preferredTab = activeTab
			}
		}

		// If no active Reddit tab in current window, fall back to any existing Reddit tab
		if (!preferredTab && redditTabs.length > 0) {
			preferredTab = redditTabs[0]
		}

		// Close all other (non-chat) Reddit tabs except the preferred one (if any)
		const tabsToClose = redditTabs.filter(tab => !preferredTab || tab.id !== preferredTab.id)
		if (tabsToClose.length > 0) {
			bgLogger.log(`[UnifiedTabMgr] Closing ${tabsToClose.length} other Reddit tabs, keeping tab ${preferredTab ? preferredTab.id : 'none yet'}`)

			// Best-effort: ask those tabs to remove beforeunload listeners before closing
			const removePromises = tabsToClose.map(tab =>
				chrome.tabs.sendMessage(tab.id, { type: 'REMOVE_BEFOREUNLOAD_LISTENERS' }).catch(() => {
					bgLogger.log(`[UnifiedTabMgr] Could not send remove beforeunload message to tab ${tab.id}`)
				})
			)

			await Promise.race([
				Promise.all(removePromises),
				new Promise(resolve => setTimeout(resolve, 500))
			])

			// Actually close the extra tabs
			await chrome.tabs.remove(tabsToClose.map(tab => tab.id))

			// Clean up listeners for closed tabs
			tabsToClose.forEach(tab => cleanupTabListeners(tab.id))
		}

		let targetTab
		if (preferredTab) {
			bgLogger.log(`[UnifiedTabMgr] Reusing existing Reddit tab ${preferredTab.id} for autoflow`)

			// Clean up any old listeners for this tab before we start controlling it
			cleanupTabListeners(preferredTab.id)

			try {
				// Best-effort: remove beforeunload listeners from the tab we're about to control
				await chrome.tabs.sendMessage(preferredTab.id, {
					type: 'REMOVE_BEFOREUNLOAD_LISTENERS'
				}).catch(() => {
					// Ignore errors from tabs that don't have the content script
					bgLogger.log(`[UnifiedTabMgr] Could not send remove beforeunload message to tab ${preferredTab.id}`)
				})
			} catch (e) {
				// Ignore errors here; they shouldn't block autoflow
			}

			targetTab = await chrome.tabs.update(preferredTab.id, { url: targetUrl, active: true })
		} else {
			bgLogger.log('[UnifiedTabMgr] No existing non-chat Reddit tab found; creating new one for autoflow')

			targetTab = await chrome.tabs.create({
				url: targetUrl,
				active: true
			})
		}

		// Track this tab as the unified Reddit tab
		await saveUnifiedTabId(targetTab.id)
		setCurrentControlledTabId(targetTab.id, OPERATIONS.REDDIT)

		bgLogger.log(`[UnifiedTabMgr] Unified Reddit tab for autoflow is ${targetTab.id}`)
		return targetTab.id
	} catch (error) {
		bgLogger.error('[UnifiedTabMgr] Failed to initialize unified Reddit tab for autoflow:', error)
		throw error
	}
}

/**
 * Export operation types for external use
 */
export { OPERATIONS }

/**
 * Post creation lock helpers to ensure the submit flow finishes before
 * the unified tab is repurposed for another operation.
 */
function startPostCreationLock() {
	if (postCreationInFlight) return
	postCreationInFlight = true
	if (postCreationTimeoutId) {
		clearTimeout(postCreationTimeoutId)
		postCreationTimeoutId = null
	}
	ensurePostCreationTabActive()
	attachPostCreationFocusGuard()
	bgLogger.log('[UnifiedTabMgr] Post creation lock engaged')
}

export function releasePostCreationLock(reason = 'completed') {
	if (!postCreationInFlight) return
	postCreationInFlight = false
	if (postCreationTimeoutId) {
		clearTimeout(postCreationTimeoutId)
		postCreationTimeoutId = null
	}
	if (postCreationResolver) {
		postCreationResolver()
		postCreationResolver = null
	}
	detachPostCreationFocusGuard()
	bgLogger.log(`[UnifiedTabMgr] Post creation lock released (${reason})`)
}

export async function waitForPostCreationCompletion(timeoutMs = 60000) {
	if (!postCreationInFlight) return true

	return new Promise((resolve) => {
		// Always keep the latest resolver
		postCreationResolver = () => resolve(true)

		if (postCreationTimeoutId) clearTimeout(postCreationTimeoutId)

		postCreationTimeoutId = setTimeout(() => {
			if (postCreationInFlight) {
				bgLogger.warn(`[UnifiedTabMgr] Post creation lock timeout (${timeoutMs}ms). Allowing transition.`)
				releasePostCreationLock('timeout')
			}
			resolve(true)
		}, timeoutMs)
	})
}

function ensurePostCreationTabActive() {
	try {
		if (currentControlledTabId) {
			chrome.tabs.update(currentControlledTabId, { active: true }).catch(() => { })
		}
	} catch (_) { }
}

function attachPostCreationFocusGuard() {
	if (postCreationFocusListener) return
	postCreationFocusListener = (activeInfo) => {
		if (!postCreationInFlight) return
		if (!currentControlledTabId) return
		if (activeInfo?.tabId && activeInfo.tabId !== currentControlledTabId) {
			ensurePostCreationTabActive()
		}
	}
	try {
		chrome.tabs.onActivated.addListener(postCreationFocusListener)
	} catch (_) {
		postCreationFocusListener = null
	}
}

function detachPostCreationFocusGuard() {
	if (!postCreationFocusListener) return
	try {
		chrome.tabs.onActivated.removeListener(postCreationFocusListener)
	} catch (_) { }
	postCreationFocusListener = null
}
