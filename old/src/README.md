# Reddit Post Machine - Clean Architecture

This is a re-architected version of the Reddit Post Machine extension following JavaScript best practices and Quasar.js conventions.

## Architecture Overview

The extension is now organized into a clean, modular structure with clear separation of concerns:

```
src/
├── services/           # Background services and network operations
│   └── reef.js        # Background service worker - handles network requests and tab management
├── workers/           # Main worker processes  
│   └── seren-post-machine.js  # Main worker process - orchestrates Reddit operations
├── content/           # Content script coordination
│   ├── reddit-helper.js       # Main content script coordinator
│   └── frappe-bridge.js       # Bridge for Frappe integration
└── sailor/            # Content script level DOM operations
    └── reddit-post-man.js     # Reddit-specific DOM interactions and form filling
```

## File Descriptions

### `services/reef.js` - Background and Network Services
- **Purpose**: Background service worker that handles network requests, tab management, and message routing
- **Key Features**:
  - Message handling between content scripts and background
  - Tab creation and management for Reddit operations
  - Network request coordination
  - Clean logging and error handling
  - Status reporting

### `workers/seren-post-machine.js` - Main Worker Process  
- **Purpose**: Orchestrates the main Reddit posting workflow and business logic
- **Key Features**:
  - Workflow orchestration and state management
  - User status detection (locked accounts, authentication)
  - Navigation coordination
  - Post creation workflow management
  - Configuration management
  - Error handling and recovery

### `content/reddit-helper.js` - Content Script Coordinator
- **Purpose**: Main content script that coordinates between different modules
- **Key Features**:
  - Message handling from background scripts
  - Workflow initiation and coordination
  - Integration between PostMan and SerenPostMachine
  - Request routing for create_post and check_stats operations

### `sailor/reddit-post-man.js` - Content Script Level Operations
- **Purpose**: Handles direct DOM interactions and Reddit-specific operations
- **Key Features**:
  - DOM element selection and manipulation
  - Form filling (title, URL, body text)
  - Reddit UI interaction (tabs, buttons, dropdowns)
  - User profile navigation
  - Post verification and statistics
  - Shadow DOM handling
  - Keyboard and click event simulation

### `content/frappe-bridge.js` - Frappe Integration Bridge
- **Purpose**: Handles communication between Frappe and the Chrome extension
- **Key Features**:
  - Message passing from Frappe to extension
  - Security validation for cross-origin messages
  - Response forwarding back to Frappe
  - Error handling for integration failures

## Key Benefits of New Architecture

### 1. **Separation of Concerns**
- Background services handle network and tab operations
- Content scripts focus on DOM manipulation
- Worker processes manage business logic
- Clear interfaces between components

### 2. **Improved Maintainability**
- Modular design makes code easier to understand and modify
- Clear naming conventions following the specified hierarchy
- Consistent error handling and logging across modules
- TypeScript-ready structure for future enhancement

### 3. **Better Error Handling**
- Centralized logging with consistent formatting
- Graceful error recovery at each layer
- Comprehensive error reporting to background scripts
- Timeout management for async operations

### 4. **Enhanced Testability**
- Each module can be tested independently
- Clear interfaces make mocking easier
- Separation of DOM operations from business logic
- Async/await patterns for better test control

### 5. **Scalability**
- Easy to add new features without affecting existing code
- Plugin-like architecture for extending functionality
- Configuration-driven behavior
- Message-based communication for loose coupling

## Configuration

The extension uses a configuration-driven approach:

```javascript
config: {
  targetSubreddit: 'sphynx',
  defaultTitle: 'Cute sphynx babies capture your heart',
  defaultUrl: 'https://youtube.com/shorts/0xmhrS_VNNY?si=awYc8i5YljycesXq',
  defaultBodyText: '#shorts #sphynx #missmermaid #kitten #cat',
  timeouts: {
    short: 500,
    medium: 1500,
    long: 3000,
    veryLong: 5000
  }
}
```

## Message Flow

1. **Frappe → Extension**: Frappe sends commands via `frappe-bridge.js`
2. **Bridge → Background**: Bridge forwards messages to `reef.js`
3. **Background → Content**: `reef.js` opens tabs and sends messages to `reddit-helper.js`
4. **Content Coordination**: `reddit-helper.js` coordinates between modules
5. **DOM Operations**: `reddit-post-man.js` performs actual Reddit interactions

## Future Enhancements

The clean architecture enables easy implementation of:
- TypeScript conversion for better type safety
- Unit and integration testing
- Additional social media platforms
- Enhanced error recovery mechanisms
- Performance monitoring and analytics
- Configuration management UI
- Plugin system for custom workflows