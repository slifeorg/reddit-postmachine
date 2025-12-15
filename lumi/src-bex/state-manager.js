import { stateLogger } from "./logger.js";/**
 * State Manager Module
 * Handles automation state persistence, recovery, and tab state tracking
 */

// State machine step definitions
export const SM_STEPS = {
  IDLE: 'IDLE',
  NAVIGATING_PROFILE: 'NAVIGATING_PROFILE',
  NAVIGATING_POSTS: 'NAVIGATING_POSTS',
  COLLECTING_POSTS: 'COLLECTING_POSTS',
  DELETING_POST: 'DELETING_POST',
  POSTING: 'POSTING'
}

// Track active tab states for automation
export const tabStates = {}

// Track tabs that have been processed for auto-start automation
export const processedTabs = new Set()

// Periodic check configuration
export const CHECK_INTERVAL = 121000
let checkIntervalId = null

// Stall watchdog configuration
export const STALL_TIMEOUT_MS = 5 * 60 * 1000
let stallWatchdogIntervalId = null

// Getter and setter functions for mutable state
export function getCheckIntervalId() {
  return checkIntervalId
}

export function setCheckIntervalId(id) {
  checkIntervalId = id
}

export function getStallWatchdogIntervalId() {
  return stallWatchdogIntervalId
}

export function setStallWatchdogIntervalId(id) {
  stallWatchdogIntervalId = id
}

/**
 * Update the last feedback timestamp for a tab state
 * @param {Object} state - The tab state object
 */
export function touchTabState(state) {
  if (state) state.lastFeedbackTimestamp = Date.now()
}

/**
 * Restart automation flow from the beginning for a user
 * @param {string} userName - The Reddit username
 */
export async function restartAutoFlowFromBeginning(userName) {
  if (!userName) return
  await AutoFlowStateManager.clearState(userName)
  // Note: handleCheckUserStatus is imported from message-handlers
  // This will be called from message-handlers.js
}

/**
 * Auto-Flow State Manager for persistence across sessions
 * Handles saving, loading, and recovering automation state
 */
export class AutoFlowStateManager {
  static STATE_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

  static getStateKey(userName) {
    return `autoFlowState_${userName}`
  }

  static async saveState(step, data = {}) {
    const userName = data.userName
    if (!userName) return

    const stateKey = this.getStateKey(userName)
    const currentState = await this.getState(userName)

    // Determine if this is a retry of the same step or progression to a new step
    let attemptCount = 1
    if (currentState && currentState.currentStep === step) {
      // Same step - increment attempt count (retry)
      attemptCount = (currentState.attemptCount || 1) + 1

      // Prevent infinite loops by limiting retry attempts
      if (attemptCount > 5) {
        stateLogger.log(
          `[AutoFlowStateManager] ⚠️ Too many retry attempts (${attemptCount}) for step ${step}, clearing state for user ${data.userName}`
        )
        await this.clearState(data.userName)
        return
      }
    } else if (currentState) {
      // New step - reset attempt count to 1
      stateLogger.log(
        `[AutoFlowStateManager] 🔄 Progressing from ${currentState.currentStep} to ${step}, resetting attempt count`
      )
    }

    const state = {
      status: 'in_progress',
      currentStep: step,
      attemptCount: attemptCount,
      lastAttemptTimestamp: Date.now(),
      targetAction: data.targetAction || 'create',
      userName: data.userName || null,
      lastPostToDelete: data.lastPostToDelete || null,
      postData: data.postData || null,
      decisionReport: data.decisionReport || null,
      tabId: data.tabId || null,
      ...data
    }

    try {
      await chrome.storage.local.set({ [stateKey]: state })
      stateLogger.log(
        `[AutoFlowStateManager] 💾 State saved: ${step} for user ${data.userName} (attempt ${attemptCount})`,
        state
      )
    } catch (error) {
      stateLogger.error('[AutoFlowStateManager] Failed to save state:', error)
    }
  }

  static async getState(userName) {
    try {
      if (!userName) return null
      const stateKey = this.getStateKey(userName)
      const result = await chrome.storage.local.get([stateKey])
      return result[stateKey] || null
    } catch (error) {
      stateLogger.error('[AutoFlowStateManager] Failed to get state:', error)
      return null
    }
  }

  static async clearState(userName) {
    try {
      if (!userName) return
      const stateKey = this.getStateKey(userName)
      await chrome.storage.local.remove([stateKey])
      stateLogger.log(`[AutoFlowStateManager] 🗑️ State cleared for user ${userName}`)
    } catch (error) {
      stateLogger.error('[AutoFlowStateManager] Failed to clear state:', error)
    }
  }

  static async isStateStale(state) {
    if (!state || !state.lastAttemptTimestamp) return true
    return Date.now() - state.lastAttemptTimestamp > this.STATE_EXPIRY_MS
  }

  static async recoverState(userName) {
    const state = await this.getState(userName)
    if (!state) {
      stateLogger.log(`[AutoFlowStateManager] No previous state found for user ${userName}`)
      return null
    }

    if (await this.isStateStale(state)) {
      stateLogger.log(`[AutoFlowStateManager] Previous state is stale for user ${userName}, clearing it`)
      await this.clearState(userName)
      return null
    }

    stateLogger.log(`[AutoFlowStateManager] 🔄 Recovering previous state for user ${userName}:`, state)
    return state
  }

  static async validateTab(tabId) {
    try {
      const tab = await chrome.tabs.get(tabId)
      return tab && !tab.discarded
    } catch (error) {
      stateLogger.log(`[AutoFlowStateManager] Tab ${tabId} is no longer valid:`, error.message)
      return false
    }
  }
}

