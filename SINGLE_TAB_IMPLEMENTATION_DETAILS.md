# Single-Tab Implementation Details

## Architecture

### Module: extension-tab-manager.js
Provides a clean API for managing the extension's single UI tab:

```javascript
// Core function - implements the single-tab pattern
openOrFocusExtensionTab()
  ├─ getStoredExtensionTabId() - retrieve from storage
  ├─ isTabValid(tabId) - validate tab still exists
  ├─ chrome.tabs.update() - focus existing tab
  ├─ clearExtensionTabId() - clear invalid stored ID
  ├─ chrome.tabs.create() - create new tab if needed
  └─ saveExtensionTabId() - persist new tab ID
```

### Storage Key
- **Key**: `extensionTabId`
- **Storage Type**: `chrome.storage.local`
- **Value**: Integer tab ID (e.g., 42)
- **Persistence**: Survives browser restart until tab is closed

## Integration Points

### 1. Content Script → Background Script
```javascript
// my-content-script.js
chrome.runtime.sendMessage({
  type: 'OPEN_EXTENSION',
  source: 'content-script'
})
```

### 2. Background Script Message Handler
```javascript
// background.js
case 'OPEN_EXTENSION':
  handleOpenExtension(sendResponse)
  return true
```

### 3. Message Handler
```javascript
// message-handlers.js
export async function handleOpenExtension(sendResponse) {
  const tabId = await openOrFocusExtensionTab()
  sendResponse({ success: true, tabId })
}
```

### 4. Tab Cleanup
```javascript
// background.js
chrome.tabs.onRemoved.addListener((tabId) => {
  handleTabClosed(tabId).catch(() => {})
})
```

## Validation Logic

### Tab Validity Check
A tab is considered valid if:
1. Tab ID exists in storage
2. `chrome.tabs.get(tabId)` succeeds
3. Tab is not discarded (`!tab.discarded`)

### Failure Scenarios Handled
- Tab closed by user → detected by onRemoved listener
- Tab discarded by browser → detected by isTabValid()
- Browser restart → stored ID persists but validation catches missing tab
- Extension disabled/re-enabled → stored ID cleared on first use

## Debug Logging
All operations log with `[ExtTabMgr]` prefix:
```
[ExtTabMgr] Saved extension tab ID: 42
[ExtTabMgr] Focusing existing extension tab 42
[ExtTabMgr] Tab 42 is no longer valid, clearing
[ExtTabMgr] Creating new extension tab
[ExtTabMgr] Created new extension tab 43
[ExtTabMgr] Extension tab 42 was closed, clearing stored ID
```

## Performance Considerations
- Storage operations are async but non-blocking
- Tab validation uses chrome.tabs.get() which is fast
- No polling - event-driven cleanup via onRemoved listener
- Minimal memory overhead - only stores one integer

## Future Enhancements
1. Add metrics tracking for tab reuse vs creation
2. Implement tab recovery on extension update
3. Add user preference for single-tab behavior
4. Support multiple extension tabs per user (configurable)

