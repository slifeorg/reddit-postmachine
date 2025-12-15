import { bgLogger } from "./logger.js";/**
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
import { openOrFocusExtensionTab } from './extension-tab-manager.js'

// Finalize reload listeners and timeouts
const finalizeReloadListeners = {}
const finalizeReloadTimeouts = {}

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
    ).catch(() => {})
  }
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
  const ready = await waitForContentScript(tabId)
  if (!ready) {
    bgLogger.error(`[BG] Content script not reachable in tab ${tabId}, cannot send GET_POSTS (${source})`)
    logToTab(tabId, `Content script not reachable; skipping post collection (${source}).`)
    delete tabStates[tabId]
    return false
  }

  try {
    await chrome.tabs.sendMessage(tabId, {
      type: 'REDDIT_POST_MACHINE_GET_POSTS',
      payload: { userName }
    })
    return true
  } catch (err) {
    bgLogger.error(`[BG] Failed to send GET_POSTS (${source}):`, err)
    delete tabStates[tabId]
    return false
  }
}

/**
 * Create a clean post tab for submission
 */
export async function createCleanPostTab(userName, postData) {
  try {
    bgLogger.log('[BG] Creating clean post tab - closing current Reddit tabs first')

    const cleanSubreddit = (postData.subreddit || 'test').replace(/^r\//i, '')
    const submitUrl = `https://www.reddit.com/r/${cleanSubreddit}/submit`
    bgLogger.log(`[BG] Creating new clean tab at ${submitUrl}`)

    const newTab = await chrome.tabs.create({
      url: submitUrl,
      active: true
    })

    tabStates[newTab.id] = {
      status: SM_STEPS.POSTING,
      userName: userName,
      postData: postData,
      stepStartTime: Date.now(),
      lastFeedbackTimestamp: Date.now(),
      isPostTab: true,
      isCleanTab: true
    }

    const tabLoadListener = (tabId, changeInfo, tab) => {
      if (tabId === newTab.id && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(tabLoadListener)

        bgLogger.log(`[BG] Clean post tab ${newTab.id} loaded, URL: ${tab.url}`)

        if (!tab.url || !tab.url.includes('/submit')) {
          bgLogger.error(`[BG] Tab ${newTab.id} is not on submit page: ${tab.url}`)
          delete tabStates[newTab.id]
          return
        }

        setTimeout(() => {
          bgLogger.log(`[BG] Sending START_POST_CREATION to tab ${newTab.id}`)
          chrome.tabs.sendMessage(newTab.id, {
            type: 'START_POST_CREATION',
            userName: userName,
            postData: postData
          }).catch((err) => {
            bgLogger.error(`[BG] Failed to send post data to clean tab ${newTab.id}:`, err)
            delete tabStates[newTab.id]
          })
        }, 2000)
      }
    }

    chrome.tabs.onUpdated.addListener(tabLoadListener)
    return newTab.id
  } catch (error) {
    bgLogger.error('[BG] Failed to create clean post tab:', error)
    throw error
  }
}

/**
 * Create or reuse a post tab for submission
 */
export async function createOrReusePostTab(userName, postData) {
  bgLogger.log(`[BG] Creating/reusing post tab for ${userName} with data:`, postData)

  const cleanSubreddit = (postData.subreddit || 'sphynx').replace(/^r\//i, '')
  const submitUrl = `https://www.reddit.com/r/${cleanSubreddit}/submit`

  try {
    const existingTabs = await chrome.tabs.query({ url: '*://*.reddit.com/*' })

    let targetTab

    if (existingTabs.length > 0) {
      const reusableTabs = existingTabs.filter((tab) => {
        const state = tabStates[tab.id]
        if (state && state.status !== SM_STEPS.IDLE) {
          bgLogger.log(`[BG] Skipping tab ${tab.id} - active automation state: ${state.status}`)
          return false
        }

        if (tab.url && tab.url.includes('/submit')) {
          bgLogger.log(`[BG] Skipping tab ${tab.id} - already on submit page`)
          return false
        }

        return true
      })

      if (reusableTabs.length > 0) {
        const inactiveTab = reusableTabs.find((tab) => !tab.active)
        targetTab = inactiveTab || reusableTabs[0]

        bgLogger.log(`[BG] Reusing existing tab ${targetTab.id} for post submission`)

        await chrome.tabs.update(targetTab.id, {
          url: submitUrl,
          active: true
        })
      } else {
        bgLogger.log(`[BG] No reusable tabs found, creating new tab`)
      }
    }

    if (!targetTab) {
      bgLogger.log(`[BG] Creating new tab for post submission`)
      targetTab = await chrome.tabs.create({
        url: submitUrl,
        active: true
      })
    }

    bgLogger.log(`[BG] Using tab ${targetTab.id} at ${submitUrl}`)

    tabStates[targetTab.id] = {
      status: SM_STEPS.POSTING,
      userName: userName,
      postData: postData,
      stepStartTime: Date.now(),
      isPostTab: true
    }

    const tabLoadListener = (tabId, changeInfo, tab) => {
      if (tabId === targetTab.id && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(tabLoadListener)

        bgLogger.log(`[BG] Post tab ${targetTab.id} loaded, URL: ${tab.url}`)

        if (!tab.url || !tab.url.includes('/submit')) {
          bgLogger.error(`[BG] Tab ${targetTab.id} is not on submit page: ${tab.url}`)
          delete tabStates[targetTab.id]
          return
        }

        setTimeout(() => {
          bgLogger.log(`[BG] Sending START_POST_CREATION to tab ${targetTab.id}`)
          chrome.tabs.sendMessage(targetTab.id, {
            type: 'START_POST_CREATION',
            userName: userName,
            postData: postData
          }).catch((err) => {
            bgLogger.error(`[BG] Failed to send post data to tab ${targetTab.id}:`, err)
            delete tabStates[targetTab.id]
          })
        }, 2000)
      }
    }

    chrome.tabs.onUpdated.addListener(tabLoadListener)

    return targetTab.id
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
      chrome.tabs.reload(tabId).catch(() => {})
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

    chrome.tabs.reload(tabId).catch(() => {})
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

  chrome.tabs.update(tabId, { url: submittedUrl, active: true }).catch(() => {
    chrome.tabs.onUpdated.removeListener(listener)
    delete finalizeReloadListeners[tabId]

    if (finalizeReloadTimeouts[tabId]) {
      clearTimeout(finalizeReloadTimeouts[tabId])
      delete finalizeReloadTimeouts[tabId]
    }
  })
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

  if (currentState && currentState.status === SM_STEPS.POSTING) {
    bgLogger.log('[BG] Skipping periodic check - Posting in progress (Locked)')
    return
  }

  if (currentState) {
    bgLogger.log(`[BG] Skipping periodic check - Busy in state: ${currentState.status}`)
    return
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

  chrome.tabs.update(tabId, { url: directPostsUrl }).catch((err) => {
    bgLogger.error('[BG] Failed to navigate directly to posts URL:', err)
    logToTab(tabId, `Error navigating to posts URL: ${err.message}`)
    delete tabStates[tabId]
  })

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
export function handleContentScriptReady(tabId, url) {
  const state = tabStates[tabId]
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

  const state = tabStates[tabId]
  if (!state) {
    bgLogger.log(`[BG] State already cleared for tab ${tabId}. Action ${action} was likely the final step.`)
    return
  }

  logToTab(tabId, `Action completed in tab ${tabId}: ${action} (Success: ${success})`)

  touchTabState(state)

  if (!success) {
    bgLogger.warn(`Action ${action} failed. Aborting automation.`)
    delete tabStates[tabId]
    return
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
        proceedWithPostCreation(state.userName, tabId)
      })
    }, 2000)
  } else if (action === 'GET_POSTS') {
    await handleGetPostsAction(tabId, state, data)
  } else if (action === 'POST_CREATION_COMPLETED') {
    await handlePostCreationCompleted(tabId, state, success, data)
  } else if (action === 'DELETE_POST_COMPLETED') {
    await handleDeletePostCompleted(tabId, state, success, data)
  }
}

/**
 * Handle GET_POSTS action completion
 */
async function handleGetPostsAction(tabId, state, data) {
  bgLogger.log('[BG] 📊 GET_POSTS action received, collecting fresh data for decision...')

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

  PostDataService.shouldCreatePost(dataForAnalysis)
    .then(async (result) => {
      bgLogger.log('[BG] 🎯 FINAL DECISION RESULT:', {
        shouldCreate: result.shouldCreate,
        reason: result.reason,
        decisionReport: result.decisionReport
      })

      if (result.shouldCreate) {
        bgLogger.log(`[BG] 🚀 EXECUTING: New post required. Reason: ${result.reason}`)

        if (result.lastPost && (result.reason === 'post_blocked' || result.reason === 'post_downvoted' || result.reason === 'post_removed' || result.reason === 'low_engagement')) {
          bgLogger.log('[BG] 🗑️ STEP 1: Attempting to delete last post before creating new one')

          state.deletingBeforeCreating = true

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

              const failedDeleteResult = {
                status: 'failed',
                postResult: 'error',
                postId: null,
                errorMessage: 'Failed to send delete command: ' + err.message,
                timestamp: Date.now()
              }

              PostDataService.saveExecutionResult(failedDeleteResult)
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
        bgLogger.log('[BG] ✅ COMPLETE: No new post needed. Clearing state and waiting for next interval.')

        await AutoFlowStateManager.clearState(state.userName)

        const executionResult = {
          status: 'skipped',
          postResult: 'none',
          postId: null,
          errorMessage: null,
          timestamp: Date.now()
        }

        PostDataService.saveExecutionResult(executionResult)
        const userName = state.userName
        delete tabStates[tabId]
        finalizeAutoFlowToSubmitted(tabId, userName)
      }
    })
    .catch((err) => {
      bgLogger.error('[BG] ❌ ERROR: Error analyzing posts:', err)
      delete tabStates[tabId]
    })
}

/**
 * Handle POST_CREATION_COMPLETED action
 */
async function handlePostCreationCompleted(tabId, state, success, data) {
  bgLogger.log('[BG] Posting process completed. Closing submit tab and opening reddit.com for status check.')

  const wasDeletingBeforeCreating = state && state.deletingBeforeCreating
  let userName = state?.userName

  if (state) {
    delete tabStates[tabId]
  }

  let postResult = success ? 'created' : 'error'
  if (success && wasDeletingBeforeCreating) {
    postResult = 'deleted_and_created'
  }

  if (success) {
    await AutoFlowStateManager.clearState(userName)
    await chrome.storage.local.remove(['latestPostsData'])
    bgLogger.log(`[BG] ✅ Auto-flow completed successfully, state cleared for user ${userName}`)
  }

  const executionResult = {
    status: success ? 'completed' : 'failed',
    postResult: postResult,
    postId: data?.postId || null,
    errorMessage: data?.error || null,
    timestamp: Date.now()
  }

  PostDataService.saveExecutionResult(executionResult)

  try {
    const tab = await chrome.tabs.get(tabId)
    if (tab) {
      await chrome.tabs.remove(tabId)
      bgLogger.log(`[BG] Closed submit tab ${tabId}`)
    }
  } catch (error) {
    bgLogger.warn(`[BG] Submit tab ${tabId} already closed or not found:`, error)
  }

  if (success && !userName) {
    try {
      const syncResult = await chrome.storage.sync.get(['redditUser'])
      const localResult = await chrome.storage.local.get(['redditUser'])
      userName = syncResult.redditUser?.seren_name || localResult.redditUser?.seren_name
    } catch (e) {
    }
  }

  if (success && userName) {
    setTimeout(async () => {
      try {
        const cleanUsername = userName.replace('u/', '')
        const newTab = await chrome.tabs.create({
          url: `https://www.reddit.com/user/${cleanUsername}/submitted/`,
          active: true
        })
        finalizeAutoFlowToSubmitted(newTab.id, userName)
      } catch (error) {
        bgLogger.error('[BG] Failed to open submitted posts page after post creation:', error)
      }
    }, 1000)
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
  bgLogger.log('[BG] Tab state:', state)
  bgLogger.log('[BG] Username extracted:', userName)

  await AutoFlowStateManager.saveState('deletion_completed', {
    userName,
    success: success,
    targetAction: 'delete_and_create'
  })

  const executionResult = {
    status: success ? 'completed' : 'failed',
    postResult: success ? 'deleted' : 'error',
    postId: data?.postId || null,
    errorMessage: data?.error || null,
    timestamp: Date.now()
  }

  PostDataService.saveExecutionResult(executionResult)

  if (success) {
    bgLogger.log('[BG] ✅ Delete was successful, clearing cache and restarting autoflow from beginning')
    await chrome.storage.local.remove(['latestPostsData'])

    if (userName) {
      bgLogger.log('[BG] 🔄 Restarting autoflow analysis after deletion')

      // Clear the current state to start fresh
      await AutoFlowStateManager.clearState(userName)

      // Trigger fresh autoflow check from the beginning
      bgLogger.log(`[BG] 🚀 Triggering fresh autoflow check for ${userName}`)
      await handleCheckUserStatus(userName, (response) => {
        bgLogger.log('[BG] Fresh autoflow check initiated after deletion:', response)
      })
    }
  }
}

// ===== STANDARD MESSAGE HANDLERS =====

/**
 * Get Reddit page information
 */
export function handleGetRedditInfo(sendResponse) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0]
    if (tab && tab.url && tab.url.includes('reddit.com')) {
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

    const tabs = await chrome.tabs.query({ url: "*://*.reddit.com/*/submit*" })
    let targetTab

    if (tabs.length > 0) {
      targetTab = tabs[0]
      bgLogger.log('[BG] Using existing submit tab:', targetTab.id)
    } else {
      targetTab = await chrome.tabs.create({
        url: 'https://www.reddit.com/submit',
        active: false
      })
      bgLogger.log('[BG] Created new submit tab:', targetTab.id)

      await new Promise((resolve) => {
        chrome.tabs.onUpdated.addListener(function tabLoadListener(tabId, changeInfo) {
          if (tabId === targetTab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(tabLoadListener)
            setTimeout(resolve, 2000)
          }
        })
      })
    }

    setTimeout(() => {
      const userName = redditUser?.seren_name || 'AutoUser'

      chrome.tabs.sendMessage(targetTab.id, {
        type: 'START_POST_CREATION',
        userName: userName,
        postData: postToSubmit
      }).catch((err) => {
        bgLogger.error(`[BG] Failed to send post data to tab ${targetTab.id}:`, err)
      })
    }, 3000)

    sendResponse({
      success: true,
      message: 'Post data sent to submit tab',
      tabId: targetTab.id
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
        bgLogger.log('[BG] 🔄 Resuming delete operation')
        if (state.tabId && state.lastPostToDelete) {
          const tabValid = await AutoFlowStateManager.validateTab(state.tabId)
          if (tabValid) {
            chrome.tabs.sendMessage(state.tabId, {
              type: 'DELETE_LAST_POST',
              userName: state.userName
            }).then((response) => {
              bgLogger.log('[BG] Delete command sent successfully on resume:', response)
              setTimeout(() => {
                proceedWithPostCreation(state.userName, state.tabId)
              }, 3000)
            }).catch((err) => {
              bgLogger.error('[BG] ❌ Failed to resume delete command:', err)
              proceedWithPostCreation(state.userName, state.tabId)
            })
          } else {
            bgLogger.log('[BG] Tab is no longer valid, starting fresh')
            await AutoFlowStateManager.clearState(state.userName)
            await handleCheckUserStatus(state.userName, sendResponse)
          }
        } else {
          bgLogger.log('[BG] Cannot resume deletion - missing tab or post info, starting fresh')
          await AutoFlowStateManager.clearState(state.userName)
          await handleCheckUserStatus(state.userName, sendResponse)
        }
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
    const existingState = await AutoFlowStateManager.recoverState(userName)
    if (existingState) {
      bgLogger.log(`[BG] 🔄 Resuming interrupted auto-flow for ${userName} at step: ${existingState.currentStep}`)
      await resumeAutoFlow(existingState, sendResponse)
      return
    }

    await AutoFlowStateManager.saveState('starting', { userName, targetAction: 'auto_flow' })

    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (!currentTab) {
      bgLogger.log('[BG] No active tab found, creating new Reddit tab')
      const newTab = await chrome.tabs.create({
        url: 'https://www.reddit.com/',
        active: true
      })

      const tabLoadListener = (tabId, changeInfo, tab) => {
        if (tabId === newTab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(tabLoadListener)
          bgLogger.log(`[BG] New tab ${newTab.id} loaded, starting automation`)
          startAutomationForTab(newTab.id, userName)
        }
      }
      chrome.tabs.onUpdated.addListener(tabLoadListener)

      sendResponse({
        success: true,
        message: 'Created new tab and started automation',
        tabId: newTab.id,
        userName: userName
      })
      return
    }

    const tabId = currentTab.id
    bgLogger.log(`[BG] Using existing tab ${tabId} for automation`)

    const existingTabState = tabStates[tabId]
    if (existingTabState) {
      const stateAge = Date.now() - (existingTabState.stepStartTime || 0)
      const isStuck = stateAge > 30000

      if (isStuck || existingTabState.status === SM_STEPS.COLLECTING_POSTS) {
        bgLogger.log(`[BG] Cleaning up stuck state for tab ${tabId} (status: ${existingTabState.status}, age: ${stateAge}ms)`)
        delete tabStates[tabId]
      }
    }

    if (!currentTab.url.includes('reddit.com')) {
      bgLogger.log(`[BG] Navigating tab ${tabId} to Reddit`)
      await chrome.tabs.update(tabId, {
        url: 'https://www.reddit.com/',
        active: true
      })

      const tabLoadListener = (tabId, changeInfo, tab) => {
        if (tabId === currentTab.id && changeInfo.status === 'complete' && tab.url.includes('reddit.com')) {
          chrome.tabs.onUpdated.removeListener(tabLoadListener)
          bgLogger.log(`[BG] Tab ${tabId} navigated to Reddit, starting automation`)
          startAutomationForTab(tabId, userName)
        }
      }
      chrome.tabs.onUpdated.addListener(tabLoadListener)
    } else {
      bgLogger.log(`[BG] Tab ${tabId} already on Reddit, starting automation immediately`)
      startAutomationForTab(tabId, userName)
    }

    sendResponse({
      success: true,
      message: 'Automation started for user status check',
      tabId: tabId,
      userName: userName
    })
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
    const existingTabs = await chrome.tabs.query({ url: '*://*.reddit.com/*' })

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
 * Opens or focuses the extension's single UI tab
 */
export async function handleOpenExtension(sendResponse) {
  bgLogger.log('[BG] Opening/focusing extension UI tab')

  try {
    const tabId = await openOrFocusExtensionTab()
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
