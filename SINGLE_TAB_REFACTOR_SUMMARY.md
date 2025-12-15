# Single-Tab Pattern Refactoring Summary

## Overview
Refactored the tab management logic in the Reddit Post Machine extension to implement a single-tab pattern for the extension UI. The extension now ensures only one dedicated tab is used for the extension interface, preventing multiple tabs from being opened.

## Changes Made

### 1. New File: `lumi/src-bex/extension-tab-manager.js`
Created a dedicated module for managing the extension's single UI tab with the following functions:

- **`getStoredExtensionTabId()`** - Retrieves the stored extension tab ID from local storage
- **`saveExtensionTabId(tabId)`** - Persists the extension tab ID to local storage
- **`clearExtensionTabId()`** - Clears the stored tab ID when the tab is closed
- **`isTabValid(tabId)`** - Validates if a stored tab ID is still accessible and not discarded
- **`getExtensionPopupUrl()`** - Generates the correct extension popup URL using runtime ID
- **`openOrFocusExtensionTab()`** - Core function implementing the single-tab pattern:
  - Checks if a valid tab exists and focuses it
  - If stored tab is invalid, clears it and creates a new one
  - Creates a new tab only if no valid tab exists
- **`handleTabClosed(tabId)`** - Cleanup handler for when the extension tab is closed

### 2. Updated: `lumi/src-bex/background.js`
- Added imports for `extension-tab-manager.js` functions
- Added `handleOpenExtension` to message handler imports
- Added `OPEN_EXTENSION` case to the message switch statement
- Added tab closure cleanup in `chrome.tabs.onRemoved` listener to call `handleTabClosed()`

### 3. Updated: `lumi/src-bex/message-handlers.js`
- Added import for `openOrFocusExtensionTab` from extension-tab-manager
- Added new `handleOpenExtension()` function that:
  - Calls `openOrFocusExtensionTab()` to manage the single tab
  - Returns success/failure response with tab ID

## How It Works

### Single-Tab Pattern Flow
1. Content script sends `OPEN_EXTENSION` message to background script
2. Background script calls `handleOpenExtension()`
3. Extension tab manager checks for stored tab ID in local storage
4. If valid tab exists → focus and activate it
5. If stored tab is invalid/closed → clear storage and create new tab
6. If no stored tab → create new tab
7. New tab ID is saved to storage for future use
8. When user closes the tab → `handleTabClosed()` clears the stored ID

### Edge Cases Handled
- **Tracked tab closed by user** - Detected via `chrome.tabs.onRemoved` listener
- **Tab ID becomes stale/invalid** - Validated with `isTabValid()` before reuse
- **Browser restart** - Tab ID persists in local storage, but validation catches if tab no longer exists
- **Multiple rapid requests** - Each request validates the stored tab, ensuring consistency

## Storage
- Uses `chrome.storage.local` with key `extensionTabId`
- Persists across browser sessions until tab is closed
- Automatically cleared when extension tab is closed

## Benefits
1. **Single Tab Guarantee** - Only one extension UI tab can exist at a time
2. **Better UX** - Users always return to the same tab instead of creating duplicates
3. **Resource Efficient** - Reduces memory usage by preventing multiple UI instances
4. **Robust** - Handles edge cases like closed tabs and browser restarts
5. **Maintainable** - Centralized tab management logic in dedicated module

## Testing Recommendations
1. Click extension button multiple times - should focus same tab
2. Close extension tab manually - next click should create new tab
3. Restart browser - extension tab should be recreated if needed
4. Check browser console for debug logs with `[ExtTabMgr]` prefix

