import { bgLogger } from "./logger.js";/**
 * Extension Tab Manager
 * Manages a single dedicated tab for the extension UI
 * Implements single-tab pattern to prevent multiple extension tabs
 */

const EXTENSION_TAB_ID_KEY = 'extensionTabId'
const EXTENSION_TAB_URL = 'chrome-extension://__MSG_@@extension_id__/www/index.html#/popup'

/**
 * Get the stored extension tab ID from storage
 */
export async function getStoredExtensionTabId() {
  try {
    const result = await chrome.storage.local.get([EXTENSION_TAB_ID_KEY])
    return result[EXTENSION_TAB_ID_KEY] || null
  } catch (error) {
    bgLogger.error('[ExtTabMgr] Failed to get stored extension tab ID:', error)
    return null
  }
}

/**
 * Save the extension tab ID to storage
 */
export async function saveExtensionTabId(tabId) {
  try {
    await chrome.storage.local.set({ [EXTENSION_TAB_ID_KEY]: tabId })
    bgLogger.log(`[ExtTabMgr] Saved extension tab ID: ${tabId}`)
  } catch (error) {
    bgLogger.error('[ExtTabMgr] Failed to save extension tab ID:', error)
  }
}

/**
 * Clear the stored extension tab ID
 */
export async function clearExtensionTabId() {
  try {
    await chrome.storage.local.remove([EXTENSION_TAB_ID_KEY])
    bgLogger.log('[ExtTabMgr] Cleared extension tab ID')
  } catch (error) {
    bgLogger.error('[ExtTabMgr] Failed to clear extension tab ID:', error)
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
    bgLogger.log(`[ExtTabMgr] Tab ${tabId} is no longer valid:`, error.message)
    return false
  }
}

/**
 * Get the extension's popup URL
 */
export function getExtensionPopupUrl() {
  return `chrome-extension://${chrome.runtime.id}/www/index.html#/popup`
}

/**
 * Open or focus the extension UI tab
 * Implements single-tab pattern:
 * - If a valid tab exists, focus it
 * - If the stored tab ID is invalid, create a new one
 * - Otherwise create a new tab
 */
export async function openOrFocusExtensionTab() {
  try {
    const storedTabId = await getStoredExtensionTabId()
    
    // Check if stored tab is still valid
    if (storedTabId && await isTabValid(storedTabId)) {
      bgLogger.log(`[ExtTabMgr] Focusing existing extension tab ${storedTabId}`)
      await chrome.tabs.update(storedTabId, { active: true })
      return storedTabId
    }
    
    // Stored tab is invalid, clear it
    if (storedTabId) {
      bgLogger.log(`[ExtTabMgr] Stored tab ${storedTabId} is no longer valid, clearing`)
      await clearExtensionTabId()
    }
    
    // Create new extension tab
    bgLogger.log('[ExtTabMgr] Creating new extension tab')
    const newTab = await chrome.tabs.create({
      url: getExtensionPopupUrl(),
      active: true
    })
    
    await saveExtensionTabId(newTab.id)
    bgLogger.log(`[ExtTabMgr] Created new extension tab ${newTab.id}`)
    return newTab.id
  } catch (error) {
    bgLogger.error('[ExtTabMgr] Failed to open/focus extension tab:', error)
    throw error
  }
}

/**
 * Handle tab closure cleanup
 * Call this when a tab is closed to clear the stored ID if it matches
 */
export async function handleTabClosed(tabId) {
  try {
    const storedTabId = await getStoredExtensionTabId()
    if (storedTabId === tabId) {
      bgLogger.log(`[ExtTabMgr] Extension tab ${tabId} was closed, clearing stored ID`)
      await clearExtensionTabId()
    }
  } catch (error) {
    bgLogger.error('[ExtTabMgr] Failed to handle tab closure:', error)
  }
}

