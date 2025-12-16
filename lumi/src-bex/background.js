import { bgLogger } from "./logger.js";/**
 * Background script for Reddit Post Machine
 * Entry point that imports modular components
 */

import { bexBackground } from 'quasar/wrappers'
import {
  logToTab,
  waitForContentScript,
  sendGetPosts,
  createCleanPostTab,
  createOrReusePostTab,
  finalizeAutoFlowToSubmitted,
  proceedWithPostCreation,
  startAutomationForTab,
  triggerPeriodicCheck,
  checkAndAdvanceState,
  handleContentScriptReady,
  handleActionCompleted,
  handleGetRedditInfo,
  handleCreatePost,
  handleSaveSettings,
  handleUsernameStored,
  handleGetStoredUsername,
  handleUserStatusSaved,
  handleGetUserStatus,
  handleCreatePostFromPopup,
  handleCloseCurrentTab,
  handleProfileDataStored,
  handleToggleAutoRun,
  handleTriggerScriptManual,
  handleCreatePostTab,
  handleGetTabState,
  handleReuseRedditTab,
  resumeAutoFlow,
  handleCheckUserStatus,
  handleOpenExtension
} from './message-handlers.js'

import {
  getExtensionTab,
  handleTabClosed
} from './unified-tab-manager.js'

import {
  AutoFlowStateManager,
  SM_STEPS,
  tabStates,
  processedTabs,
  CHECK_INTERVAL,
  getStallWatchdogIntervalId,
  setStallWatchdogIntervalId,
  touchTabState
} from './state-manager.js'

// ===== ENTRY POINT =====

// Helper function to restart auto-flow from the beginning
async function restartAutoFlowFromBeginning(userName) {
  if (!userName) return
  await AutoFlowStateManager.clearState(userName)
  handleCheckUserStatus(userName, () => {})
}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const senderTabId = sender.tab ? sender.tab.id : null
  bgLogger.log('Background received message:', message.type, senderTabId ? `from tab ${senderTabId}` : 'from popup')

  switch (message.type) {
    case 'GET_REDDIT_INFO':
      handleGetRedditInfo(sendResponse)
      break

    case 'CREATE_POST':
      handleCreatePost(message.data, sendResponse)
      return true

    case 'SAVE_SETTINGS':
      handleSaveSettings(message.data, sendResponse)
      break

    case 'USERNAME_STORED':
      handleUsernameStored(message.username, message.timestamp, sendResponse)
      break

    case 'GET_STORED_USERNAME':
      handleGetStoredUsername(sendResponse)
      return true

    case 'GET_USER_STATUS':
      handleGetUserStatus(sendResponse)
      return true

    case 'CHECK_USER_STATUS':
      handleCheckUserStatus(message.userName, sendResponse)
      return true

    case 'CREATE_POST_FROM_POPUP':
      handleCreatePostFromPopup(message.userName, sendResponse)
      return true

    case 'CONTENT_SCRIPT_READY':
      handleContentScriptReady(senderTabId, message.url)
      sendResponse({ received: true })
      break

    case 'URL_CHANGED':
      if (senderTabId) {
        bgLogger.log(`URL Changed in tab ${senderTabId}: ${message.url}`)
        const state = tabStates[senderTabId]
        if (state) {
          checkAndAdvanceState(senderTabId, state, message.url)
        }
      }
      sendResponse({ received: true })
      break

    case 'ACTION_COMPLETED':
      handleActionCompleted(senderTabId, message.action, message.success, message.data)
      sendResponse({ received: true })
      return true

    case 'USER_STATUS_SAVED':
      handleUserStatusSaved(message.data, sendResponse)
      break

    case 'CLOSE_CURRENT_TAB':
      handleCloseCurrentTab(senderTabId, sendResponse)
      return true

    case 'PROFILE_DATA_STORED':
      handleProfileDataStored(message.username, message.postsCount, sendResponse)
      break

    case 'TOGGLE_AUTO_RUN':
      handleToggleAutoRun(message.scriptType, message.enabled, sendResponse)
      return true

    case 'TRIGGER_SCRIPT_MANUAL':
      handleTriggerScriptManual(message.scriptType, senderTabId, sendResponse)
      return true

    case 'CREATE_POST_TAB':
      handleCreatePostTab(message.postData, sendResponse)
      return true

    case 'GET_TAB_STATE':
      handleGetTabState(senderTabId, sendResponse)
      return true

    case 'REUSE_REDDIT_TAB':
      handleReuseRedditTab(message.url, message.action, sendResponse)
      return true

    case 'RESUME_AUTO_FLOW':
      resumeAutoFlow(message.state, sendResponse)
      return true

    case 'OPEN_EXTENSION':
      handleOpenExtension(sendResponse)
      return true

    default:
      bgLogger.log('Unknown message type:', message.type)
      sendResponse({ error: 'Unknown message type' })
  }
})

// Monitor tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const state = tabStates[tabId]

  if ((changeInfo.url || changeInfo.status === 'complete') && tab.url && tab.url.includes('reddit.com')) {
    if (state) {
      checkAndAdvanceState(tabId, state, tab.url)
    }
  }
})

// Cleanup closed tabs
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabStates[tabId]
  processedTabs.delete(tabId)
  // Handle extension tab closure
  handleTabClosed(tabId).catch(() => {})
})

// Export default function for Quasar bridge compatibility
export default bexBackground((bridge) => {
  bgLogger.log('Background script bridge initialized', bridge)

  chrome.storage.local.remove(['autoFlowState_unknown']).catch(() => {})

  // Setup stall watchdog to detect and recover from stuck automation states
  const STALL_TIMEOUT_MS = 5 * 60 * 1000
  setStallWatchdogIntervalId(setInterval(() => {
    const now = Date.now()
    for (const [tabIdStr, state] of Object.entries(tabStates)) {
      if (!state) continue
      if (state.status === SM_STEPS.POSTING) continue
      const lastTs = state.lastFeedbackTimestamp || state.stepStartTime
      if (!lastTs) continue
      if (now - lastTs <= STALL_TIMEOUT_MS) continue

      const userName = state.userName
      delete tabStates[tabIdStr]
      restartAutoFlowFromBeginning(userName).catch(() => {})
    }
  }, 30000))
})

