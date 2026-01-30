import { bgLogger } from "./logger.js";

 /**
 * Message Handlers Module
 * Handles all chrome.runtime.onMessage events and tab management operations
 */

import {
	AutoFlowStateManager,
	SM_STEPS,
	tabStates,
	processedTabs,
	CHECK_INTERVAL,
	getCheckIntervalId,
	setCheckIntervalId,
	touchTabState
} from './state-manager.js'
import { PostDataService, fetchNextPost } from './post-service.js'
import {
	getUnifiedTab,
	getExtensionTab,
	getRedditTab,
	getPostCreationTab,
	getPostCollectionTab,
	reloadUnifiedTab,
	handleTabClosed,
	registerTabListener,
	cleanupTabListeners,
	getCurrentControlledTab,
	OPERATIONS,
	closeAllRedditTabsAndOpenFresh,
	getStoredUnifiedTabId,
	isTabValid,
	isRedditChatUrl,
	releasePostCreationLock
} from './unified-tab-manager.js'

// Finalize reload listeners and timeouts
const finalizeReloadListeners = {}
const finalizeReloadTimeouts = {}

// Track in-flight GET_POSTS actions to prevent duplicates
const inFlightGetPosts = new Set()

// Track immediate moderation-triggered delete to avoid repeated deletes from frequent POSTS_UPDATED events
const inFlightImmediateModerationDelete = new Set()

// Track periodic monitoring checks for blocked posts
const periodicMonitoringIntervals = new Map()

// Old-post cleanup threshold (minutes)
const OLD_POST_THRESHOLD_MINUTES = 20

function normalizeTimestampMs(value) {
	if (!value) return null
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value < 1e12 ? value * 1000 : value
	}
	const parsed = Date.parse(value)
	if (Number.isNaN(parsed)) return null
	return parsed
}

function getPostsOlderThanMinutes(posts, minutes) {
	if (!Array.isArray(posts) || posts.length === 0) return []
	const cutoff = Date.now() - minutes * 60 * 1000
	return posts.filter((post) => {
		const ts = normalizeTimestampMs(post?.timestamp)
		return ts && ts <= cutoff
	})
}

async function sendDeletePostCommand(tabId, post) {
	if (!tabId || !post) return false
	try {
		await chrome.tabs.sendMessage(tabId, {
			type: 'REDDIT_POST_MACHINE_DELETE_POST',
			payload: { post }
		})
		return true
	} catch (err) {
		bgLogger.error(`[BG] ❌ Failed to send delete command for post ${post?.id || 'unknown'}:`, err)
		return false
	}
}

async function startDeleteOldPostsFlow(tabId, state, postsToDelete) {
	if (!tabId || !postsToDelete?.length) return false

	const userName = state?.userName || null
	bgLogger.log(
		`[BG] 🧹 Found ${postsToDelete.length} posts older than ${OLD_POST_THRESHOLD_MINUTES} minutes. Starting deletion queue.`
	)

	const queue = postsToDelete.slice()
	const updatedState = {
		...(state || {}),
		status: SM_STEPS.DELETING_POST,
		userName,
		deletingOldPosts: true,
		// Old-post cleanup is a maintenance queue. We do NOT want to treat it as the
		// "delete_before_create" lock that blocks the whole state machine forever.
		// The create step will be triggered after the queue finishes.
		deletingBeforeCreating: false,
		targetAction: 'delete_old_then_create',
		deleteQueue: queue,
		currentDeletePost: queue[0]
	}

	tabStates[tabId] = updatedState

	await AutoFlowStateManager.saveState('deleting_old_posts', {
		userName,
		targetAction: 'delete_old_then_create',
		tabId,
		deleteQueueSize: queue.length
	})

	const sent = await sendDeletePostCommand(tabId, queue[0])
	if (!sent) {
		// If we fail to send the first delete, keep moving to avoid a stuck queue
		queue.shift()
		updatedState.deleteQueue = queue
		if (queue.length > 0) {
			return sendDeletePostCommand(tabId, queue[0])
		}

		bgLogger.warn('[BG] ⚠️ Unable to dispatch delete commands. Restarting auto-flow check.')
		updatedState.deletingOldPosts = false
		updatedState.deletingBeforeCreating = false
		updatedState.targetAction = 'auto_flow'
		tabStates[tabId] = updatedState
		if (userName) {
			setTimeout(() => {
				handleCheckUserStatus(userName, () => { })
			}, 2000)
		}
		return false
	}

	return true
}

/**
 * Log message to a specific tab
 */
export function logToTab(tabId, message) {
	bgLogger.log(`[BG Log -> Tab ${tabId}] ${message}`)
	if (tabId) {
		chrome.tabs.sendMessage(
			tabId,
			{
				type: 'BG_LOG',
				message: message
			}
		).catch(() => { })
	}
}

function getLatestPostModerationSignal(postsInfo) {
	const latest = postsInfo?.posts?.[0] || null
	if (!latest) return { shouldDelete: false, reason: 'no_posts', latestPost: null }

	// Check for various moderation signals
	const isRemoved = latest?.moderationStatus?.isRemoved === true || latest?.isRemoved === true
	const isBlocked = latest?.moderationStatus?.isBlocked === true || latest?.isBlocked === true
	const isDeleted = latest?.isDeleted === true
	
	// Additional checks for Reddit's moderation indicators
	const hasRemovalReason = latest?.removalReason || latest?.moderationStatus?.removalReason
	const hasBanMessage = latest?.banMessage || latest?.moderationStatus?.banMessage
	const isArchived = latest?.isArchived === true
	const isLocked = latest?.isLocked === true && latest?.numComments === 0 // Locked with no comments might indicate moderation
	
	// Additional checks for blocked posts - more comprehensive detection
	const hasBlockedText = latest?.title?.toLowerCase().includes('[removed]') ||
		latest?.title?.toLowerCase().includes('[blocked]') ||
		latest?.title?.toLowerCase().includes('[deleted]')
	const hasBlockedItemState = latest?.itemState === 'blocked' ||
		latest?.itemState === 'moderator_blocked' ||
		latest?.itemState === 'moderator_removed'
	const hasBlockedViewContext = latest?.viewContext?.includes('blocked') ||
		latest?.viewContext?.includes('removed')
	
	// Check if post is in a moderated state
	const isModerated = isRemoved || isBlocked || isDeleted || hasRemovalReason || hasBanMessage || 
		hasBlockedText || hasBlockedItemState || hasBlockedViewContext
	
	bgLogger.log(`[BG] 🔍 Enhanced moderation check for post "${latest?.title?.substring(0, 50)}...":`, {
		isRemoved, isBlocked, isDeleted, hasRemovalReason, hasBanMessage, isArchived, isLocked,
		hasBlockedText, hasBlockedItemState, hasBlockedViewContext,
		moderationStatus: latest?.moderationStatus,
		removalReason: latest?.removalReason,
		banMessage: latest?.banMessage,
		itemState: latest?.itemState,
		viewContext: latest?.viewContext
	})
	
	if (isModerated) {
		let reason = 'unknown_moderation'
		if (isRemoved) reason = 'post_removed_by_moderator'
		else if (isBlocked) reason = 'post_blocked'
		else if (isDeleted) reason = 'post_deleted'
		else if (hasRemovalReason) reason = 'post_removed_with_reason'
		else if (hasBanMessage) reason = 'post_banned'
		else if (hasBlockedText) reason = 'post_title_blocked'
		else if (hasBlockedItemState) reason = 'post_state_blocked'
		else if (hasBlockedViewContext) reason = 'post_context_blocked'
		
		return { shouldDelete: true, reason, latestPost: latest }
	}
	
	return { shouldDelete: false, reason: null, latestPost: latest }
}

/**
 * Handle POSTS_UPDATED pushed from content script after GET_POSTS.
 * Requirement: if the latest post becomes blocked/removed during the monitoring window,
 * delete it immediately and proceed to create a new one (no need to wait for 20m expiry).
 */
export async function handlePostsUpdated(tabId, storageData, sendResponse) {
	try {
		const userName = storageData?.userName || storageData?.userNameRaw || null
		const postsInfo = storageData?.postsInfo || null
		if (!tabId || !userName || !postsInfo) {
			sendResponse?.({ received: true, ignored: true, reason: 'missing_context' })
			return
		}

		const monitoring = await PostDataService.getActiveMonitoring(userName)
		// Only act "immediately" when we're in the 20-minute monitoring phase.
		if (!monitoring || !monitoring.monitoringEndTime || monitoring.monitoringEndTime <= Date.now()) {
			sendResponse?.({ received: true, ignored: true, reason: 'not_monitoring' })
			return
		}

		const signal = getLatestPostModerationSignal(postsInfo)
		if (!signal.shouldDelete) {
			sendResponse?.({ received: true, ignored: true, reason: 'healthy' })
			return
		}

		const key = `${tabId}:${userName}:${signal.reason}`
		if (inFlightImmediateModerationDelete.has(key)) {
			sendResponse?.({ received: true, deduplicated: true })
			return
		}
		inFlightImmediateModerationDelete.add(key)
		setTimeout(() => inFlightImmediateModerationDelete.delete(key), 30_000)

		bgLogger.warn(
			`[BG] 🚨 IMMEDIATE MODERATION DELETE: Latest post is ${signal.reason} during monitoring. Deleting now and creating a new one.`
		)

		// Clear monitoring so we don't keep waiting; creation should follow after delete.
		await PostDataService.clearActiveMonitoring(userName)
		await chrome.storage.local.remove(['lastDecisionReport'])

		// Stop periodic monitoring since we're handling this now
		stopPeriodicMonitoringCheck(tabId, userName)

		tabStates[tabId] = {
			status: SM_STEPS.DELETING_POST,
			userName,
			deletingBeforeCreating: true,
			targetAction: 'delete_and_create',
			lastPostToDelete: signal.latestPost,
			stepStartTime: Date.now(),
			lastFeedbackTimestamp: Date.now()
		}

		await AutoFlowStateManager.saveState('deleting_post', {
			userName,
			lastPostToDelete: signal.latestPost,
			targetAction: 'delete_and_create',
			tabId,
			reason: signal.reason,
			trigger: 'posts_updated'
		})

		// Use "delete last post" (content-script + DOM helper) which doesn't require a perfect post object.
		await chrome.tabs.sendMessage(tabId, { type: 'DELETE_LAST_POST', userName })
		sendResponse?.({ received: true, started: true })
	} catch (e) {
		bgLogger.error('[BG] Failed handling POSTS_UPDATED for immediate moderation delete:', e)
		sendResponse?.({ received: true, error: e?.message || String(e) })
	}
}

/**
 * Start periodic monitoring for blocked posts during the 20-minute monitoring window
 */
export function startPeriodicMonitoringCheck(tabId, userName) {
	const key = `${tabId}:${userName}`

	// Clear any existing interval for this tab/user
	if (periodicMonitoringIntervals.has(key)) {
		clearInterval(periodicMonitoringIntervals.get(key))
	}

	bgLogger.log(`[BG] 🔄 Starting periodic monitoring for ${userName} on tab ${tabId}`)

	// Check every 30 seconds for blocked posts
	const intervalId = setInterval(async () => {
		try {
			bgLogger.log(`[BG] 🔍 Periodic check for ${userName} - checking tab status...`)

			// 1. Check if tab is valid and not currently reloading
			const tab = await chrome.tabs.get(tabId).catch(() => null)
			if (!tab) {
				bgLogger.warn(`[BG] ⚠️ Periodic check skipped: Tab ${tabId} no longer exists`)
				return
			}

			if (tab.status !== 'complete') {
				bgLogger.log(`[BG] ⏳ Periodic check skipped: Tab ${tabId} is busy (status: ${tab.status})`)
				return
			}

			// Check if tab is currently being reloaded by standard monitoring
			if (tabStates[tabId]?.isReloading) {
				bgLogger.log(`[BG] ⏳ Periodic check skipped: Tab ${tabId} is being reloaded by standard monitoring`)
				return
			}

			const monitoring = await PostDataService.getActiveMonitoring(userName)
			if (!monitoring || !monitoring.monitoringEndTime || monitoring.monitoringEndTime <= Date.now()) {
				// Monitoring ended, clear this interval
				clearInterval(intervalId)
				periodicMonitoringIntervals.delete(key)
				bgLogger.log(`[BG] 🔄 Periodic monitoring ended for ${userName} (monitoring period expired)`)
				return
			}

			bgLogger.log(`[BG] 📊 Periodic check: Tab ready, requesting posts data...`)

			// 2. Send message with proper error handling for closed channels
			chrome.tabs.sendMessage(tabId, { type: 'GET_POSTS', userName }, (response) => {
				if (chrome.runtime.lastError) {
					const msg = chrome.runtime.lastError.message
					if (msg.includes('message channel closed') || msg.includes('Could not establish connection')) {
						bgLogger.log(`[BG] 🔌 Periodic check connection lost (normal during reload): ${msg}`)
					} else {
						bgLogger.error(`[BG] Periodic check message error: ${msg}`)
					}
					return
				}

				if (response && response.success && response.data && response.data.postsInfo) {
					bgLogger.log(`[BG] 📊 Periodic check: Received posts data, analyzing...`)
					const signal = getLatestPostModerationSignal(response.data.postsInfo)
					
					// Enhanced logging for debugging
					bgLogger.log(`[BG] 🔍 Periodic check moderation analysis:`, {
						shouldDelete: signal.shouldDelete,
						reason: signal.reason,
						postTitle: signal.latestPost?.title?.substring(0, 50),
						moderationStatus: signal.latestPost?.moderationStatus,
						isBlocked: signal.latestPost?.isBlocked,
						isRemoved: signal.latestPost?.isRemoved,
						itemState: signal.latestPost?.itemState
					})
					
					// Additional safety check: If API doesn't show blocked but we're in monitoring, 
					// do an extra DOM check to catch any missed blocks
					if (!signal.shouldDelete && signal.latestPost) {
						chrome.tabs.sendMessage(tabId, { 
							type: 'DOM_BLOCKED_CHECK',
							postId: signal.latestPost.id 
						}, (domResponse) => {
							if (chrome.runtime.lastError) {
								bgLogger.log(`[BG] DOM check failed: ${chrome.runtime.lastError.message}`)
								return
							}
							
							if (domResponse && domResponse.isBlocked) {
								bgLogger.warn(`[BG] 🚨 DOM CHECK: Post appears blocked in DOM but not in API. Triggering delete.`)
								// Clear the periodic interval since we're handling this now
								clearInterval(intervalId)
								periodicMonitoringIntervals.delete(key)
								
								// Trigger the same delete logic as POSTS_UPDATED
								handlePostsUpdated(tabId, response.data, () => {})
							}
						})
					}
					
					if (signal.shouldDelete) {
						bgLogger.warn(`[BG] 🚨 PERIODIC CHECK: Latest post is ${signal.reason}. Triggering immediate delete.`)

						// Clear the periodic interval since we're handling this now
						clearInterval(intervalId)
						periodicMonitoringIntervals.delete(key)

						// Trigger the same delete logic as POSTS_UPDATED
						handlePostsUpdated(tabId, response.data, () => {})
					} else {
						bgLogger.log(`[BG] ✅ Periodic check: Post is healthy, continuing monitoring`)
					}
				} else {
					bgLogger.warn(`[BG] ⚠️ Periodic check: No valid response from content script`)
				}
			})
		} catch (error) {
			bgLogger.error(`[BG] Error in periodic monitoring check for ${userName}:`, error)
		}
	}, 15000) // Changed from 30000 to 15000 (15 seconds) for faster blocked post detection

	periodicMonitoringIntervals.set(key, intervalId)
	bgLogger.log(`[BG] 🔄 Started periodic monitoring for ${userName} (every 15 seconds) - Interval ID: ${intervalId}`)
}

/**
 * Stop periodic monitoring for a specific tab/user
 */
export function stopPeriodicMonitoringCheck(tabId, userName) {
	const key = `${tabId}:${userName}`
	if (periodicMonitoringIntervals.has(key)) {
		const intervalId = periodicMonitoringIntervals.get(key)
		clearInterval(intervalId)
		periodicMonitoringIntervals.delete(key)
		bgLogger.log(`[BG] 🛑 Stopped periodic monitoring for ${userName} - cleared interval ID: ${intervalId}`)
	} else {
		bgLogger.log(`[BG] ℹ️ No periodic monitoring to stop for ${userName} (key: ${key})`)
	}
}

/**
 * Stop all periodic monitoring intervals (cleanup)
 */
export function stopAllPeriodicMonitoring() {
	for (const [key, intervalId] of periodicMonitoringIntervals) {
		clearInterval(intervalId)
	}
	periodicMonitoringIntervals.clear()
	bgLogger.log('[BG] 🔄 Stopped all periodic monitoring')
}

/**
 * Wait for content script to be ready
 */
export async function waitForContentScript(tabId, { retries = 12, initialDelayMs = 250 } = {}) {
	let delayMs = initialDelayMs
	for (let i = 0; i < retries; i++) {
		try {
			const tab = await chrome.tabs.get(tabId)
			if (!tab || tab.discarded) {
				await new Promise((resolve) => setTimeout(resolve, delayMs))
				delayMs = Math.min(2000, Math.floor(delayMs * 1.6))
				continue
			}
			if (tab.status !== 'complete') {
				await new Promise((resolve) => setTimeout(resolve, delayMs))
				delayMs = Math.min(2000, Math.floor(delayMs * 1.6))
				continue
			}

			const res = await chrome.tabs.sendMessage(tabId, { type: 'PING' })
			if (res && res.pong) return true
		} catch (e) {
		}
		await new Promise((resolve) => setTimeout(resolve, delayMs))
		delayMs = Math.min(2000, Math.floor(delayMs * 1.6))
	}
	return false
}

/**
 * Send GET_POSTS command to content script
 */
export async function sendGetPosts(tabId, userName, source) {
	// Adaptive retry logic based on source
	const isAfterReload = source === 'after_reload' || source === 'direct_navigation';
	const maxRetries = isAfterReload ? 20 : 12;
	const initialDelay = isAfterReload ? 1000 : 500;
	
	bgLogger.log(`[BG] 📡 Sending GET_POSTS to tab ${tabId} (${source}) - retries: ${maxRetries}, delay: ${initialDelay}ms`);
	
	const ready = await waitForContentScript(tabId, { retries: maxRetries, initialDelayMs: initialDelay })
	if (!ready) {
		bgLogger.error(`[BG] Content script NOT reachable after ${maxRetries} retries in tab ${tabId}, cannot send GET_POSTS (${source})`)
		logToTab(tabId, `Content script not reachable; skipping post collection (${source}).`)
		
		// Don't delete tabStates immediately - let Watchdog handle it
		if (!isAfterReload) {
			// Only delete state if it's not a critical after-reload scenario
			delete tabStates[tabId]
		}
		return false
	}

	try {
		bgLogger.log(`[BG] 📤 Content script ready, sending GET_POSTS message to tab ${tabId}`);
		await chrome.tabs.sendMessage(tabId, {
			type: 'REDDIT_POST_MACHINE_GET_POSTS',
			payload: { userName }
		})
		bgLogger.log(`[BG] ✅ GET_POSTS message sent successfully to tab ${tabId}`);
		return true
	} catch (err) {
		bgLogger.error(`[BG] Failed to send GET_POSTS (${source}):`, err)
		
		// Don't delete tabStates immediately in after-reload scenarios
		if (!isAfterReload) {
			delete tabStates[tabId]
		}
		return false
	}
}

/**
 * Create a clean post tab for submission using unified tab manager
 */
export async function createCleanPostTab(userName, postData) {
	try {
		bgLogger.log('[BG] Creating clean post tab using unified tab manager')

		const newTabId = await getPostCreationTab(postData)

		tabStates[newTabId] = {
			status: SM_STEPS.POSTING,
			userName: userName,
			postData: postData,
			stepStartTime: Date.now(),
			lastFeedbackTimestamp: Date.now(),
			isPostTab: true,
			isCleanTab: true
		}

		const tabLoadListener = (tabId, changeInfo, tab) => {
			if (tabId === newTabId && changeInfo.status === 'complete') {
				chrome.tabs.onUpdated.removeListener(tabLoadListener)

				bgLogger.log(`[BG] Clean post tab ${newTabId} loaded, URL: ${tab.url}`)

				if (!tab.url || !tab.url.includes('/submit')) {
					bgLogger.error(`[BG] Tab ${newTabId} is not on submit page: ${tab.url}`)
					delete tabStates[newTabId]
					return
				}

				setTimeout(() => {
					bgLogger.log(`[BG] Sending START_POST_CREATION to tab ${newTabId}`)
					chrome.tabs.sendMessage(newTabId, {
						type: 'START_POST_CREATION',
						userName: userName,
						postData: postData
					}).catch((err) => {
						bgLogger.error(`[BG] Failed to send post data to clean tab ${newTabId}:`, err)
						delete tabStates[newTabId]
					})
				}, 2000)
			}
		}

		registerTabListener(newTabId, tabLoadListener)
		return newTabId
	} catch (error) {
		bgLogger.error('[BG] Failed to create clean post tab:', error)
		throw error
	}
}

/**
 * Create or reuse a post tab for submission using unified tab manager
 */
export async function createOrReusePostTab(userName, postData) {
	bgLogger.log(`[BG] Creating/reusing post tab for ${userName} using unified tab manager`)

	try {
		// Use unified tab manager to get/reuse the post creation tab
		const targetTabId = await getPostCreationTab(postData)

		bgLogger.log(`[BG] Using unified tab ${targetTabId} for post submission`)

		tabStates[targetTabId] = {
			status: SM_STEPS.POSTING,
			userName: userName,
			postData: postData,
			stepStartTime: Date.now(),
			isPostTab: true
		}

		const tabLoadListener = (tabId, changeInfo, tab) => {
			if (tabId === targetTabId && changeInfo.status === 'complete') {
				chrome.tabs.onUpdated.removeListener(tabLoadListener)

				bgLogger.log(`[BG] Post tab ${targetTabId} loaded, URL: ${tab.url}`)

				if (!tab.url || !tab.url.includes('/submit')) {
					bgLogger.error(`[BG] Tab ${targetTabId} is not on submit page: ${tab.url}`)
					delete tabStates[targetTabId]
					return
				}

				setTimeout(() => {
					bgLogger.log(`[BG] Sending START_POST_CREATION to tab ${targetTabId}`)
					chrome.tabs.sendMessage(targetTabId, {
						type: 'START_POST_CREATION',
						userName: userName,
						postData: postData
					}).catch((err) => {
						bgLogger.error(`[BG] Failed to send post data to tab ${targetTabId}:`, err)
						delete tabStates[targetTabId]
					})
				}, 2000)
			}
		}

		registerTabListener(targetTabId, tabLoadListener)

		return targetTabId
	} catch (error) {
		bgLogger.error('[BG] Failed to create/reuse post tab:', error)
		throw error
	}
}

/**
 * Finalize auto-flow by navigating to submitted posts
 */
export async function finalizeAutoFlowToSubmitted(tabId, userName) {
	if (!tabId || !userName) return
	const cleanUsername = userName.replace('u/', '')
	const submittedUrl = `https://www.reddit.com/user/${cleanUsername}/submitted/`

	if (finalizeReloadListeners[tabId]) {
		chrome.tabs.onUpdated.removeListener(finalizeReloadListeners[tabId])
		delete finalizeReloadListeners[tabId]
	}

	if (finalizeReloadTimeouts[tabId]) {
		clearTimeout(finalizeReloadTimeouts[tabId])
		delete finalizeReloadTimeouts[tabId]
	}

	try {
		const tab = await chrome.tabs.get(tabId)
		if (tab?.url && tab.url.includes(`/user/${cleanUsername}/`) && tab.url.includes('/submitted')) {
			chrome.tabs.reload(tabId).catch(() => { })
			return
		}
	} catch (e) {
	}

	const listener = (updatedTabId, changeInfo, tab) => {
		if (updatedTabId !== tabId) return
		if (changeInfo.status !== 'complete') return
		if (!tab?.url || !tab.url.includes(`/user/${cleanUsername}/`) || !tab.url.includes('/submitted')) return

		chrome.tabs.onUpdated.removeListener(listener)
		delete finalizeReloadListeners[tabId]

		if (finalizeReloadTimeouts[tabId]) {
			clearTimeout(finalizeReloadTimeouts[tabId])
			delete finalizeReloadTimeouts[tabId]
		}

		chrome.tabs.reload(tabId).catch(() => { })
	}

	finalizeReloadListeners[tabId] = listener
	chrome.tabs.onUpdated.addListener(listener)

	finalizeReloadTimeouts[tabId] = setTimeout(() => {
		if (finalizeReloadListeners[tabId] === listener) {
			chrome.tabs.onUpdated.removeListener(listener)
			delete finalizeReloadListeners[tabId]
		}
		delete finalizeReloadTimeouts[tabId]
	}, 30000)

	// Use unified tab manager to reload the tab with the new URL
	try {
		await reloadUnifiedTab(submittedUrl, OPERATIONS.POST_COLLECTION)
	} catch (error) {
		bgLogger.error('[BG] Failed to reload unified tab for submitted posts:', error)
	}
}

/**
 * Proceed with post creation
 */
export async function proceedWithPostCreation(userName, monitoringTabId) {
	bgLogger.log('[BG] Proceeding with post creation')

	await AutoFlowStateManager.saveState('creating_post', { userName, targetAction: 'create' })

	const state = tabStates[monitoringTabId]
	if (state && state.postCreationInProgress) {
		bgLogger.log('[BG] Post creation already in progress, skipping duplicate call')
		return
	}

	if (state) {
		state.postCreationInProgress = true
	}

	try {
		const newPostData = await fetchNextPost()

		if (newPostData) {
			bgLogger.log('[BG] Creating new post tab for fresh post')

			createCleanPostTab(userName, newPostData)
				.then((newTabId) => {
					bgLogger.log(`[BG] Created new post tab ${newTabId} for ${userName}`)
					delete tabStates[monitoringTabId]
				})
				.catch((err) => {
					bgLogger.error('[BG] Failed to create post tab:', err)
					delete tabStates[monitoringTabId]
				})
		} else {
			bgLogger.log('[BG] Failed to generate new post data')
			delete tabStates[monitoringTabId]
		}
	} catch (error) {
		bgLogger.error('[BG] Error in proceedWithPostCreation:', error)
		delete tabStates[monitoringTabId]
	}
}

/**
 * Start automation for a tab
 */
export function startAutomationForTab(tabId, userName) {
	bgLogger.log(`[BG] Starting automation for tab ${tabId} with user ${userName}`)

	const currentIntervalId = getCheckIntervalId()
	if (currentIntervalId) clearInterval(currentIntervalId)

	setCheckIntervalId(setInterval(() => {
		triggerPeriodicCheck(tabId, userName)
	}, CHECK_INTERVAL))

	triggerPeriodicCheck(tabId, userName)
}

/**
 * Trigger periodic check for post creation
 */
export async function triggerPeriodicCheck(tabId, userName) {
	const currentState = tabStates[tabId]

	// Block while actively posting OR deleting to avoid races that overwrite tabStates mid-flow.
	if (
		currentState &&
		(
			currentState.status === SM_STEPS.POSTING ||
			currentState.status === SM_STEPS.DELETING_POST ||
			currentState.deletingBeforeCreating === true
		)
	) {
		bgLogger.log('[BG] Skipping periodic check - Operation in progress (Locked)')
		return
	}

	// Allow monitoring checks to proceed (remove COLLECTING_POSTS blocking)
	// This enables the 2-minute reload cycle during monitoring
	if (currentState && currentState.status === SM_STEPS.COLLECTING_POSTS) {
		bgLogger.log(`[BG] Clearing COLLECTING_POSTS state to allow monitoring check`)
		delete tabStates[tabId]
	}

	bgLogger.log(`[BG] Triggering periodic post check for ${userName}`)

	try {
		const { latestPostsData } = await chrome.storage.local.get(['latestPostsData'])
		const cachedUser = latestPostsData?.username || latestPostsData?.userName || null
		if (latestPostsData && (!cachedUser || cachedUser.replace('u/', '') === userName.replace('u/', ''))) {
			const normalized = PostDataService.normalizeLatestPostsData(latestPostsData, userName)
			const lastUpdated = normalized?.lastUpdated
			if (normalized && lastUpdated && Date.now() - lastUpdated < 5 * 60 * 1000) {
				const result = await PostDataService.shouldCreatePost(normalized)
				if (!result?.shouldCreate) {
					await AutoFlowStateManager.clearState(userName)
					PostDataService.saveExecutionResult({
						status: 'skipped',
						postResult: 'none',
						postId: null,
						errorMessage: null,
						timestamp: Date.now()
					})
					finalizeAutoFlowToSubmitted(tabId, userName)
					return
				}
			}
		}
	} catch (e) {
	}

	const cleanUsername = userName.replace('u/', '')
	const directPostsUrl = `https://www.reddit.com/user/${cleanUsername}/submitted/`

	bgLogger.log(`[BG] 🚀 Using direct URL navigation optimization: ${directPostsUrl}`)

	tabStates[tabId] = {
		status: SM_STEPS.COLLECTING_POSTS,
		userName: userName,
		stepStartTime: Date.now(),
		lastFeedbackTimestamp: Date.now(),
		advancedToNavigatingPosts: true,
		advancedToCollecting: false,
		usedDirectNavigation: true
	}

	// Use unified tab manager to reload the tab with the new URL
	try {
		await reloadUnifiedTab(directPostsUrl, OPERATIONS.POST_COLLECTION)
	} catch (error) {
		bgLogger.error('[BG] Failed to reload unified tab for posts collection:', error)
		logToTab(tabId, `Error navigating to posts URL: ${error.message}`)
		delete tabStates[tabId]
	}

	const tabLoadBackupListener = (updatedTabId, changeInfo, tab) => {
		if (updatedTabId === tabId && changeInfo.status === 'complete' && tab.url.includes('/submitted')) {
			const state = tabStates[tabId]
			if (state && state.usedDirectNavigation && !state.advancedToCollecting) {
				bgLogger.log('[BG] Backup trigger: Tab loaded, sending GET_POSTS command')
				state.advancedToCollecting = true
				logToTab(tabId, 'Backup trigger: Tab fully loaded, starting post collection.')

				setTimeout(() => {
					sendGetPosts(tabId, state.userName, 'backup_trigger')
				}, 1000)

				chrome.tabs.onUpdated.removeListener(tabLoadBackupListener)
			}
		}
	}

	chrome.tabs.onUpdated.addListener(tabLoadBackupListener)

	setTimeout(() => {
		chrome.tabs.onUpdated.removeListener(tabLoadBackupListener)
	}, 30000)
}

/**
 * Check and advance state based on URL changes
 */
export function checkAndAdvanceState(tabId, state, url) {
	bgLogger.log(`[Auto Check] Checking state for tab ${tabId}. Status: ${state.status}, URL: ${url}`)

	touchTabState(state)

	if (state.status === SM_STEPS.NAVIGATING_PROFILE) {
		if (url.includes(state.userName.replace('u/', ''))) {
			if (!state.advancedToNavigatingPosts) {
				state.advancedToNavigatingPosts = true
				logToTab(tabId, 'Fast-track: Landed on profile page. Advancing to NAVIGATING_POSTS.')
				state.status = SM_STEPS.NAVIGATING_POSTS

				chrome.tabs.sendMessage(tabId, {
					type: 'REDDIT_POST_MACHINE_NAVIGATE_POSTS',
					payload: { userName: state.userName }
				}).catch((err) => {
					bgLogger.error('[Auto Check] Failed to send NAVIGATE_POSTS:', err)
					logToTab(tabId, `Error sending NAVIGATE_POSTS: ${err.message}`)
				})
			}
		}
	} else if (state.status === SM_STEPS.NAVIGATING_POSTS) {
		if (url.includes('/submitted')) {
			if (!state.advancedToCollecting) {
				state.advancedToCollecting = true
				logToTab(tabId, 'Fast-track: Landed on posts page. Advancing to COLLECTING_POSTS.')
				state.status = SM_STEPS.COLLECTING_POSTS

				sendGetPosts(tabId, state.userName, 'fast_track_navigating_posts')
			}
		}
	} else if (state.status === SM_STEPS.COLLECTING_POSTS && state.usedDirectNavigation) {
		if (url.includes('/submitted') && !state.advancedToCollecting) {
			state.advancedToCollecting = true
			logToTab(tabId, 'Direct navigation: Landed on posts page. Starting post collection.')

			setTimeout(() => {
				sendGetPosts(tabId, state.userName, 'direct_navigation')
			}, 2000)
		}
	}
}

/**
 * Handle CONTENT_SCRIPT_READY message
 */
export async function handleContentScriptReady(tabId, url) {
	let state = tabStates[tabId]

	if (!state && url.includes('reddit.com') && !isRedditChatUrl(url)) {
		// Try to restore state for this user if we are monitoring
		const syncResult = await chrome.storage.sync.get(['redditUser'])
		const userName = syncResult.redditUser?.seren_name

		if (userName) {
			const monitoring = await PostDataService.getActiveMonitoring(userName)
			if (monitoring && monitoring.monitoringEndTime > Date.now()) {
				bgLogger.log(`[BG] 🔄 Restoring monitoring state for ${userName} on tab ${tabId}`)
				state = {
					status: SM_STEPS.COLLECTING_POSTS,
					userName: userName,
					stepStartTime: Date.now(),
					lastFeedbackTimestamp: Date.now(),
					isRestored: true
				}
				tabStates[tabId] = state
			}
		}
	}

	if (state) {
		bgLogger.log(`Content script ready in tab ${tabId} (State: ${state.status}). URL: ${url}`)
		checkAndAdvanceState(tabId, state, url)
	}
}

/**
 * Handle ACTION_COMPLETED message
 */
export async function handleActionCompleted(tabId, action, success, data) {
	bgLogger.log(`[BG] handleActionCompleted called for tab ${tabId}, action ${action}`)

	let state = tabStates[tabId]

	// Recovery for POST_CREATION_COMPLETED if state is missing
	if (!state && action === 'POST_CREATION_COMPLETED' && data?.username) { // Corrected path: data.username
		bgLogger.log('[BG] State missing for POST_CREATION_COMPLETED, recovering context from payload...');
		state = {
			status: SM_STEPS.POSTING,
			userName: data.username,
			postData: { ...data.submittedData, post_name: data.frappePostName },
			stepStartTime: Date.now(),
			isPostTab: true
		};
		// Re-attach to tabStates temporarily to allow processing
		tabStates[tabId] = state;
	}

	if (!state) {
		bgLogger.log(`[BG] State already cleared for tab ${tabId}. Action ${action} was likely the final step.`)
		return
	}

	logToTab(tabId, `Action completed in tab ${tabId}: ${action} (Success: ${success})`)

	touchTabState(state)

	if (!success && action === 'POST_CREATION_COMPLETED' && data?.errorCode === 'POST_REQUIRES_NEW') {
		const userName = state?.userName || data?.username || data?.data?.username
		const reasonRaw = (data?.data?.reason || data?.reason || data?.error || '').toString()
		const reasonLc = reasonRaw.toLowerCase()
		bgLogger.warn('[BG] Post requires new submission. Reloading and restarting auto-flow.', reasonRaw)

		// If submission failed due to subreddit ban, do NOT wait for monitoring windows.
		// We set a one-shot "force create next post" flag so the next decision bypasses the 20-min monitoring hold.
		// This prevents the user-observed 2-minute delay when Reddit returns:
		// "You've been banned from contributing to this community"
		if (userName && reasonLc.includes('banned from contributing to this community')) {
			try {
				const key = `forceCreatePost_${userName}`
				await chrome.storage.local.set({
					[key]: {
						reason: 'banned_from_subreddit',
						rawReason: reasonRaw,
						timestamp: Date.now()
					}
				})
				bgLogger.log(`[BG] ⚡ Set force-create flag for ${userName} due to ban error`)
			} catch (e) {
				bgLogger.warn('[BG] Failed to set force-create flag:', e)
			}
		}

		if (tabStates[tabId]) {
			delete tabStates[tabId]
		}

		if (userName) {
			await AutoFlowStateManager.clearState(userName)
			await PostDataService.clearActiveMonitoring(userName)
			await chrome.storage.local.remove(['latestPostsData'])

			try {
				await chrome.tabs.reload(tabId)
			} catch (_) { }

			setTimeout(() => {
				handleCheckUserStatus(userName, () => { })
			}, 2000)
		}
		return
	}

	if (!success) {
		if (action === 'DELETE_POST' && state?.deletingOldPosts) {
			bgLogger.warn('[BG] Delete failed during old-post cleanup; continuing queue.')
		} else {
			bgLogger.warn(`Action ${action} failed. Aborting automation.`)
			delete tabStates[tabId]
			return
		}
	}

	if (action === 'NAVIGATE_PROFILE' && state.status === SM_STEPS.NAVIGATING_PROFILE) {
		if (!state.advancedToNavigatingPosts) {
			state.advancedToNavigatingPosts = true
			logToTab(tabId, 'Advancing from NAVIGATING_PROFILE to NAVIGATING_POSTS')

			state.status = SM_STEPS.NAVIGATING_POSTS
			state.stepStartTime = Date.now()
			touchTabState(state)

			setTimeout(() => {
				logToTab(tabId, 'Sending NAVIGATE_POSTS command')
				chrome.tabs.sendMessage(tabId, {
					type: 'REDDIT_POST_MACHINE_NAVIGATE_POSTS',
					payload: { userName: state.userName }
				}).catch((err) => bgLogger.error(`[State Machine] Error sending NAVIGATE_POSTS:`, err))
			}, 1500)
		} else {
			bgLogger.log('[BG] Already advanced to NAVIGATING_POSTS via fast-track. Skipping.')
		}
	} else if (action === 'NAVIGATE_POSTS' && state.status === SM_STEPS.NAVIGATING_POSTS) {
		if (!state.advancedToCollecting) {
			state.advancedToCollecting = true
			logToTab(tabId, 'Advancing from NAVIGATING_POSTS to COLLECTING_POSTS')

			state.status = SM_STEPS.COLLECTING_POSTS
			state.stepStartTime = Date.now()
			touchTabState(state)

			setTimeout(() => {
				logToTab(tabId, 'Sending GET_POSTS command')
				sendGetPosts(tabId, state.userName, 'state_machine_navigate_posts')
			}, 1500)
		} else {
			bgLogger.log('[BG] Already advanced to COLLECTING_POSTS via fast-track. Skipping.')
		}
	} else if (action === 'NAVIGATE_POSTS' && state.status === SM_STEPS.DELETING_POST) {
		bgLogger.log('[BG] NAVIGATE_POSTS completed for deletion, now sending DELETE_POST command')

		setTimeout(() => {
			logToTab(tabId, 'Sending DELETE_POST command')
			chrome.tabs.sendMessage(tabId, {
				type: 'REDDIT_POST_MACHINE_DELETE_POST',
				payload: { post: state.lastPostToDelete }
			}).catch((err) => {
				bgLogger.error('[BG] ❌ Failed to send delete command:', err)
				bgLogger.log('[BG] ⚠️ FALLBACK: Proceeding with post creation anyway')
				// Don't save execution result for this specific error to avoid UI error messages
				proceedWithPostCreation(state.userName, tabId)
			})
		}, 2000)
	} else if (action === 'GET_POSTS') {
		await handleGetPostsAction(tabId, state, data)
	} else if (action === 'POST_CREATION_COMPLETED') {
		await handlePostCreationCompleted(tabId, state, success, data)
	} else if (action === 'DELETE_POST_COMPLETED' || action === 'DELETE_POST') {
		await handleDeletePostCompleted(tabId, state, success, data)
	}
}

/**
 * Handle GET_POSTS action completion
 */
async function handleGetPostsAction(tabId, state, data) {
	bgLogger.log('[BG] 📊 GET_POSTS action received, collecting fresh data for decision...')

	// Check if this action is already in progress to prevent duplicates
	const actionKey = `${tabId}_${state.userName}`
	if (inFlightGetPosts.has(actionKey)) {
		bgLogger.log(`[BG] ⚠️ GET_POSTS action already in progress for tab ${tabId}, skipping duplicate`)
		return
	}

	// Mark this action as in-flight
	inFlightGetPosts.add(actionKey)

	// Clear the in-flight flag after a delay to prevent permanent blocking
	setTimeout(() => {
		inFlightGetPosts.delete(actionKey)
	}, 30000)

	if (state && state.status === SM_STEPS.COLLECTING_POSTS) {
		bgLogger.log('[BG] State machine flow: Collection complete')
	} else {
		bgLogger.log('[BG] Direct status check flow: Running decision analysis')
	}

	bgLogger.log('[BG] Requesting fresh posts data for autoflow decision...')

	try {
		const tab = await chrome.tabs.get(tabId)
		bgLogger.log('[BG] Target tab for fresh data collection:', tab.url)

		const sendMessagePromise = new Promise((resolve, reject) => {
			chrome.tabs.sendMessage(
				tabId,
				{
					type: 'GET_FRESH_POSTS_FOR_DECISION',
					userName: state.userName
				},
				(response) => {
					if (chrome.runtime.lastError) {
						bgLogger.log('[BG] Content script not available, using cached data')
						reject(new Error('Content script not available: ' + chrome.runtime.lastError.message))
					} else {
						bgLogger.log('[BG] Message sent successfully to content script')
						resolve(true)
					}
				}
			)
		})

		await sendMessagePromise

		const freshDataPromise = new Promise((resolve, reject) => {
			const messageListener = (message, sender, sendResponse) => {
				if (message.type === 'FRESH_POSTS_COLLECTED' && sender.tab?.id === tabId) {
					chrome.runtime.onMessage.removeListener(messageListener)
					bgLogger.log('[BG] Received FRESH_POSTS_COLLECTED response:', message.data)
					resolve(message.data)
				}
			}
			chrome.runtime.onMessage.addListener(messageListener)

			setTimeout(() => {
				chrome.runtime.onMessage.removeListener(messageListener)
				reject(new Error('Timeout waiting for fresh posts data after 15 seconds'))
			}, 15000)
		})

		const freshPostsData = await freshDataPromise
		bgLogger.log('[BG] Successfully received fresh posts data:', freshPostsData)

		if (freshPostsData && freshPostsData.dataFresh) {
			var dataForAnalysis = freshPostsData
			bgLogger.log('[BG] Using fresh data for analysis:', dataForAnalysis)
		} else {
			bgLogger.log('[BG] Fresh data invalid, falling back to normalized cached data')
			var dataForAnalysis = {
				userName: state.userName,
				postsInfo: {
					posts: data?.posts || [],
					total: data?.total || 0,
					lastPostDate: data?.lastPostDate || null
				},
				lastPost: data?.lastPost || null
			}
		}
	} catch (error) {
		bgLogger.warn('[BG] Failed to get fresh posts data, using cached data. Error:', error.message)
		var dataForAnalysis = {
			userName: state.userName,
			postsInfo: {
				posts: data?.posts || [],
				total: data?.total || 0,
				lastPostDate: data?.lastPostDate || null
			},
			lastPost: data?.lastPost || null
		}
		bgLogger.log('[BG] Normalized cached data structure for analysis:', dataForAnalysis)
	}

	// Always delete posts older than the monitoring window before decision analysis
	const oldPosts = getPostsOlderThanMinutes(dataForAnalysis?.postsInfo?.posts || [], OLD_POST_THRESHOLD_MINUTES)
	if (oldPosts.length > 0 && !state?.deletingOldPosts) {
		bgLogger.log(
			`[BG] 🧹 Cleanup required: ${oldPosts.length} posts older than ${OLD_POST_THRESHOLD_MINUTES} minutes.`
		)
		await startDeleteOldPostsFlow(tabId, state, oldPosts)
		inFlightGetPosts.delete(actionKey)
		return
	}

	PostDataService.shouldCreatePost(dataForAnalysis)
		.then(async (result) => {
			bgLogger.log('[BG] 🎯 FINAL DECISION RESULT:', {
				shouldCreate: result.shouldCreate,
				reason: result.reason,
				decisionReport: result.decisionReport
			})

			if (result.shouldCreate) {
				bgLogger.log(`[BG] 🚀 EXECUTING: New post required. Reason: ${result.reason}`)

				// Check if deletion is required.
				// Business rule: delete blocked/removed posts and any post whose monitoring window expired.
				// Old-post cleanup is handled before this decision, but we keep this as a fallback.
				const shouldDelete =
					(result.decisionReport && result.decisionReport.decision === 'create_with_delete') ||
					(result.reason === 'post_blocked' || result.reason === 'post_removed_by_moderator')

				if (shouldDelete) {
					bgLogger.log(`[BG] 🗑️ STEP 1: Attempting to delete last post before creating new one (Reason: ${result.reason})`)

					state.deletingBeforeCreating = true
					// Mark as deleting so periodic checks don't clear COLLECTING_POSTS state mid-delete
					state.status = SM_STEPS.DELETING_POST

					await AutoFlowStateManager.saveState('deleting_post', {
						userName: state.userName,
						lastPostToDelete: result.lastPost,
						targetAction: 'delete_and_create',
						tabId
					})

					chrome.tabs
						.sendMessage(tabId, {
							type: 'DELETE_LAST_POST',
							userName: state.userName
						})
						.then((response) => {
							bgLogger.log('[BG] Delete command sent successfully:', response)
							// After deletion, wait for handleDeletePostCompleted to restart autoflow
							// Do NOT proceed directly to post creation
						})
						.catch(async (err) => {
							bgLogger.error('[BG] ❌ Failed to send delete command:', err)
							bgLogger.log('[BG] ⚠️ FALLBACK: Restarting autoflow instead of creating post')

							// Don't save execution result for this specific error to avoid UI error messages
							// This error happens when the message channel closes, which is a normal browser behavior
							state.deletingBeforeCreating = false

							// Restart autoflow from beginning instead of proceeding to post creation
							await AutoFlowStateManager.clearState(state.userName)
							await handleCheckUserStatus(state.userName, (response) => {
								bgLogger.log('[BG] Restarted autoflow after failed delete:', response)
							})
						})
				} else {
					bgLogger.log('[BG] 📝 STEP 1: No deletion needed, proceeding directly to post creation')
					proceedWithPostCreation(state.userName, tabId)
				}
			} else {
				if (result.reason === 'monitoring_new_post' || result.reason === 'group_cooldown') {
					const isGroupCooldown = result.reason === 'group_cooldown'
					if (isGroupCooldown) {
						bgLogger.log('[BG] ⏳ MONITORING: Group cooldown active. Scheduling next check at cooldown end.')
					} else {
						bgLogger.log('[BG] ⏳ MONITORING: Inside 20-minute window. Scheduling next check in 2 minutes.')
					}

					// COMMENTED OUT to fix 3-minute delay issue - was causing delayed post deletion
					// const TWO_MINUTES_MS = 2 * 60 * 1000;
					const TWO_MINUTES_MS = 30 * 1000; // Reduced to 30 seconds for immediate response

					// Calculate monitoring end time from decision report
					const monitoringEndTime = result.decisionReport?.monitoringEndTime || null
					const timeLeftMinutes = result.decisionReport?.timeLeftMinutes || null

					// Save execution result as 'monitoring' with time tracking
					const executionResult = {
						status: 'monitoring',
						postResult: 'waiting',
						postId: null,
						errorMessage: null,
						timestamp: Date.now(),
						monitoringEndTime: monitoringEndTime,
						timeLeftMinutes: timeLeftMinutes
					}
					await PostDataService.saveExecutionResult(executionResult)

					// Persist active monitoring for background watchdog
					if (monitoringEndTime) {
						await PostDataService.saveActiveMonitoring(state.userName, monitoringEndTime, result.lastPost?.timestamp)
					}

					bgLogger.log(`[BG] ⏰ Monitoring until: ${monitoringEndTime ? new Date(monitoringEndTime).toLocaleTimeString() : 'unknown'}, ${timeLeftMinutes}m left`)

					// Start periodic monitoring for blocked posts
					startPeriodicMonitoringCheck(tabId, state.userName)

					// Don't clear the tab state - keep it in monitoring mode
					// The next periodic check will handle the next iteration

					// Clear existing interval/timeout if any (to prevent double firing)
					const currentInterval = getCheckIntervalId();
					if (currentInterval) {
						bgLogger.log(`[BG] 🧹 Clearing previous timeout ID: ${currentInterval}`);
						clearTimeout(currentInterval);
						clearInterval(currentInterval);
					}

					// Calculate exact time until monitoring window ends
					const timeUntilEndMs = monitoringEndTime ? (monitoringEndTime - Date.now()) : null

					bgLogger.log(`[BG] 📊 Monitoring calculation:`, {
						monitoringEndTime: monitoringEndTime ? new Date(monitoringEndTime).toLocaleString() : 'null',
						currentTime: new Date().toLocaleString(),
						timeUntilEndMs: timeUntilEndMs,
						timeUntilEndMinutes: timeUntilEndMs ? (timeUntilEndMs / 60000).toFixed(1) : 'null'
					});

					// Scheduling:
					// - Standard monitoring: check every 2 minutes (or exact end time if sooner).
					// - Group cooldown: schedule ONE check near the cooldown end to avoid noisy reload loops.
					let nextCheckDelay = TWO_MINUTES_MS
					if (isGroupCooldown) {
						if (timeUntilEndMs && timeUntilEndMs > 0) {
							nextCheckDelay = timeUntilEndMs + 5000
							bgLogger.log(`[BG] ⏰ Group cooldown ends in ${Math.floor(timeUntilEndMs / 1000)}s - scheduling exact check at end time`)
						} else {
							// Fallback: if we don't have an end time, keep a conservative 2-minute check.
							bgLogger.log(`[BG] ⏰ Group cooldown end time unknown - scheduling 2-minute check`);
						}
					} else if (timeUntilEndMs && timeUntilEndMs > 0 && timeUntilEndMs < TWO_MINUTES_MS) {
						nextCheckDelay = timeUntilEndMs + 5000 // Add 5 seconds buffer to ensure post is detected as old
						bgLogger.log(`[BG] ⏰ Monitoring ends in ${Math.floor(timeUntilEndMs / 1000)}s - scheduling exact check at end time`)
					} else {
						bgLogger.log(`[BG] ⏰ Scheduling standard 2-minute check (${TWO_MINUTES_MS / 1000}s)`);
					}

					const scheduledTime = new Date(Date.now() + nextCheckDelay);
					bgLogger.log(`[BG] 🕐 Next check scheduled for: ${scheduledTime.toLocaleTimeString()} (in ${Math.floor(nextCheckDelay / 1000)}s)`);

					// Schedule next check using setTimeout (will be called recursively)
					const nextCheckTimeout = setTimeout(() => {
						bgLogger.log('[BG] ⏰ MONITORING: Scheduled check triggered. Reloading and running periodic check.');
						bgLogger.log(`[BG] 🎯 Timeout fired at: ${new Date().toLocaleTimeString()}`);
						bgLogger.log(`[BG] 🔍 This check will determine if monitoring window ended and trigger DELETE + CREATE.`);
						
						// IMPORTANT: Stop periodic monitoring BEFORE reload to prevent race conditions
						bgLogger.log(`[BG] 🛑 Stopping periodic monitoring before reload for ${state.userName}`);
						stopPeriodicMonitoringCheck(tabId, state.userName);
						
						// Mark tab as reloading to prevent periodic checks from interfering
						if (tabStates[tabId]) {
							tabStates[tabId].isReloading = true;
							bgLogger.log(`[BG] 📝 Marked tab ${tabId} as reloading`);
						}
						
						// Reload page first to get fresh data
						chrome.tabs.reload(tabId, (reloadResult) => {
							if (chrome.runtime.lastError) {
								bgLogger.error(`[BG] ❌ Failed to reload tab ${tabId}:`, chrome.runtime.lastError.message);
								// Clear reloading flag on error
								if (tabStates[tabId]) {
									tabStates[tabId].isReloading = false;
								}
								return;
							}
							
							bgLogger.log(`[BG] 🔄 Tab ${tabId} reload initiated successfully`);
							
							// Then trigger check after a delay for page to load
							setTimeout(() => {
								bgLogger.log(`[BG] 💡 If post is now > 20 mins old, this should delete it and then create a new post`);
								
								// Clear reloading flag after delay
								if (tabStates[tabId]) {
									tabStates[tabId].isReloading = false;
									bgLogger.log(`[BG] ✅ Cleared reloading flag for tab ${tabId}`);
								}
								
								// Restart periodic monitoring after reload
								bgLogger.log(`[BG] 🔄 Restarting periodic monitoring after reload for ${state.userName}`);
								startPeriodicMonitoringCheck(tabId, state.userName);
								
								// Trigger the actual check
								triggerPeriodicCheck(tabId, state.userName);
							}, 5000); // Increased to 5s to ensure content script initialization
						});
					}, nextCheckDelay);

					bgLogger.log(`[BG] ✅ Timeout set with ID: ${nextCheckTimeout}, delay: ${nextCheckDelay}ms`);
					setCheckIntervalId(nextCheckTimeout);

					// Initial soft reload to show current state (avoid doing this for 2h group cooldown)
					if (!isGroupCooldown) {
						setTimeout(() => {
							bgLogger.log(`[BG] 🔄 Initial soft reload of tab ${tabId}`);
							chrome.tabs.reload(tabId).catch(() => { });
						}, 3000)
					}

				} else {
					bgLogger.log('[BG] ✅ COMPLETE: No new post needed. Clearing state and waiting for next interval.')

					// Stop periodic monitoring before clearing state
					stopPeriodicMonitoringCheck(tabId, state.userName)

					await AutoFlowStateManager.clearState(state.userName)
					await PostDataService.clearActiveMonitoring(state.userName)

					const executionResult = {
						status: 'skipped',
						postResult: 'none',
						postId: null,
						errorMessage: null,
						timestamp: Date.now()
					}

					await PostDataService.saveExecutionResult(executionResult)
					const userName = state.userName
					delete tabStates[tabId]
					finalizeAutoFlowToSubmitted(tabId, userName)
				}
			}
		})
		.catch((err) => {
			bgLogger.error('[BG] ❌ ERROR: Error analyzing posts:', err)
			delete tabStates[tabId]
		})
		.finally(() => {
			// Clear the in-flight flag when done
			inFlightGetPosts.delete(actionKey)
		})
}

/**
 * Handle POST_CREATION_COMPLETED action
 */
async function handlePostCreationCompleted(tabId, state, success, data) {
	bgLogger.log('[BG] Posting process completed. Closing submit tab and opening reddit.com for status check.')
	// Release unified-tab post creation lock so the tab can be reused immediately.
	// Without this, UnifiedTabMgr waits for a 60s timeout before allowing navigation.
	releasePostCreationLock('post_creation_completed')

	const wasDeletingBeforeCreating = state && state.deletingBeforeCreating
	let userName = state?.userName
	let postName = state?.postData?.post_name

	if (state) {
		delete tabStates[tabId]
	}

	let postResult = success ? 'created' : 'error'
	if (success && wasDeletingBeforeCreating) {
		postResult = 'deleted_and_created'
	}

	// Default execution result; will be enriched below (including statusUpdated, postName, etc.)
	const executionResult = {
		status: success ? 'completed' : 'failed',
		postResult: postResult,
		postId: data?.postId || null,
		errorMessage: data?.error || null,
		timestamp: Date.now()
	}

	if (success) {
		await AutoFlowStateManager.clearState(userName)
		await chrome.storage.local.remove(['latestPostsData'])
		bgLogger.log(`[BG] ✅ Auto-flow completed successfully, state cleared for user ${userName}`)

		// Update post status to "Posted" if we have the post name
		if (postName) {
			try {
				// Build extra fields from data passed by submit-content-script (if available)
				const redditUrl = data?.redditUrl || null
				const redditPostId = data?.redditPostId || null
				const submitted = data?.submittedData || null
				const usernameRaw = data?.username || state?.userName || null

				const extraFields = {}
				if (redditUrl) extraFields.reddit_post_url = redditUrl
				if (redditPostId) extraFields.reddit_post_id = redditPostId

				// ---- Map actual post data into Frappe DocType "Reddit Post" fields ----
				// Only set fields we actually have (avoid overwriting backend with nulls).
				const title = submitted?.title ?? state?.postData?.title ?? null
				if (title) extraFields.title = title

				// Frappe Select expects "Text" / "Link" (capitalized)
				const postTypeRaw =
					submitted?.postType ??
					submitted?.post_type ??
					state?.postData?.post_type ??
					state?.postData?.postType ??
					null
				if (postTypeRaw) {
					const pt = String(postTypeRaw).toLowerCase()
					extraFields.post_type = (pt === 'link' || pt === 'url') ? 'Link' : 'Text'
				}

				const urlToShare = submitted?.url ?? state?.postData?.url ?? null
				if (urlToShare) extraFields.url_to_share = urlToShare

				const bodyText = submitted?.body ?? state?.postData?.body ?? null
				if (bodyText) extraFields.body_text = bodyText

				const hashtags = submitted?.hashtags ?? data?.hashtags ?? null
				if (hashtags) extraFields.hashtags = hashtags

				const flair = submitted?.flair ?? data?.flair ?? null
				if (flair) extraFields.flair = flair

				const subredditName = submitted?.subreddit ?? state?.postData?.subreddit ?? null
				if (subredditName) extraFields.subreddit_name = subredditName

				const account = state?.postData?.account ?? null
				if (account) extraFields.account = account

				const templateUsed = state?.postData?.template_used ?? null
				if (templateUsed) extraFields.template_used = templateUsed

				if (usernameRaw) extraFields.account_username = String(usernameRaw).replace(/^u\//i, '')

				// Use client timestamp as posted_at if backend hasn't stored it yet
				if (redditUrl || redditPostId || bodyText || title) {
					// Convert to MySQL-compatible datetime format (YYYY-MM-DD HH:MM:SS)
					const now = new Date()
					const mysqlDateTime = now.getFullYear() + '-' +
						String(now.getMonth() + 1).padStart(2, '0') + '-' +
						String(now.getDate()).padStart(2, '0') + ' ' +
						String(now.getHours()).padStart(2, '0') + ':' +
						String(now.getMinutes()).padStart(2, '0') + ':' +
						String(now.getSeconds()).padStart(2, '0')
					extraFields.posted_at = mysqlDateTime
				}

				bgLogger.log('[BG] 🔄 Updating post status to "Posted" for post:', postName, {
					extraFields
				})
				bgLogger.log('[BG] Post data available for status update:', state?.postData)

				await PostDataService.updatePostStatus(postName, 'Posted', extraFields)
				bgLogger.log('[BG] ✅ Post status/metadata updated successfully')

				// Update execution result to include the post status update
				executionResult.statusUpdated = true
				executionResult.postName = postName
				if (redditUrl) executionResult.redditUrl = redditUrl
				if (redditPostId) executionResult.redditPostId = redditPostId
			} catch (error) {
				bgLogger.error('[BG] Failed to update post status:', error)
				// Don't fail the entire process if status update fails
				executionResult.statusUpdated = false
				executionResult.statusUpdateError = error.message
			}
		} else {
			bgLogger.log('[BG] ⚠️ No post_name available for status update')
			bgLogger.log('[BG] Available post data:', state?.postData)
		}
	}

	await PostDataService.saveExecutionResult(executionResult)

	if (success && !userName) {
		try {
			const syncResult = await chrome.storage.sync.get(['redditUser'])
			const localResult = await chrome.storage.local.get(['redditUser'])
			userName = syncResult.redditUser?.seren_name || localResult.redditUser?.seren_name
		} catch (e) {
		}
	}

	if (success && userName) {
		// Reuse the unified tab for submitted page instead of opening an extra tab
		setTimeout(async () => {
			try {
				const cleanUsername = userName.replace('u/', '')
				const submittedUrl = `https://www.reddit.com/user/${cleanUsername}/submitted/`

				bgLogger.log('[BG] Navigating unified tab to submitted posts after post creation:', submittedUrl)

				// Navigate to submitted page
				const unifiedTabId = await reloadUnifiedTab(submittedUrl, OPERATIONS.POST_COLLECTION)

				// CRITICAL FIX: Restart the automation flow explicitly.
				// We cleared state above, so we must restart 'handleCheckUserStatus' to begin monitoring.
				// Using a small delay to let navigation start.
				bgLogger.log('[BG] 🔄 RESTARTING AUTOFLOW for monitoring/verification phase...')
				setTimeout(() => {
					handleCheckUserStatus(userName, (res) => {
						bgLogger.log('[BG] Automation restarted successfully:', res);
					});
				}, 2000);

			} catch (error) {
				bgLogger.error('[BG] Failed to navigate unified tab to submitted posts page after post creation:', error)
			}
		}, 2000) // Increased waiting time to 2 seconds as requested
	}
}

/**
 * Handle DELETE_POST_COMPLETED action
 */
async function handleDeletePostCompleted(tabId, state, success, data) {
	bgLogger.log('[BG] Delete post operation completed.')
	bgLogger.log('[BG] Delete data received:', data)
	bgLogger.log('[BG] Success value:', success)

	const userName = state?.userName || data?.userName
	const isOldPostQueue = state?.deletingOldPosts === true
	bgLogger.log('[BG] Tab state:', state)
	bgLogger.log('[BG] Username extracted:', userName)

	// Clear the tab state so a fresh auto-flow can start without thinking this tab
	// is still busy in COLLECTING_POSTS/DELETING_POST. We keep using the local
	// `state` snapshot below, but remove the shared reference from `tabStates`.
	if (tabStates[tabId] && !isOldPostQueue) {
		bgLogger.log(`[BG] Clearing tab state for tab ${tabId} after delete completion`)
		delete tabStates[tabId]
	}

	await AutoFlowStateManager.saveState('deletion_completed', {
		userName,
		success: success,
		targetAction: 'delete_and_create'
	})

	// Don't save execution result for deletion when it's part of auto-flow
	// The final result should be from post creation, not deletion
	// Only save execution result if this is a standalone deletion (not auto-flow)
	if (!state || !state.deletingBeforeCreating) {
		const executionResult = {
			status: success ? 'completed' : 'failed',
			postResult: success ? 'deleted' : 'error',
			postId: data?.postId || null,
			errorMessage: data?.error || null,
			timestamp: Date.now()
		}
		await PostDataService.saveExecutionResult(executionResult)
	} else {
		bgLogger.log('[BG] Skipping execution result save for auto-flow deletion - will save after post creation')
	}

	// Update backend status when post is deleted
	if (success && data?.redditUrl) {
		try {
			bgLogger.log('[BG] 🔄 Updating backend status for deleted post:', data.redditUrl)
			await PostDataService.updatePostStatusByRedditUrl(
				data.redditUrl,
				'Deleted',
				'Deleted by user via extension'
			)
			bgLogger.log('[BG] ✅ Backend status updated for deleted post')
		} catch (error) {
			bgLogger.error('[BG] Failed to update backend status for deleted post:', error)
			// Don't fail the deletion process if backend update fails
		}
	}

	if (success) {
		bgLogger.log('[BG] ✅ Delete was successful, clearing cache and restarting autoflow from beginning')
	} else {
		bgLogger.warn('[BG] ⚠️ Delete failed, but checking if we should restart anyway...')
	}

	// If we're deleting a queue of old posts, continue the queue instead of restarting.
	if (isOldPostQueue) {
		if (Array.isArray(state.deleteQueue) && state.deleteQueue.length > 0) {
			// Remove the post we just attempted
			state.deleteQueue.shift()
		}

		const trySendNextDelete = async () => {
			while (state.deleteQueue && state.deleteQueue.length > 0) {
				state.currentDeletePost = state.deleteQueue[0]
				tabStates[tabId] = state
				const sent = await sendDeletePostCommand(tabId, state.currentDeletePost)
				if (sent) return true
				state.deleteQueue.shift()
			}
			return false
		}

		const sentNext = await trySendNextDelete()
		if (sentNext) return

		// Queue finished: restart auto-flow to decide whether to create or continue monitoring
		bgLogger.log('[BG] ✅ Old-post cleanup finished. Restarting auto-flow check.')
		state.deletingOldPosts = false
		state.deletingBeforeCreating = false
		state.targetAction = 'auto_flow'
		// CRITICAL: do not leave this tab in DELETING_POST, otherwise triggerPeriodicCheck()
		// will keep logging "Locked" and we never reach creation.
		if (tabStates[tabId]) delete tabStates[tabId]

		if (userName) {
			await AutoFlowStateManager.clearState(userName)
			await PostDataService.clearActiveMonitoring(userName)
			await chrome.storage.local.remove(['latestPostsData'])
			setTimeout(() => {
				handleCheckUserStatus(userName, () => { })
			}, 2000)
		}
		return
	}

	if (success || (state && (state.deletingBeforeCreating || state.targetAction === 'delete_and_create'))) {
		bgLogger.log('[BG] 🔄 AUTO FLOW RESTART - Step 1: Clearing cached posts data')
		await chrome.storage.local.remove(['latestPostsData'])

		if (userName) {
			bgLogger.log(`[BG] 🔄 AUTO FLOW RESTART - Step 2: Restarting autoflow analysis for user: ${userName}`)

			// Store the deleted post ID to filter it out in subsequent analysis (if we have it)
			const deletedPostId = data?.postId || null
			if (deletedPostId) {
				await chrome.storage.local.set({
					[`deletedPost_${userName}`]: {
						postId: deletedPostId,
						timestamp: Date.now()
					}
				})
				bgLogger.log(`[BG] 💾 Stored deleted post ID: ${deletedPostId}`)
			}

			// Clear the current state to start fresh
			bgLogger.log('[BG] 🔄 AUTO FLOW RESTART - Step 3: Clearing auto flow state')
			await AutoFlowStateManager.clearState(userName)

			// Add a small delay to allow Reddit to process deletion
			bgLogger.log('[BG] 🔄 AUTO FLOW RESTART - Step 4: Waiting 3 seconds for Reddit to process deletion')
			await new Promise(resolve => setTimeout(resolve, 3000))

			// RELOAD submitted page to ensure fresh data after monitoring period
			bgLogger.log('[BG] 🔄 AUTO FLOW RESTART - Step 4.5: Reloading submitted page to fetch fresh data after monitoring period')
			const cleanUsername = userName.replace('u/', '')
			const submittedUrl = `https://www.reddit.com/user/${cleanUsername}/submitted/`

			try {
				// Use the tabId provided to this function instead of looking it up
				if (tabId && await isTabValid(tabId)) {
					bgLogger.log(`[BG] 🔄 Reloading tab ${tabId} to ${submittedUrl}`)
					await chrome.tabs.update(tabId, { url: submittedUrl })
					// Wait for the reload to complete
					await new Promise(resolve => setTimeout(resolve, 2000))
					bgLogger.log('[BG] ✅ Submitted page reloaded successfully')
				} else {
					bgLogger.log('[BG] ⚠️ Specified tabId is invalid or missing, falling back to unified tab lookup')
					const fallbackTabId = await getStoredUnifiedTabId()
					if (fallbackTabId && await isTabValid(fallbackTabId)) {
						await chrome.tabs.update(fallbackTabId, { url: submittedUrl })
						await new Promise(resolve => setTimeout(resolve, 2000))
					}
				}
			} catch (error) {
				bgLogger.error('[BG] ⚠️ Failed to reload submitted page (will continue anyway):', error)
			}

			// Trigger fresh autoflow check from the beginning
			bgLogger.log(`[BG] 🔄 AUTO FLOW RESTART - Step 5: Triggering fresh autoflow check for ${userName}`)
			bgLogger.log('[BG] ⚡ THIS SHOULD NOW CREATE A NEW POST AUTOMATICALLY')

			try {
				await handleCheckUserStatus(userName, (response) => {
					bgLogger.log('[BG] ✅ AUTO FLOW RESTART COMPLETED - Fresh autoflow check initiated after deletion:', response)
				})
				bgLogger.log('[BG] ✅ AUTO FLOW RESTART - Successfully triggered handleCheckUserStatus')
			} catch (error) {
				bgLogger.error('[BG] ❌ AUTO FLOW RESTART FAILED - Error triggering handleCheckUserStatus:', error)
			}
		} else {
			bgLogger.warn('[BG] ⚠️ AUTO FLOW RESTART SKIPPED - No username available after deletion')
			bgLogger.log('[BG] State data available:', { state, data })
		}
	} else {
		bgLogger.log('[BG] ❌ Delete failed and not part of auto-flow, stopping.')
		bgLogger.log('[BG] Failure data:', data)
	}
}

// ===== STANDARD MESSAGE HANDLERS =====

/**
 * Get Reddit page information
 */
export function handleGetRedditInfo(sendResponse) {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const tab = tabs[0]
		if (tab && tab.url && tab.url.includes('reddit.com') && !isRedditChatUrl(tab.url)) {
			sendResponse({
				success: true,
				data: {
					url: tab.url,
					isRedditPage: true
				}
			})
		} else {
			sendResponse({
				success: false,
				error: 'Not on a Reddit page'
			})
		}
	})
}

/**
 * Handle post creation
 */
export async function handleCreatePost(postData, sendResponse) {
	bgLogger.log('Creating post:', postData)

	try {
		let postToSubmit
		let redditUser

		const syncResult = await chrome.storage.sync.get(['redditUser'])
		const localResult = await chrome.storage.local.get(['redditUser'])
		redditUser = syncResult.redditUser || localResult.redditUser

		if (postData) {
			postToSubmit = postData
		} else {
			if (redditUser && redditUser.seren_name) {
				bgLogger.log(`[BG] Generating post for user: ${redditUser.seren_name}`)
				postToSubmit = await PostDataService.generatePost(redditUser.seren_name)
			} else {
				const errorMessage = 'No username found - cannot generate post without user context'
				bgLogger.error('[BG] ' + errorMessage)
				throw new Error(errorMessage)
			}
		}

		bgLogger.log('[BG] Post data to submit:', postToSubmit)

		// Use unified tab manager to get/reuse the post creation tab
		const targetTabId = await getPostCreationTab(postToSubmit)
		bgLogger.log('[BG] Using unified tab for post creation:', targetTabId)

		// Wait for tab to load
		await new Promise((resolve) => {
			const tabLoadListener = (tabId, changeInfo) => {
				if (tabId === targetTabId && changeInfo.status === 'complete') {
					chrome.tabs.onUpdated.removeListener(tabLoadListener)
					setTimeout(resolve, 2000)
				}
			}
			registerTabListener(targetTabId, tabLoadListener)
		})

		setTimeout(() => {
			const userName = redditUser?.seren_name || 'AutoUser'

			chrome.tabs.sendMessage(targetTabId, {
				type: 'START_POST_CREATION',
				userName: userName,
				postData: postToSubmit
			}).catch((err) => {
				bgLogger.error(`[BG] Failed to send post data to tab ${targetTabId}:`, err)
			})
		}, 3000)

		sendResponse({
			success: true,
			message: 'Post data sent to submit tab',
			tabId: targetTabId
		})
	} catch (error) {
		bgLogger.error('[BG] Failed to create post:', error)
		sendResponse({
			success: false,
			error: error.message
		})
	}
}

/**
 * Handle settings save
 */
export function handleSaveSettings(settings, sendResponse) {
	chrome.storage.sync.set({ settings }, () => {
		if (chrome.runtime.lastError) {
			sendResponse({
				success: false,
				error: chrome.runtime.lastError.message
			})
		} else {
			sendResponse({
				success: true,
				message: 'Settings saved successfully'
			})
		}
	})
}

/**
 * Handle username storage notification
 */
export function handleUsernameStored(username, timestamp, sendResponse) {
	bgLogger.log(`Background: Received username storage notification - ${username}`)
	chrome.action.setBadgeText({ text: '✓' })
	chrome.action.setBadgeBackgroundColor({ color: '#4caf50' })
	setTimeout(() => { chrome.action.setBadgeText({ text: '' }) }, 3000)
	sendResponse({ success: true })
}

/**
 * Handle get stored username request
 */
export async function handleGetStoredUsername(sendResponse) {
	try {
		const syncResult = await chrome.storage.sync.get(['redditUser'])
		if (syncResult.redditUser && syncResult.redditUser.seren_name) {
			sendResponse({ success: true, data: syncResult.redditUser })
			return
		}
		const localResult = await chrome.storage.local.get(['redditUser'])
		if (localResult.redditUser && localResult.redditUser.seren_name) {
			sendResponse({ success: true, data: localResult.redditUser })
			return
		}
		sendResponse({ success: false, error: 'No stored username found' })
	} catch (error) {
		sendResponse({ success: false, error: error.message })
	}
}

/**
 * Force-refresh local storage copy of username on popup open.
 * Reads the freshest value from sync/local and rewrites local storage once.
 */
export async function handleRefreshStoredUsername(sendResponse) {
	try {
		const syncResult = await chrome.storage.sync.get(['redditUser'])
		const localResult = await chrome.storage.local.get(['redditUser'])

		const redditUser = syncResult.redditUser || localResult.redditUser

		if (redditUser && redditUser.seren_name) {
			await chrome.storage.local.set({ redditUser })
			sendResponse({
				success: true,
				data: redditUser,
				source: syncResult.redditUser ? 'sync' : 'local'
			})
			return
		}

		// Nothing valid found — clear stale local copy to avoid picking a wrong username
		await chrome.storage.local.remove(['redditUser'])
		sendResponse({ success: false, cleared: true, error: 'No username found to refresh' })
	} catch (error) {
		sendResponse({ success: false, error: error.message })
	}
}

/**
 * Handle user status saved notification
 */
export function handleUserStatusSaved(statusData, sendResponse) {
	bgLogger.log(`Background: User status saved - ${statusData.userName}`)
	chrome.action.setBadgeText({ text: '📊' })
	chrome.action.setBadgeBackgroundColor({ color: '#2196f3' })
	setTimeout(() => { chrome.action.setBadgeText({ text: '' }) }, 4000)
	sendResponse({ success: true })
}

/**
 * Handle get user status request
 */
export async function handleGetUserStatus(sendResponse) {
	try {
		const localResult = await chrome.storage.local.get(['userStatus'])
		if (localResult.userStatus) {
			sendResponse({ success: true, data: localResult.userStatus })
			return
		}

		const syncResult = await chrome.storage.sync.get(['userStatus'])
		if (syncResult.userStatus) {
			sendResponse({ success: true, data: syncResult.userStatus })
			return
		}
		sendResponse({ success: false, error: 'No user status found' })
	} catch (error) {
		sendResponse({ success: false, error: error.message })
	}
}

/**
 * Handle manual post creation from popup
 */
export async function handleCreatePostFromPopup(userName, sendResponse) {
	bgLogger.log(`[BG] Manual post creation requested for ${userName}`)

	try {
		const postData = await PostDataService.generatePost(userName)
		bgLogger.log('[BG] Generated post data for manual creation:', postData)

		const newTabId = await createCleanPostTab(userName, postData)

		sendResponse({
			success: true,
			message: 'Post creation tab opened',
			tabId: newTabId
		})
	} catch (error) {
		bgLogger.error('[BG] Failed to create post from popup:', error)
		sendResponse({
			success: false,
			error: error.message
		})
	}
}

/**
 * Resume interrupted auto-flow from saved state
 */
export async function resumeAutoFlow(state, sendResponse) {
	bgLogger.log(`[BG] 🔄 Resuming auto-flow from step: ${state.currentStep}`)

	try {
		switch (state.currentStep) {
			case 'starting':
			case 'analyzing_posts':
				await AutoFlowStateManager.clearState(state.userName)
				await handleCheckUserStatus(state.userName, sendResponse)
				break

			case 'deleting_post':
				// For delete-and-create flows we always want to behave like the
				// non-resume path: complete the deletion, then restart the full
				// auto-flow analysis from the beginning (create_with_delete).
				// Trying to "resume" by jumping directly into post creation can
				// lead to posting without fresh analysis and is against the
				// intended semantics, so we just clear state and restart.
				bgLogger.log('[BG] 🔄 Resuming from deleting_post: clearing state and restarting full auto-flow')
				await AutoFlowStateManager.clearState(state.userName)
				await handleCheckUserStatus(state.userName, sendResponse)
				break

			case 'creating_post':
				bgLogger.log('[BG] 🔄 Resuming post creation')
				if (state.tabId) {
					const tabValid = await AutoFlowStateManager.validateTab(state.tabId)
					if (tabValid) {
						proceedWithPostCreation(state.userName, state.tabId)
					} else {
						bgLogger.log('[BG] Tab is no longer valid, starting fresh')
						await AutoFlowStateManager.clearState(state.userName)
						await handleCheckUserStatus(state.userName, sendResponse)
					}
				} else {
					bgLogger.log('[BG] Cannot resume post creation - missing tab info, starting fresh')
					await AutoFlowStateManager.clearState(state.userName)
					await handleCheckUserStatus(state.userName, sendResponse)
				}
				break

			default:
				bgLogger.log(`[BG] Unknown step ${state.currentStep}, starting fresh`)
				await AutoFlowStateManager.clearState(state.userName)
				await handleCheckUserStatus(state.userName, sendResponse)
				break
		}
	} catch (error) {
		bgLogger.error('[BG] Failed to resume auto-flow:', error)
		await AutoFlowStateManager.clearState(state?.userName)
		sendResponse({
			success: false,
			error: `Failed to resume auto-flow: ${error.message}`
		})
	}
}

/**
 * Handle check user status from popup - triggers auto flow
 */
export async function handleCheckUserStatus(userName, sendResponse) {
	bgLogger.log(`[BG] User status check requested for ${userName} - starting auto flow`)

	try {
		// First check if we are currently monitoring this user
		const monitoring = await PostDataService.getActiveMonitoring(userName);
		if (monitoring && monitoring.monitoringEndTime > Date.now()) {
			bgLogger.log(`[BG] ⏳ User ${userName} is already being monitored. Preserving state.`);

			// Try to find a Reddit tab to focus, or create one if none exist
			const existingTabsAll = await chrome.tabs.query({ url: '*://*.reddit.com/*' });
			const existingTabs = existingTabsAll.filter((t) => !isRedditChatUrl(t.url))
			if (existingTabs.length > 0) {
				const tabId = existingTabs[0].id;
				chrome.tabs.update(tabId, { active: true });

				// Re-initialize state for this tab if missing
				if (!tabStates[tabId]) {
					tabStates[tabId] = {
						status: SM_STEPS.COLLECTING_POSTS,
						userName: userName,
						stepStartTime: Date.now(),
						lastFeedbackTimestamp: Date.now(),
						isRestored: true
					};
				}

				sendResponse({
					success: true,
					message: 'Monitoring active, focused existing Reddit tab',
					status: 'monitoring',
					timeLeftMinutes: Math.ceil((monitoring.monitoringEndTime - Date.now()) / 60000)
				});
				return;
			}
		}

		const existingState = await AutoFlowStateManager.recoverState(userName)
		if (existingState) {
			bgLogger.log(`[BG] 🔄 Resuming interrupted auto-flow for ${userName} at step: ${existingState.currentStep}`)
			await resumeAutoFlow(existingState, sendResponse)
			return
		}

		await AutoFlowStateManager.saveState('starting', { userName, targetAction: 'auto_flow' })

		// Try to get redditUser from storage for direct navigation optimization
		let optimizedUserName = userName
		try {
			const syncResult = await chrome.storage.sync.get(['redditUser'])
			const localResult = await chrome.storage.local.get(['redditUser'])
			const redditUser = syncResult.redditUser || localResult.redditUser

			if (redditUser && redditUser.seren_name) {
				optimizedUserName = redditUser.seren_name
				bgLogger.log(`[BG] 🎯 Found redditUser in storage, will use direct navigation to submitted page for: ${optimizedUserName}`)
			}
		} catch (e) {
			bgLogger.log('[BG] Could not retrieve redditUser from storage, using provided userName')
		}

		// Initialize or adopt a unified Reddit tab for autoflow, preserving existing tabs when possible
		bgLogger.log('[BG] 🚦 Initializing unified Reddit tab for autoflow (reusing current Reddit tab when available)')
		const freshTabId = await closeAllRedditTabsAndOpenFresh(optimizedUserName)

		// Wait for the chosen tab to load before starting automation
		const tabLoadListener = (tabId, changeInfo, tab) => {
			if (tabId === freshTabId && changeInfo.status === 'complete') {
				chrome.tabs.onUpdated.removeListener(tabLoadListener)
				bgLogger.log(`[BG] Unified Reddit tab ${freshTabId} loaded, starting automation`)
				startAutomationForTab(freshTabId, userName)
			}
		}
		chrome.tabs.onUpdated.addListener(tabLoadListener)

		sendResponse({
			success: true,
			message: optimizedUserName !== userName
				? `Initialized unified Reddit tab with direct navigation to ${optimizedUserName}/submitted/`
				: 'Initialized unified Reddit tab for automation',
			tabId: freshTabId,
			userName: userName
		})
		return
	} catch (error) {
		bgLogger.error('[BG] Failed to start user status check automation:', error)
		sendResponse({
			success: false,
			error: error.message,
			userName: userName
		})
	}
}

/**
 * Handle close current tab request
 */
export async function handleCloseCurrentTab(tabId, sendResponse) {
	bgLogger.log(`[BG] Request to close tab ${tabId}`)

	try {
		if (tabId) {
			const tab = await chrome.tabs.get(tabId).catch(() => null)
			if (isRedditChatUrl(tab?.url)) {
				bgLogger.warn(`[BG] Refusing to close protected tab (chat.reddit.com): ${tabId}`)
				sendResponse({ success: true, skipped: true, reason: 'protected_chat_tab' })
				return
			}
			await chrome.tabs.remove(tabId)
			bgLogger.log(`[BG] Successfully closed tab ${tabId}`)
			sendResponse({ success: true })
		} else {
			sendResponse({ success: false, error: 'No tabId provided for CLOSE_CURRENT_TAB' })
		}
	} catch (error) {
		bgLogger.error('[BG] Failed to close tab:', error)
		sendResponse({ success: false, error: error.message })
	}
}

/**
 * Handle profile data stored notification
 */
export function handleProfileDataStored(username, postsCount, sendResponse) {
	bgLogger.log(`[BG] Profile data stored for ${username} with ${postsCount} posts`)
	chrome.action.setBadgeText({ text: '👤' })
	chrome.action.setBadgeBackgroundColor({ color: '#4caf50' })
	setTimeout(() => { chrome.action.setBadgeText({ text: '' }) }, 3000)
	sendResponse({ success: true })
}

/**
 * Handle toggle auto-run settings
 */
export async function handleToggleAutoRun(scriptType, enabled, sendResponse) {
	bgLogger.log(`[BG] Toggling auto-run for ${scriptType}: ${enabled}`)

	try {
		const result = await chrome.storage.sync.get(['autoRunSettings'])
		const settings = result.autoRunSettings || { profileDetection: true, postSubmission: true }

		if (scriptType === 'profile') {
			settings.profileDetection = enabled
		} else if (scriptType === 'post') {
			settings.postSubmission = enabled
		} else if (scriptType === 'all') {
			settings.profileDetection = enabled
			settings.postSubmission = enabled
		}

		await chrome.storage.sync.set({ autoRunSettings: settings })
		bgLogger.log('[BG] Auto-run settings updated:', settings)

		sendResponse({ success: true, settings })
	} catch (error) {
		bgLogger.error('[BG] Failed to toggle auto-run:', error)
		sendResponse({ success: false, error: error.message })
	}
}

/**
 * Handle manual script trigger from popup
 */
export async function handleTriggerScriptManual(scriptType, tabId, sendResponse) {
	bgLogger.log(`[BG] Manual trigger for ${scriptType} on tab ${tabId}`)

	try {
		if (scriptType === 'profile') {
			if (!tabId) {
				const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
				if (tabs.length === 0) {
					sendResponse({ success: false, error: 'No active tab found' })
					return
				}
				tabId = tabs[0].id
			}

			await chrome.tabs.sendMessage(tabId, {
				type: 'MANUAL_TRIGGER_SCRIPT',
				scriptType: scriptType,
				mode: 'manual'
			})

			sendResponse({ success: true, message: `Manual ${scriptType} script triggered` })
		} else if (scriptType === 'post') {
			bgLogger.log('[BG] Creating new post tab for manual trigger')

			const userResult = await chrome.storage.sync.get(['redditUser'])
			const userName = userResult.redditUser?.seren_name || 'User'

			const postData = {
				title: "Manual post: " + Date.now(),
				body: "#manual #reddit #post " + Date.now(),
				url: "https://youtube.com/shorts/0xmhrS_VNNY?si=awYc8i5YljycesXq",
				subreddit: "sphynx"
			}

			const newTabId = await createCleanPostTab(userName, postData)

			sendResponse({
				success: true,
				message: 'Manual post creation tab opened',
				tabId: newTabId
			})
		} else {
			sendResponse({ success: false, error: 'Unknown script type' })
		}
	} catch (error) {
		bgLogger.error('[BG] Failed to trigger manual script:', error)
		sendResponse({ success: false, error: error.message })
	}
}

/**
 * Handle create post tab request from content script
 */
export async function handleCreatePostTab(postData, sendResponse) {
	bgLogger.log('[BG] Creating new post tab from content script request')

	try {
		const syncResult = await chrome.storage.sync.get(['redditUser'])
		const localResult = await chrome.storage.local.get(['redditUser'])
		const redditUser = syncResult.redditUser || localResult.redditUser
		const userName = redditUser?.seren_name || 'User'

		let freshPostData
		if (redditUser && redditUser.seren_name) {
			bgLogger.log(`[BG] Generating fresh post data for user: ${redditUser.seren_name}`)
			freshPostData = await PostDataService.generatePost(redditUser.seren_name)
		} else {
			const errorMessage = 'No username found - cannot generate post without user context'
			bgLogger.error('[BG] ' + errorMessage)
			throw new Error(errorMessage)
		}

		bgLogger.log('[BG] Using fresh API-generated post data:', freshPostData)

		const newTabId = await createCleanPostTab(userName, freshPostData)

		sendResponse({
			success: true,
			message: 'Post creation tab opened',
			tabId: newTabId
		})
	} catch (error) {
		bgLogger.error('[BG] Failed to create post tab from content script:', error)
		sendResponse({
			success: false,
			error: error.message
		})
	}
}

/**
 * Handle get tab state request from content script
 */
export async function handleGetTabState(tabId, sendResponse) {
	bgLogger.log(`[BG] Getting tab state for tab ${tabId}`)

	try {
		const state = tabStates[tabId]
		const isBackgroundPostTab = state && state.isPostTab

		sendResponse({
			success: true,
			isBackgroundPostTab: isBackgroundPostTab,
			state: state
		})
	} catch (error) {
		bgLogger.error('[BG] Failed to get tab state:', error)
		sendResponse({ success: false, error: error.message })
	}
}

/**
 * Handle reuse reddit tab request from popup
 */
export async function handleReuseRedditTab(targetUrl, action, sendResponse) {
	bgLogger.log(`[BG] Reusing reddit tab for action:`, action)
	bgLogger.log(`[BG] Target URL: ${targetUrl}`)

	try {
		const existingTabsAll = await chrome.tabs.query({ url: '*://*.reddit.com/*' })
		const existingTabs = existingTabsAll.filter((t) => !isRedditChatUrl(t.url))

		let targetTab

		if (existingTabs.length > 0) {
			const inactiveTab = existingTabs.find((tab) => !tab.active)
			targetTab = inactiveTab || existingTabs[0]

			bgLogger.log(`[BG] Reusing existing tab ${targetTab.id} for action, navigating to ${targetUrl}`)

			await chrome.tabs.update(targetTab.id, {
				url: targetUrl,
				active: true
			})
		} else {
			bgLogger.log(`[BG] No existing reddit.com tabs found, creating new tab with URL: ${targetUrl}`)
			targetTab = await chrome.tabs.create({
				url: targetUrl,
				active: true
			})
		}

		const tabLoadListener = (tabId, changeInfo, tab) => {
			if (tabId === targetTab.id && changeInfo.status === 'complete') {
				chrome.tabs.onUpdated.removeListener(tabLoadListener)

				bgLogger.log(`[BG] Tab ${targetTab.id} loaded, waiting for content script to be ready...`)

				// Wait for content script to be ready before sending the action
				waitForContentScript(targetTab.id, { retries: 15, initialDelayMs: 500 })
					.then((ready) => {
						if (!ready) {
							bgLogger.error(`[BG] ❌ Content script not ready in tab ${targetTab.id} after retries`)
							return
						}

						bgLogger.log(`[BG] ✅ Content script ready in tab ${targetTab.id}, sending action: ${action.type}`)

						try {
							chrome.tabs.sendMessage(targetTab.id, action)
								.then(() => {
									bgLogger.log(`[BG] ✅ Action ${action.type} sent successfully to tab ${targetTab.id}`)
								})
								.catch((err) => {
									const msg = err?.message || String(err)
									// Benign/expected during navigation/reloads: don't treat as a hard error
									if (msg.includes('message channel closed before a response was received') ||
										msg.includes('Receiving end does not exist') ||
										msg.includes('Extension context invalidated')) {
										bgLogger.warn(`[BG] ⚠️ Action ${action.type} could not be confirmed (tab reloaded): ${msg}`)
										return
									}
									bgLogger.error(`[BG] ❌ Failed to send action to tab ${targetTab.id}:`, err)
								})
						} catch (err) {
							bgLogger.error(`[BG] ❌ Error sending action to tab ${targetTab.id}:`, err)
						}
					})
					.catch((err) => {
						bgLogger.error(`[BG] ❌ Error waiting for content script:`, err)
					})
			}
		}

		chrome.tabs.onUpdated.addListener(tabLoadListener)

		sendResponse({
			success: true,
			message: `Reddit tab reused/created for ${action}`,
			tabId: targetTab.id
		})
	} catch (error) {
		bgLogger.error('[BG] Failed to reuse reddit tab:', error)
		sendResponse({ success: false, error: error.message })
	}
}

/**
 * Handle open extension request from content scripts
 * Opens or focuses the extension's single UI tab using unified tab manager
 */
export async function handleOpenExtension(sendResponse) {
	bgLogger.log('[BG] Opening/focusing extension UI tab using unified tab manager')

	try {
		const tabId = await getExtensionTab()
		sendResponse({
			success: true,
			message: 'Extension tab opened/focused',
			tabId: tabId
		})
	} catch (error) {
		bgLogger.error('[BG] Failed to open extension tab:', error)
		sendResponse({
			success: false,
			error: error.message
		})
	}
}
