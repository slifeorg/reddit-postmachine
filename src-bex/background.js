/**
 * Background script for Reddit Post Machine
 * Handles extension lifecycle and communication between components
 */

// State management for automation
import { bexBackground } from 'quasar/wrappers'

const tabStates = {}

const SM_STEPS = {
  IDLE: 'IDLE',
  NAVIGATING_PROFILE: 'NAVIGATING_PROFILE',
  NAVIGATING_POSTS: 'NAVIGATING_POSTS',
  COLLECTING_POSTS: 'COLLECTING_POSTS',
  DELETING_POST: 'DELETING_POST',
  POSTING: 'POSTING'
}

const CHECK_INTERVAL = 121000;
let checkIntervalId = null; 
// Post data service with real API integration
class PostDataService {
  static async generatePost(agentName) {
    const maxRetries = 3
    const retryDelay = 1000 // 1 second base delay
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[PostDataService] Generating post for agent: ${agentName} (attempt ${attempt}/${maxRetries})`)
        
        // Get API configuration from storage
        const storageResult = await chrome.storage.sync.get(['apiConfig'])
        const apiConfig = storageResult.apiConfig || {
          endpoint: 'https://dev.slife.guru/api/method/reddit_postmachine.reddit_postmachine.doctype.subreddit_template.subreddit_template.generate_post_for_agent',
          token: '8fbbf0a7c626e18:e8e4a08a650a5fb'
        }
        
        const response = await fetch(apiConfig.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `token ${apiConfig.token}`
          },
          body: JSON.stringify({
            agent_name: agentName
          })
        })
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('[PostDataService] Generated post from API:', data)
        
        // Handle new API response format with post_name
        if (data && data.message && data.message.status === 'success' && data.message.post_name) {
          console.log('[PostDataService] Received post_name, fetching full post data:', data.message.post_name)
          
          // Second API call to get full post data using Frappe REST API
          const postName = data.message.post_name
          const frappeEndpoint = `https://dev.slife.guru/api/resource/Reddit%20Post/${postName}`
          
          const frappeResponse = await fetch(frappeEndpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `token ${apiConfig.token}`
            }
          })
          
          if (!frappeResponse.ok) {
            throw new Error(`Frappe API request failed: ${frappeResponse.status} ${frappeResponse.statusText}`)
          }
          
          const frappeData = await frappeResponse.json()
          console.log('[PostDataService] Fetched full post data from Frappe:', frappeData)
          
          // Extract post data from Frappe response
          if (frappeData && frappeData.data) {
            const postData = frappeData.data
            return {
              title: postData.title || 'Generated Post',
              body: postData.body_text || postData.content || postData.body || '',
              url: postData.url_to_share || postData.url || '',
              subreddit: postData.subreddit_name || postData.subreddit || 'sphynx',
              post_type: postData.post_type || 'link',
              post_name: postData.name,
              account: postData.account,
              template_used: postData.template_used
            }
          }
        }
        
        // Fallback to legacy response format for backward compatibility
        if (data && data.message && data.message.docs && Array.isArray(data.message.docs) && data.message.docs.length > 0) {
          const apiPost = data.message.docs[0]
          return {
            title: apiPost.title || 'Generated Post',
            body: apiPost.content || apiPost.body || '',
            url: apiPost.url || '',
            subreddit: apiPost.subreddit || 'sphynx',
            post_type: apiPost.post_type || 'link'
          }
        }
        
        throw new Error('Invalid API response structure or no post data returned')
        
      } catch (error) {
        console.error(`[PostDataService] API call failed (attempt ${attempt}/${maxRetries}):`, error)
        
        if (attempt === maxRetries) {
          // Final attempt failed, use fallback
          console.log('[PostDataService] All API attempts failed, using fallback dummy post')
          return this.generateDummyPost()
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1)))
      }
    }
  }
  
  static async shouldCreatePost(postsData) {
    // Create decision report for logging and storage
    const decisionReport = {
      timestamp: new Date().toISOString(),
      totalPosts: postsData?.posts?.length || 0,
      lastPostAge: null,
      lastPostStatus: 'unknown',
      decision: 'no_create',
      reason: 'no_posts',
      lastPost: postsData?.lastPost || null
    }

    console.log('=== AUTO-FLOW DECISION ANALYSIS ===')
    console.log(`[PostDataService] Analyzing ${decisionReport.totalPosts} posts for auto-flow decision`)
    
    // Analyze posts to determine if new post is needed
    if (!postsData || !postsData.posts || postsData.posts.length === 0) {
      console.log('[PostDataService] ❌ DECISION: No posts found, should create new post')
      decisionReport.decision = 'create'
      decisionReport.reason = 'no_posts'
      this.saveDecisionReport(decisionReport)
      return { shouldCreate: true, reason: 'no_posts', decisionReport }
    }
    
    const lastPost = postsData.posts[0] // Most recent post
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Calculate post age for reporting
    const postDate = new Date(lastPost.timestamp)
    const ageInHours = (now - postDate) / (1000 * 60 * 60)
    decisionReport.lastPostAge = Math.round(ageInHours * 10) / 10 // Round to 1 decimal
    
    console.log(`[PostDataService] 📊 Last post details:`)
    console.log(`   - Title: "${lastPost.title || 'No title'}"`)
    console.log(`   - Age: ${decisionReport.lastPostAge} hours ago`)
    console.log(`   - URL: ${lastPost.postUrl || 'No URL'}`)
    console.log(`   - Status: Removed=${lastPost.isRemoved}, Blocked=${lastPost.isBlocked}, Deleted=${lastPost.deleted}`)
    console.log(`   - Score: ${lastPost.scoreValue || 0} | Downvotes: ${lastPost.hasDownvotes || false}`)
    
    // Check if last post has downvotes (highest priority for deletion)
    if (lastPost.hasDownvotes || lastPost.scoreValue < 0) {
      console.log('[PostDataService] 👎 DECISION: Last post has downvotes, should create new post and delete downvoted post')
      decisionReport.decision = 'create_with_delete'
      decisionReport.reason = 'post_downvoted'
      decisionReport.lastPostStatus = lastPost.isRemoved ? 'removed' : lastPost.isBlocked ? 'blocked' : 'downvoted'
      this.saveDecisionReport(decisionReport)
      return { shouldCreate: true, reason: 'post_downvoted', lastPost: lastPost, decisionReport }
    }
    
    // Check if last post is older than one week - if so, DO NOT delete it, just create new post
    if (postDate < oneWeekAgo) {
      console.log('[PostDataService] ⏰ DECISION: Last post is older than one week, should create new post without deletion')
      decisionReport.decision = 'create'
      decisionReport.reason = 'old_post'
      decisionReport.lastPostStatus = lastPost.isRemoved ? 'removed' : lastPost.isBlocked ? 'blocked' : 'active'
      this.saveDecisionReport(decisionReport)
      return { shouldCreate: true, reason: 'old_post', lastPost: lastPost, decisionReport }
    }
    
    // Check if last post is blocked or removed by moderator
    if (lastPost.isBlocked || lastPost.isRemoved || lastPost.deleted) {
      const status = lastPost.isRemoved ? 'removed' : lastPost.isBlocked ? 'blocked' : 'deleted'
      
      // Check if the removed/blocked post is older than one week - if so, preserve it
      if (postDate < oneWeekAgo) {
        console.log(`[PostDataService] 🚫 DECISION: Last post is ${status} by moderator but older than one week, should create new post without deletion`)
        decisionReport.decision = 'create'
        decisionReport.reason = 'old_post'
        decisionReport.lastPostStatus = status
        this.saveDecisionReport(decisionReport)
        return { shouldCreate: true, reason: 'old_post', lastPost: lastPost, decisionReport }
      }
      
      console.log(`[PostDataService] 🚫 DECISION: Last post is ${status} by moderator, should create new post and delete it`)
      decisionReport.decision = 'create_with_delete'
      decisionReport.reason = 'post_blocked'
      decisionReport.lastPostStatus = status
      this.saveDecisionReport(decisionReport)
      return { shouldCreate: true, reason: 'post_blocked', lastPost: lastPost, decisionReport }
    }
    
    console.log('[PostDataService] ✅ DECISION: Last post is recent and active, no new post needed')
    decisionReport.decision = 'no_create'
    decisionReport.reason = 'recent_post'
    decisionReport.lastPostStatus = 'active'
    this.saveDecisionReport(decisionReport)
    return { shouldCreate: false, reason: 'recent_post', decisionReport }
  }

  // Save decision report to storage for popup visibility
  static async saveDecisionReport(decisionReport) {
    try {
      await chrome.storage.local.set({ 
        lastDecisionReport: decisionReport,
        lastDecisionTimestamp: decisionReport.timestamp
      })
      console.log('[PostDataService] 💾 Decision report saved to storage:', decisionReport.decision)
    } catch (error) {
      console.error('[PostDataService] Failed to save decision report:', error)
    }
  }
  
  // Keep dummy method as fallback
  static generateDummyPost() {
    const posts = [
      {
        title: "Amazing sphynx kittens are ready to steal your heart! 🐱",
        body: "#shorts #sphynx #missmermaid #kitten #cat #adorable",
        url: "https://youtube.com/shorts/0xmhrS_VNNY?si=awYc8i5YljycesXq",
        subreddit: "sphynx",
        post_type: "link"
      },
      {
        title: "Cute sphynx babies capture your heart",
        body: "#shorts #sphynx #missmermaid #kitten #cat #love",
        url: "https://youtube.com/shorts/dQw4w9WgXcQ?si=randomstring",
        subreddit: "sphynx", 
        post_type: "link"
      },
      {
        title: "Hairless beauties showing their playful side! 🎭",
        body: "#shorts #sphynx #missmermaid #playful #cats #funny",
        url: "https://youtube.com/shorts/playful123?si=example",
        subreddit: "sphynx",
        post_type: "link"
      }
    ]
    
    const randomPost = posts[Math.floor(Math.random() * posts.length)]
    console.log('[PostDataService] Generated dummy post:', randomPost.title)
    return randomPost
  }
}

// Real API server call
async function fetchNextPost() {
  console.log('[BG] Checking for new posts to create (API service)...');
  
  try {
    // Get stored username to use as agent name
    const syncResult = await chrome.storage.sync.get(['redditUser'])
    const localResult = await chrome.storage.local.get(['redditUser'])
    const redditUser = syncResult.redditUser || localResult.redditUser
    
    if (!redditUser || !redditUser.seren_name) {
      console.log('[BG] No username found, skipping API call')
      return null
    }
    
    const agentName = redditUser.seren_name
    console.log(`[BG] Using agent name: ${agentName}`)
    
    // Check if we should create a post
    if (await PostDataService.shouldCreatePost()) {
      const postData = await PostDataService.generatePost(agentName)
      console.log('[BG] API service says: CREATE POST')
      return postData
    }
    
    console.log('[BG] API service says: NO POST NEEDED')
    return null
    
  } catch (error) {
    console.error('[BG] Error in fetchNextPost:', error)
    return null
  }
}

// Track tabs that have been processed for auto-start automation
const processedTabs = new Set();

/**
 * Initialize automation for a given tab.
 * Sets up the state machine and triggers navigation to the user's profile.
 */
function startAutomationForTab(tabId, userName) {
  console.log(`[BG] Starting automation for tab ${tabId} with user ${userName}`);
  
  // Clear any existing interval to prevent duplicates
  if (checkIntervalId) clearInterval(checkIntervalId);
  
  // Start the periodic check loop
  checkIntervalId = setInterval(() => {
      triggerPeriodicCheck(tabId, userName);
  }, CHECK_INTERVAL);

  // Trigger first check immediately if not already busy
  triggerPeriodicCheck(tabId, userName);
}

async function triggerPeriodicCheck(tabId, userName) {
    const currentState = tabStates[tabId];
    
    // Lock mechanism: If we are POSTING, do not interrupt
    if (currentState && currentState.status === SM_STEPS.POSTING) {
        console.log('[BG] Skipping periodic check - Posting in progress (Locked)');
        return;
    }
    
    // If we are already doing a check (navigating/collecting), also probably shouldn't interrupt
    // unless it's stuck. For now, assume simple lock: if *any* state exists, skip.
    if (currentState) {
        console.log(`[BG] Skipping periodic check - Busy in state: ${currentState.status}`);
        // Optional: specific timeout/stuck logic could go here
        return;
    }

    console.log(`[BG] Triggering periodic post check for ${userName}`);
    
    // Clean username for URL construction
    const cleanUsername = userName.replace('u/', '');
    const directPostsUrl = `https://www.reddit.com/user/${cleanUsername}/submitted/`;
    
    console.log(`[BG] 🚀 Using direct URL navigation optimization: ${directPostsUrl}`);
    
    // Initialize state for this check cycle - skip to COLLECTING_POSTS since we're going directly to posts
    tabStates[tabId] = {
        status: SM_STEPS.COLLECTING_POSTS, // Skip navigation steps, go directly to collection
        userName: userName,
        stepStartTime: Date.now(),
        advancedToNavigatingPosts: true, // Mark as already completed
        advancedToCollecting: false,
        usedDirectNavigation: true // Flag to indicate direct navigation was used
    };
    
    // Navigate directly to posts page
    chrome.tabs.update(tabId, { url: directPostsUrl }).catch(err => {
        console.error('[BG] Failed to navigate directly to posts URL:', err);
        logToTab(tabId, `Error navigating to posts URL: ${err.message}`);
        // If direct navigation fails, clear state so we try again next time
        delete tabStates[tabId];
    });
    
    // Add backup listener for tab completion to handle race conditions
    const tabLoadBackupListener = (updatedTabId, changeInfo, tab) => {
        if (updatedTabId === tabId && changeInfo.status === 'complete' && tab.url.includes('/submitted')) {
            const state = tabStates[tabId];
            if (state && state.usedDirectNavigation && !state.advancedToCollecting) {
                console.log('[BG] Backup trigger: Tab loaded, sending GET_POSTS command');
                state.advancedToCollecting = true;
                logToTab(tabId, 'Backup trigger: Tab fully loaded, starting post collection.');
                
                setTimeout(() => {
                    chrome.tabs.sendMessage(tabId, {
                        type: 'REDDIT_POST_MACHINE_GET_POSTS',
                        payload: { userName: state.userName }
                    }).catch(err => console.error('[BG] Backup trigger failed to send GET_POSTS:', err));
                }, 1000);
                
                // Remove this backup listener
                chrome.tabs.onUpdated.removeListener(tabLoadBackupListener);
            }
        }
    };
    
    chrome.tabs.onUpdated.addListener(tabLoadBackupListener);
    
    // Clean up backup listener after 30 seconds to prevent memory leaks
    setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(tabLoadBackupListener);
    }, 30000);
}


function logToTab(tabId, message) {
    console.log(`[BG Log -> Tab ${tabId}] ${message}`);
    if (tabId) {
        chrome.tabs.sendMessage(tabId, {
            type: 'BG_LOG',
            message: message
        }).catch(() => {});
    }
}

// Kill current Reddit tab and create new clean tab for post submission
async function createCleanPostTab(userName, postData) {
    try {
        console.log('[BG] Creating clean post tab - closing current Reddit tabs first')
        
        // Get current active tab
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })
        
        // Close current Reddit tab if it exists
        if (currentTab && (currentTab.url.includes('reddit.com') || currentTab.url.includes('old.reddit.com'))) {
            console.log(`[BG] Closing current Reddit tab ${currentTab.id}`)
            await chrome.tabs.remove(currentTab.id)
        }
        
        // Clean subreddit name to remove existing "r/" prefix if present
        const cleanSubreddit = (postData.subreddit || 'test').replace(/^r\//i, '')
        const submitUrl = `https://www.reddit.com/r/${cleanSubreddit}/submit`
        console.log(`[BG] Creating new clean tab at ${submitUrl}`)
        
        const newTab = await chrome.tabs.create({
            url: submitUrl,
            active: true
        })
        
        // Set up state for the new tab
        tabStates[newTab.id] = {
            status: SM_STEPS.POSTING,
            userName: userName,
            postData: postData,
            stepStartTime: Date.now(),
            isPostTab: true,
            isCleanTab: true // Flag to indicate this is a fresh clean tab
        }
        
        // Wait for tab to load then send post data
        const tabLoadListener = (tabId, changeInfo, tab) => {
            if (tabId === newTab.id && changeInfo.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(tabLoadListener)
                
                console.log(`[BG] Clean post tab ${newTab.id} loaded, URL: ${tab.url}`)
                
                // Verify we're on a submit page before sending the message
                if (!tab.url || !tab.url.includes('/submit')) {
                    console.error(`[BG] Tab ${newTab.id} is not on submit page: ${tab.url}`)
                    delete tabStates[newTab.id]
                    return
                }
                
                setTimeout(() => {
                    console.log(`[BG] Sending START_POST_CREATION to tab ${newTab.id}`)
                    chrome.tabs.sendMessage(newTab.id, {
                        type: 'START_POST_CREATION',
                        userName: userName,
                        postData: postData
                    }).catch(err => {
                        console.error(`[BG] Failed to send post data to clean tab ${newTab.id}:`, err)
                        delete tabStates[newTab.id]
                    })
                }, 2000)
            }
        }
        
        chrome.tabs.onUpdated.addListener(tabLoadListener)
        return newTab.id
        
    } catch (error) {
        console.error('[BG] Failed to create clean post tab:', error)
        throw error
    }
}

// Helper function to proceed with post creation
async function proceedWithPostCreation(userName, monitoringTabId) {
    console.log('[BG] Proceeding with post creation');
    
    // Check if post creation is already in progress for this monitoring tab
    const state = tabStates[monitoringTabId];
    if (state && state.postCreationInProgress) {
        console.log('[BG] Post creation already in progress, skipping duplicate call');
        return;
    }
    
    // Set lock flag to prevent duplicate calls
    if (state) {
        state.postCreationInProgress = true;
    }
    
    try {
        // Generate new post data
        const newPostData = await fetchNextPost();
        
        if (newPostData) {
            console.log('[BG] Creating new post tab for fresh post');
            
            // Create new tab for post creation with proper isolation
            createCleanPostTab(userName, newPostData).then(newTabId => {
                console.log(`[BG] Created new post tab ${newTabId} for ${userName}`);
                // Clear the original monitoring tab state
                delete tabStates[monitoringTabId];
            }).catch(err => {
                console.error('[BG] Failed to create post tab:', err);
                delete tabStates[monitoringTabId];
            });
        } else {
            console.log('[BG] Failed to generate new post data');
            delete tabStates[monitoringTabId];
        }
    } catch (error) {
        console.error('[BG] Error in proceedWithPostCreation:', error);
        delete tabStates[monitoringTabId];
    }
}

// Create or reuse a tab for post submission
async function createOrReusePostTab(userName, postData) {
    console.log(`[BG] Creating/reusing post tab for ${userName} with data:`, postData)
    
    // Determine the correct subreddit URL and clean subreddit name
    const cleanSubreddit = (postData.subreddit || 'sphynx').replace(/^r\//i, '')
    const submitUrl = `https://www.reddit.com/r/${cleanSubreddit}/submit`
    
    try {
        // First, try to find an existing reddit.com tab to reuse
        const existingTabs = await chrome.tabs.query({ url: '*://*.reddit.com/*' })
        
        let targetTab
        
        if (existingTabs.length > 0) {
            // Filter out tabs that are actively being used by automation or have form data
            const reusableTabs = existingTabs.filter(tab => {
                // Skip tabs with active automation state
                const state = tabStates[tab.id]
                if (state && state.status !== SM_STEPS.IDLE) {
                    console.log(`[BG] Skipping tab ${tab.id} - active automation state: ${state.status}`)
                    return false
                }
                
                // Skip tabs already on submit pages (likely have form data)
                if (tab.url && tab.url.includes('/submit')) {
                    console.log(`[BG] Skipping tab ${tab.id} - already on submit page`)
                    return false
                }
                
                return true
            })
            
            if (reusableTabs.length > 0) {
                // Prefer an inactive/background tab to avoid disrupting user
                const inactiveTab = reusableTabs.find(tab => !tab.active)
                targetTab = inactiveTab || reusableTabs[0] // fallback to first available
                
                console.log(`[BG] Reusing existing tab ${targetTab.id} for post submission`)
                
                // Update the existing tab to submit URL
                await chrome.tabs.update(targetTab.id, {
                    url: submitUrl,
                    active: true // Make it active so user can see the post being created
                })
            } else {
                console.log(`[BG] No reusable tabs found, creating new tab`)
            }
        }
        
        if (!targetTab) {
            // No existing reddit.com tabs or none suitable for reuse, create a new one
            console.log(`[BG] Creating new tab for post submission`)
            targetTab = await chrome.tabs.create({
                url: submitUrl,
                active: true
            })
        }
        
        console.log(`[BG] Using tab ${targetTab.id} at ${submitUrl}`)
        
        // Set up state for the tab with POSTING status
        tabStates[targetTab.id] = {
            status: SM_STEPS.POSTING,
            userName: userName,
            postData: postData,
            stepStartTime: Date.now(),
            isPostTab: true // Flag to identify post creation tabs
        }
        
        // Wait for tab to load then send post data
        const tabLoadListener = (tabId, changeInfo, tab) => {
            if (tabId === targetTab.id && changeInfo.status === 'complete') {
                // Remove this specific listener
                chrome.tabs.onUpdated.removeListener(tabLoadListener)
                
                console.log(`[BG] Post tab ${targetTab.id} loaded, URL: ${tab.url}`)
                
                // Verify we're on a submit page before sending the message
                if (!tab.url || !tab.url.includes('/submit')) {
                    console.error(`[BG] Tab ${targetTab.id} is not on submit page: ${tab.url}`)
                    delete tabStates[targetTab.id]
                    return
                }
                
                // Send post data to content script
                setTimeout(() => {
                    console.log(`[BG] Sending START_POST_CREATION to tab ${targetTab.id}`)
                    chrome.tabs.sendMessage(targetTab.id, {
                        type: 'START_POST_CREATION',
                        userName: userName,
                        postData: postData
                    }).catch(err => {
                        console.error(`[BG] Failed to send post data to tab ${targetTab.id}:`, err)
                        // Clean up failed tab
                        delete tabStates[targetTab.id]
                    })
                }, 2000) // Give content script time to initialize
            }
        }
        
        // Listen for tab load
        chrome.tabs.onUpdated.addListener(tabLoadListener)
        
        // Note: Removed auto-close timeout to keep tab open for manual interaction
        
        return targetTab.id
        
    } catch (error) {
        console.error('[BG] Failed to create/reuse post tab:', error)
        throw error
    }
}

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Reddit Post Machine extension installed')
    
    // Set default settings
    chrome.storage.sync.set({
      settings: {
        enableNotifications: true,
        autoSave: true,
        theme: 'auto',
        reddit: {
          username: '',
          defaultSubreddits: '',
          enableAnalytics: true
        },
        advanced: {
          apiEndpoint: 'https://oauth.reddit.com',
          timeout: 30000,
          debugMode: false
        }
      },
      // Set default auto-run settings (all disabled to prevent tab creation issues)
      autoRunSettings: {
        profileDetection: false,
        postSubmission: false
      }
    })
  } else if (details.reason === 'update') {
    console.log('Reddit Post Machine extension updated')
    
    // Ensure auto-run settings exist on update (for existing installations)
    chrome.storage.sync.get(['autoRunSettings'], (result) => {
      if (!result.autoRunSettings) {
        chrome.storage.sync.set({
          autoRunSettings: {
            profileDetection: false,
            postSubmission: false
          }
        })
        console.log('Added default auto-run settings on update')
      }
    })
  }
})

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const senderTabId = sender.tab ? sender.tab.id : null
  console.log('Background received message:', message.type, senderTabId ? `from tab ${senderTabId}` : 'from popup')
  
  switch (message.type) {
    case 'GET_REDDIT_INFO':
      handleGetRedditInfo(sendResponse)
      break
      
    case 'CREATE_POST':
      handleCreatePost(message.data, sendResponse)
      return true // Async response
      
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
      // Started from popup usually
      handleCheckUserStatus(message.userName, sendResponse)
      return true // Async response for popup
      
    case 'CREATE_POST_FROM_POPUP':
      // Manual post creation from popup
      handleCreatePostFromPopup(message.userName, sendResponse)
      return true // Async response for popup
        
    case 'CONTENT_SCRIPT_READY':
      handleContentScriptReady(senderTabId, message.url);
      sendResponse({ received: true });
      break;

    case 'URL_CHANGED':
      if (senderTabId) {
          console.log(`URL Changed in tab ${senderTabId}: ${message.url}`);
          const state = tabStates[senderTabId];
          if (state) {
              checkAndAdvanceState(senderTabId, state, message.url);
          }
      }
      sendResponse({ received: true });
      break;

    case 'ACTION_COMPLETED':
      if (senderTabId) {
        console.log(`[BG] Received ACTION_COMPLETED from tab ${senderTabId}: ${message.action}`);
        handleActionCompleted(senderTabId, message.action, message.success, message.data)
      } else {
          console.warn('[BG] Received ACTION_COMPLETED but no senderTabId found.');
      }
      sendResponse({ received: true })
      break
      
    case 'USER_STATUS_SAVED':
      handleUserStatusSaved(message.data, sendResponse)
      break
      
    case 'CLOSE_CURRENT_TAB':
      handleCloseCurrentTab(senderTabId, sendResponse)
      break
      
    case 'PROFILE_DATA_STORED':
      handleProfileDataStored(message.username, message.postsCount, sendResponse)
      break
      
    case 'TOGGLE_AUTO_RUN':
      handleToggleAutoRun(message.scriptType, message.enabled, sendResponse)
      break
      
    case 'TRIGGER_SCRIPT_MANUAL':
      handleTriggerScriptManual(message.scriptType, senderTabId, sendResponse)
      break
      
    case 'CREATE_POST_TAB':
      handleCreatePostTab(message.postData, sendResponse)
      break
      
    case 'GET_TAB_STATE':
      handleGetTabState(senderTabId, sendResponse)
      break
      
    case 'REUSE_REDDIT_TAB':
      handleReuseRedditTab(message.url, message.action, sendResponse)
      break

  }
  return true
})

function handleContentScriptReady(tabId, url) {
    const state = tabStates[tabId];
    if (state) {
        console.log(`Content script ready in tab ${tabId} (State: ${state.status}). URL: ${url}`);
        // Trigger logic immediately instead of waiting for 'complete' status
        checkAndAdvanceState(tabId, state, url);
    }
}

function checkAndAdvanceState(tabId, state, url) {
    console.log(`[Auto Check] Checking state for tab ${tabId}. Status: ${state.status}, URL: ${url}`);
    
    if (state.status === SM_STEPS.NAVIGATING_PROFILE) {
        if (url.includes(state.userName.replace('u/', ''))) {
             // Only advance if we haven't already
             if (!state.advancedToNavigatingPosts) {
                 state.advancedToNavigatingPosts = true;
                 logToTab(tabId, 'Fast-track: Landed on profile page. Advancing to NAVIGATING_POSTS.');
                 state.status = SM_STEPS.NAVIGATING_POSTS;
                 
                 chrome.tabs.sendMessage(tabId, {
                     type: 'REDDIT_POST_MACHINE_NAVIGATE_POSTS',
                     payload: { userName: state.userName }
                 }).catch(err => {
                     console.error('[Auto Check] Failed to send NAVIGATE_POSTS:', err);
                     logToTab(tabId, `Error sending NAVIGATE_POSTS: ${err.message}`);
                 });
             }
        }
    } else if (state.status === SM_STEPS.NAVIGATING_POSTS) {
        if (url.includes('/submitted')) {
             // Only advance if we haven't already
             if (!state.advancedToCollecting) {
                 state.advancedToCollecting = true;
                 logToTab(tabId, 'Fast-track: Landed on posts page. Advancing to COLLECTING_POSTS.');
                 state.status = SM_STEPS.COLLECTING_POSTS;
                 
                 chrome.tabs.sendMessage(tabId, {
                     type: 'REDDIT_POST_MACHINE_GET_POSTS',
                     payload: { userName: state.userName }
                 }).catch(err => console.error('[Auto Check] Failed to send GET_POSTS:', err));
             }
        }
        // Removed the retry logic here - it was causing duplicate commands
    } else if (state.status === SM_STEPS.COLLECTING_POSTS && state.usedDirectNavigation) {
        // Handle direct navigation flow - send GET_POSTS immediately when /submitted/ page loads
        if (url.includes('/submitted') && !state.advancedToCollecting) {
            state.advancedToCollecting = true;
            logToTab(tabId, 'Direct navigation: Landed on posts page. Starting post collection.');
            
            // Send GET_POSTS command immediately after a short delay to ensure page is ready
            setTimeout(() => {
                chrome.tabs.sendMessage(tabId, {
                    type: 'REDDIT_POST_MACHINE_GET_POSTS',
                    payload: { userName: state.userName }
                }).catch(err => console.error('[Auto Check] Failed to send GET_POSTS for direct navigation:', err));
            }, 2000); // Give page 2 seconds to fully load
        }
    }
}

async function handleActionCompleted(tabId, action, success, data) {
    console.log(`[BG] handleActionCompleted called for tab ${tabId}, action ${action}`);
    
    const state = tabStates[tabId]
    if (!state) {
        // This is expected after GET_POSTS completes - the state was cleared
        console.log(`[BG] State already cleared for tab ${tabId}. Action ${action} was likely the final step.`);
        return
    }

    logToTab(tabId, `Action completed in tab ${tabId}: ${action} (Success: ${success})`)

    if (!success) {
        console.warn(`Action ${action} failed. Aborting automation.`)
        delete tabStates[tabId]
        return
    }

    // Logic to advance state based on completion
    // Use the same flags as checkAndAdvanceState to prevent duplicate commands
    if (action === 'NAVIGATE_PROFILE' && state.status === SM_STEPS.NAVIGATING_PROFILE) {
        // Only advance if we haven't already via fast-track
        if (!state.advancedToNavigatingPosts) {
            state.advancedToNavigatingPosts = true;
            logToTab(tabId, 'Advancing from NAVIGATING_PROFILE to NAVIGATING_POSTS');
            
            state.status = SM_STEPS.NAVIGATING_POSTS
            state.stepStartTime = Date.now()
            
            // Trigger next step
            setTimeout(() => {
                 logToTab(tabId, 'Sending NAVIGATE_POSTS command');
                 chrome.tabs.sendMessage(tabId, {
                    type: 'REDDIT_POST_MACHINE_NAVIGATE_POSTS',
                    payload: { userName: state.userName }
                }).catch(err => console.error(`[State Machine] Error sending NAVIGATE_POSTS:`, err))
            }, 1500)
        } else {
            console.log('[BG] Already advanced to NAVIGATING_POSTS via fast-track. Skipping.');
        }
    } else if (action === 'NAVIGATE_POSTS' && state.status === SM_STEPS.NAVIGATING_POSTS) {
        // Only advance if we haven't already via fast-track
        if (!state.advancedToCollecting) {
            state.advancedToCollecting = true;
            logToTab(tabId, 'Advancing from NAVIGATING_POSTS to COLLECTING_POSTS');
            
            state.status = SM_STEPS.COLLECTING_POSTS
            state.stepStartTime = Date.now()
            
            setTimeout(() => {
                logToTab(tabId, 'Sending GET_POSTS command');
                chrome.tabs.sendMessage(tabId, {
                    type: 'REDDIT_POST_MACHINE_GET_POSTS',
                    payload: { userName: state.userName }
                }).catch(err => console.error(`[State Machine] Error sending GET_POSTS:`, err))
            }, 1500)
        } else {
            console.log('[BG] Already advanced to COLLECTING_POSTS via fast-track. Skipping.');
        }
    } else if (action === 'NAVIGATE_POSTS' && state.status === SM_STEPS.DELETING_POST) {
        console.log('[BG] NAVIGATE_POSTS completed for deletion, now sending DELETE_POST command');
        
        setTimeout(() => {
            logToTab(tabId, 'Sending DELETE_POST command');
            chrome.tabs.sendMessage(tabId, {
                type: 'REDDIT_POST_MACHINE_DELETE_POST',
                payload: { post: state.lastPostToDelete }
            }).catch(err => {
                console.error('[BG] ❌ Failed to send delete command:', err)
                console.log('[BG] ⚠️ FALLBACK: Proceeding with post creation anyway')
                proceedWithPostCreation(state.userName, tabId)
            })
        }, 2000) // Give extra time for posts to load
    } else if (action === 'GET_POSTS') {
        console.log('[BG] 📊 GET_POSTS action received, analyzing for auto-flow decision...');
        
        // Check if this is from state machine flow or direct status check
        if (state && state.status === SM_STEPS.COLLECTING_POSTS) {
            console.log('[BG] State machine flow: Collection complete');
        } else {
            console.log('[BG] Direct status check flow: Running decision analysis');
        }
        
        // Always run decision analysis for GET_POSTS actions
        console.log('[BG] Analyzing posts data:', data);
        
        // Check if we need to make a new post based on post conditions
        PostDataService.shouldCreatePost(data).then(result => {
            console.log('[BG] 🎯 FINAL DECISION RESULT:', {
                shouldCreate: result.shouldCreate,
                reason: result.reason,
                decisionReport: result.decisionReport
            })
            
            if (result.shouldCreate) {
                console.log(`[BG] 🚀 EXECUTING: New post required. Reason: ${result.reason}`)
                
                // If we need to delete the last post first
                if (result.lastPost && (result.reason === 'post_blocked' || result.reason === 'post_downvoted')) {
                    console.log('[BG] 🗑️ STEP 1: Attempting to delete last post before creating new one')
                    
                    // Use the same deletion flow as manual "Delete Last Post" button
                    chrome.tabs.sendMessage(tabId, {
                        type: 'DELETE_LAST_POST',
                        userName: state.userName
                    }).then(response => {
                        console.log('[BG] Delete command sent successfully:', response)
                        // Wait a moment for deletion to complete, then proceed with post creation
                        setTimeout(() => {
                            proceedWithPostCreation(state.userName, tabId)
                        }, 3000)
                    }).catch(err => {
                        console.error('[BG] ❌ Failed to send delete command:', err)
                        console.log('[BG] ⚠️ FALLBACK: Proceeding with post creation anyway')
                        proceedWithPostCreation(state.userName, tabId)
                    })
                } else {
                    console.log('[BG] 📝 STEP 1: No deletion needed, proceeding directly to post creation')
                    // No deletion needed, proceed directly to post creation
                    proceedWithPostCreation(state.userName, tabId)
                }
                
            } else {
                console.log('[BG] ✅ COMPLETE: No new post needed. Clearing state and waiting for next interval.')
                delete tabStates[tabId];
            }
        }).catch(err => {
            console.error('[BG] ❌ ERROR: Error analyzing posts:', err)
            delete tabStates[tabId]
        });
        
        // Result is saved by content script via USER_STATUS_SAVED message
    } else if (action === 'POST_CREATION_COMPLETED') { 
        console.log('[BG] Posting process completed. Closing submit tab and opening reddit.com for status check.');
        delete tabStates[tabId];
        
        // Close the submit tab if it exists (for both success and failure cases)
        try {
            const tab = await chrome.tabs.get(tabId);
            if (tab) {
                await chrome.tabs.remove(tabId);
                console.log(`[BG] Closed submit tab ${tabId}`);
            }
        } catch (error) {
            console.warn(`[BG] Submit tab ${tabId} already closed or not found:`, error);
        }
        
        // Only open reddit.com for status checking if post was successful
        if (message.success) {
            // Open reddit.com and start status checking
            setTimeout(async () => {
                try {
                    const newTab = await chrome.tabs.create({
                        url: 'https://www.reddit.com',
                        active: true
                    });
                    console.log(`[BG] Opened reddit.com tab ${newTab.id} for status checking`);
                    
                    // Wait for tab to complete loading before sending status check
                    const tabLoadListener = (updatedTabId, changeInfo) => {
                        if (updatedTabId === newTab.id && changeInfo.status === 'complete') {
                            chrome.tabs.onUpdated.removeListener(tabLoadListener);
                            clearTimeout(loadTimeout);
                            
                            // Send status check after a short delay for content script to initialize
                            setTimeout(async () => {
                                try {
                                    // Verify tab still exists before sending message
                                    await chrome.tabs.get(newTab.id);
                                    chrome.tabs.sendMessage(newTab.id, {
                                        type: 'CHECK_USER_STATUS',
                                        userName: 'AutoUser'
                                    }).catch(err => {
                                        console.error(`[BG] Failed to start status check on tab ${newTab.id}:`, err);
                                    });
                                } catch (tabError) {
                                    console.warn(`[BG] Tab ${newTab.id} no longer exists, skipping status check`);
                                }
                            }, 1000);
                        }
                    };
                    
                    chrome.tabs.onUpdated.addListener(tabLoadListener);
                    
                    // Add timeout fallback to clean up listener if tab never loads
                    const loadTimeout = setTimeout(() => {
                        chrome.tabs.onUpdated.removeListener(tabLoadListener);
                        console.warn(`[BG] Tab ${newTab.id} load timeout, removing listener`);
                    }, 30000);
                    
                } catch (error) {
                    console.error('[BG] Failed to open reddit.com tab:', error);
                }
            }, 1000);
        } else {
            console.log(`[BG] Post creation failed: ${message.error || 'Unknown error'}. Tab closed without opening status check.`);
        }
    }
}

// Monitor tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Check for Active Automation State Resume logic
  const state = tabStates[tabId];
  
  // 1. SPA & Page Load Handling:
  // If URL changed (SPA) OR status is complete (Page Load), check if we advanced
  if ((changeInfo.url || changeInfo.status === 'complete') && tab.url && tab.url.includes('reddit.com')) {
      if (state) {
          // Check state advancement on any URL change or load
          checkAndAdvanceState(tabId, state, tab.url);
      }
      
      // General page load notification
      if (changeInfo.status === 'complete') {
           chrome.tabs.sendMessage(tabId, {
            type: 'REDDIT_PAGE_LOADED',
            url: tab.url
          }).catch(() => {})
      }
  }

  // 2. Auto-Check Logic (New Automation Trigger) on Page Load
  // DISABLED: This automation was causing automatic tab creation
  // Don't auto-start monitoring on post creation tabs
  // if (changeInfo.status === 'complete' && tab.url && tab.url.includes('reddit.com') && !state && !tab.url.includes('/submit')) {
  //     if (!processedTabs.has(tabId)) {
  //          // Check auto-run settings before starting
   //          const settingsResult = await chrome.storage.sync.get(['autoRunSettings']);
  //          const autoRunSettings = settingsResult.autoRunSettings || { profileDetection: true, postSubmission: true };
  //          
  //          // Only start if profile detection is enabled (this automation does profile navigation)
  //          if (!autoRunSettings.profileDetection) {
  //              console.log(`Skipping auto-start status check - profile detection disabled for tab ${tabId}`);
  //              return;
  //          }
  //          
  //          // Get stored username
  //          const result = await chrome.storage.sync.get(['redditUser']);
  //          const userName = result.redditUser?.seren_name;
  //          
  //          if (userName) {
  //              console.log(`Auto-starting status check for ${userName} on tab ${tabId}`);
  //              processedTabs.add(tabId); // Mark as processed for this session/lifecycle
  //              startAutomationForTab(tabId, userName);
  //          }
  //     }
  // }
})

// Cleanup closed tabs
chrome.tabs.onRemoved.addListener((tabId) => {
    delete tabStates[tabId];
    processedTabs.delete(tabId);
});



// === Standard Handlers ===

// Get Reddit page information
function handleGetRedditInfo(sendResponse) {
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

// Handle post creation
async function handleCreatePost(postData, sendResponse) {
  console.log('Creating post:', postData)
  
  try {
    let postToSubmit
    let redditUser
    
    // Get username from storage for API calls and content script
    const syncResult = await chrome.storage.sync.get(['redditUser'])
    const localResult = await chrome.storage.local.get(['redditUser'])
    redditUser = syncResult.redditUser || localResult.redditUser
    
    if (postData) {
      // Use provided post data
      postToSubmit = postData
    } else {
      // Generate post using API if username is available
      if (redditUser && redditUser.seren_name) {
        console.log(`[BG] Generating post for user: ${redditUser.seren_name}`)
        postToSubmit = await PostDataService.generatePost(redditUser.seren_name)
      } else {
        console.log('[BG] No username found, using dummy post')
        postToSubmit = PostDataService.generateDummyPost()
      }
    }
    
    console.log('[BG] Post data to submit:', postToSubmit)
    
    // Find or create submit tab
    const tabs = await chrome.tabs.query({ url: "*://*.reddit.com/*/submit*" })
    let targetTab
    
    if (tabs.length > 0) {
      targetTab = tabs[0]
      console.log('[BG] Using existing submit tab:', targetTab.id)
    } else {
      // Create new submit tab
      targetTab = await chrome.tabs.create({
        url: 'https://www.reddit.com/submit',
        active: false
      })
      console.log('[BG] Created new submit tab:', targetTab.id)
      
      // Wait for tab to load
      await new Promise(resolve => {
        chrome.tabs.onUpdated.addListener(function tabLoadListener(tabId, changeInfo) {
          if (tabId === targetTab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(tabLoadListener)
            setTimeout(resolve, 2000) // Extra time for content script to load
          }
        })
      })
    }
    
    // Send post data to submit content script
    setTimeout(() => {
      // Get the actual username to send to content script
      const userName = redditUser?.seren_name || 'AutoUser'
      
      chrome.tabs.sendMessage(targetTab.id, {
        type: 'START_POST_CREATION',
        userName: userName,
        postData: postToSubmit
      }).catch(err => {
        console.error(`[BG] Failed to send post data to tab ${targetTab.id}:`, err)
      })
    }, 3000)
    
    sendResponse({
      success: true,
      message: 'Post data sent to submit tab',
      tabId: targetTab.id
    })
    
  } catch (error) {
    console.error('[BG] Failed to create post:', error)
    sendResponse({
      success: false,
      error: error.message
    })
  }
}

// Handle settings save
function handleSaveSettings(settings, sendResponse) {
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

// Handle username storage notification from content script
function handleUsernameStored(username, timestamp, sendResponse) {
  console.log(`Background: Received username storage notification - ${username}`)
  chrome.action.setBadgeText({ text: '✓' })
  chrome.action.setBadgeBackgroundColor({ color: '#4caf50' })
  setTimeout(() => { chrome.action.setBadgeText({ text: '' }) }, 3000)
  sendResponse({ success: true })
}

// Handle request to get stored username
async function handleGetStoredUsername(sendResponse) {
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

// Handle user status saved notification from content script
function handleUserStatusSaved(statusData, sendResponse) {
  console.log(`Background: User status saved - ${statusData.userName}`)
  chrome.action.setBadgeText({ text: '📊' })
  chrome.action.setBadgeBackgroundColor({ color: '#2196f3' })
  setTimeout(() => { chrome.action.setBadgeText({ text: '' }) }, 4000)
  sendResponse({ success: true })
}

// Handle request to get user status
async function handleGetUserStatus(sendResponse) {
  try {
    // First try to get the fresh data from userStatusResult (where content script saves)
    const localResult = await chrome.storage.local.get(['userStatusResult'])
    if (localResult.userStatusResult) {
      sendResponse({ success: true, data: localResult.userStatusResult })
      return
    }
    
    // Fallback to old userStatus key for backward compatibility
    const syncResult = await chrome.storage.sync.get(['userStatus'])
    if (syncResult.userStatus) {
      sendResponse({ success: true, data: syncResult.userStatus })
      return
    }
    const oldLocalResult = await chrome.storage.local.get(['userStatus'])
    if (oldLocalResult.userStatus) {
      sendResponse({ success: true, data: oldLocalResult.userStatus })
      return
    }
    sendResponse({ success: false, error: 'No user status found' })
  } catch (error) {
    sendResponse({ success: false, error: error.message })
  }
}

// Handle manual post creation from popup
async function handleCreatePostFromPopup(userName, sendResponse) {
  console.log(`[BG] Manual post creation requested for ${userName}`)
  
  try {
    // Generate post data using real API
    const postData = await PostDataService.generatePost(userName)
    console.log('[BG] Generated post data for manual creation:', postData)
    
    // Create new clean tab for post creation
    const newTabId = await createCleanPostTab(userName, postData)
    
    sendResponse({ 
      success: true, 
      message: 'Post creation tab opened',
      tabId: newTabId 
    })
    
  } catch (error) {
    console.error('[BG] Failed to create post from popup:', error)
    sendResponse({ 
      success: false, 
      error: error.message 
    })
  }
}

// Handle check user status from popup - triggers auto flow
async function handleCheckUserStatus(userName, sendResponse) {
  console.log(`[BG] User status check requested for ${userName} - starting auto flow`)
  
  try {
    // Get current active tab or create new one for automation
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    
    if (!currentTab) {
      // No active tab, create new one
      console.log('[BG] No active tab found, creating new Reddit tab')
      const newTab = await chrome.tabs.create({
        url: 'https://www.reddit.com/',
        active: true
      })
      
      // Wait for tab to load then start automation
      const tabLoadListener = (tabId, changeInfo, tab) => {
        if (tabId === newTab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(tabLoadListener)
          console.log(`[BG] New tab ${newTab.id} loaded, starting automation`)
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
    
    // Use existing tab
    const tabId = currentTab.id
    console.log(`[BG] Using existing tab ${tabId} for automation`)
    
    // Clean up any existing stuck state for this tab
    const existingState = tabStates[tabId]
    if (existingState) {
      const stateAge = Date.now() - (existingState.stepStartTime || 0)
      const isStuck = stateAge > 30000 // 30 seconds timeout
      
      if (isStuck || existingState.status === SM_STEPS.COLLECTING_POSTS) {
        console.log(`[BG] Cleaning up stuck state for tab ${tabId} (status: ${existingState.status}, age: ${stateAge}ms)`)
        delete tabStates[tabId]
      }
    }
    
    // If not on Reddit, navigate there first
    if (!currentTab.url.includes('reddit.com')) {
      console.log(`[BG] Navigating tab ${tabId} to Reddit`)
      await chrome.tabs.update(tabId, {
        url: 'https://www.reddit.com/',
        active: true
      })
      
      // Wait for navigation to complete
      const tabLoadListener = (tabId, changeInfo, tab) => {
        if (tabId === currentTab.id && changeInfo.status === 'complete' && tab.url.includes('reddit.com')) {
          chrome.tabs.onUpdated.removeListener(tabLoadListener)
          console.log(`[BG] Tab ${tabId} navigated to Reddit, starting automation`)
          startAutomationForTab(tabId, userName)
        }
      }
      chrome.tabs.onUpdated.addListener(tabLoadListener)
    } else {
      // Already on Reddit, start automation immediately
      console.log(`[BG] Tab ${tabId} already on Reddit, starting automation immediately`)
      startAutomationForTab(tabId, userName)
    }
    
    sendResponse({ 
      success: true, 
      message: 'Automation started for user status check',
      tabId: tabId,
      userName: userName
    })
    
  } catch (error) {
    console.error('[BG] Failed to start user status check automation:', error)
    sendResponse({ 
      success: false, 
      error: error.message,
      userName: userName
    })
  }
}


// Handle request to close current tab
async function handleCloseCurrentTab(tabId, sendResponse) {
  console.log(`[BG] Request to close tab ${tabId}`)
  
  try {
    if (tabId) {
      await chrome.tabs.remove(tabId)
      console.log(`[BG] Successfully closed tab ${tabId}`)
      sendResponse({ success: true })
    } else {
      // If no tabId, close the current active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tabs.length > 0) {
        await chrome.tabs.remove(tabs[0].id)
        console.log(`[BG] Successfully closed active tab ${tabs[0].id}`)
        sendResponse({ success: true })
      } else {
        sendResponse({ success: false, error: 'No active tab found' })
      }
    }
  } catch (error) {
    console.error('[BG] Failed to close tab:', error)
    sendResponse({ success: false, error: error.message })
  }
}

// Handle profile data stored notification
function handleProfileDataStored(username, postsCount, sendResponse) {
  console.log(`[BG] Profile data stored for ${username} with ${postsCount} posts`)
  chrome.action.setBadgeText({ text: '👤' })
  chrome.action.setBadgeBackgroundColor({ color: '#4caf50' })
  setTimeout(() => { chrome.action.setBadgeText({ text: '' }) }, 3000)
  sendResponse({ success: true })
}

// Handle toggle auto-run settings
async function handleToggleAutoRun(scriptType, enabled, sendResponse) {
  console.log(`[BG] Toggling auto-run for ${scriptType}: ${enabled}`)
  
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
    console.log('[BG] Auto-run settings updated:', settings)
    
    sendResponse({ success: true, settings })
  } catch (error) {
    console.error('[BG] Failed to toggle auto-run:', error)
    sendResponse({ success: false, error: error.message })
  }
}

// Handle manual script trigger from popup
async function handleTriggerScriptManual(scriptType, tabId, sendResponse) {
  console.log(`[BG] Manual trigger for ${scriptType} on tab ${tabId}`)
  
  try {
    if (scriptType === 'profile') {
      // For profile script, still use content script approach
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
      // For post script, create new tab directly
      console.log('[BG] Creating new post tab for manual trigger')
      
      // Get stored username
      const userResult = await chrome.storage.sync.get(['redditUser'])
      const userName = userResult.redditUser?.seren_name || 'User'
      
      // Generate default post data for manual trigger
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
    console.error('[BG] Failed to trigger manual script:', error)
    sendResponse({ success: false, error: error.message })
  }
}

// Handle create post tab request from content script
async function handleCreatePostTab(postData, sendResponse) {
  console.log('[BG] Creating new post tab from content script request')
  
  try {
    // Get stored username for the tab
    const syncResult = await chrome.storage.sync.get(['redditUser'])
    const localResult = await chrome.storage.local.get(['redditUser'])
    const redditUser = syncResult.redditUser || localResult.redditUser
    const userName = redditUser?.seren_name || 'User'
    
    // Generate fresh post data using API instead of using provided dummy data
    let freshPostData
    if (redditUser && redditUser.seren_name) {
      console.log(`[BG] Generating fresh post data for user: ${redditUser.seren_name}`)
      freshPostData = await PostDataService.generatePost(redditUser.seren_name)
    } else {
      console.log('[BG] No username found, using dummy post data')
      freshPostData = PostDataService.generateDummyPost()
    }
    
    console.log('[BG] Using fresh API-generated post data:', freshPostData)
    
    // Use clean tab approach for post creation with fresh data
    const newTabId = await createCleanPostTab(userName, freshPostData)
    
    sendResponse({ 
      success: true, 
      message: 'Post creation tab opened',
      tabId: newTabId 
    })
    
  } catch (error) {
    console.error('[BG] Failed to create post tab from content script:', error)
    sendResponse({ 
      success: false, 
      error: error.message 
    })
  }
}

// Handle get tab state request from content script
async function handleGetTabState(tabId, sendResponse) {
  console.log(`[BG] Getting tab state for tab ${tabId}`)
  
  try {
    const state = tabStates[tabId]
    const isBackgroundPostTab = state && state.isPostTab
    
    sendResponse({ 
      success: true, 
      isBackgroundPostTab: isBackgroundPostTab,
      state: state
    })
  } catch (error) {
    console.error('[BG] Failed to get tab state:', error)
    sendResponse({ success: false, error: error.message })
  }
}

// Handle reuse reddit tab request from popup
async function handleReuseRedditTab(targetUrl, action, sendResponse) {
  console.log(`[BG] Reusing reddit tab for action: ${action}`)
  
  try {
    // Try to find an existing reddit.com tab to reuse
    const existingTabs = await chrome.tabs.query({ url: '*://*.reddit.com/*' })
    
    let targetTab
    
    if (existingTabs.length > 0) {
      // Prefer an inactive/background tab to avoid disrupting user
      const inactiveTab = existingTabs.find(tab => !tab.active)
      targetTab = inactiveTab || existingTabs[0]
      
      console.log(`[BG] Reusing existing tab ${targetTab.id} for ${action}`)
      
      // Update the existing tab to target URL
      await chrome.tabs.update(targetTab.id, {
        url: targetUrl,
        active: true
      })
    } else {
      // No existing reddit.com tabs, create a new one
      console.log(`[BG] No existing reddit.com tabs found, creating new tab for ${action}`)
      targetTab = await chrome.tabs.create({
        url: targetUrl,
        active: true
      })
    }
    
    // Wait for tab to load then send action message
    const tabLoadListener = (tabId, changeInfo, tab) => {
      if (tabId === targetTab.id && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(tabLoadListener)
        
        console.log(`[BG] Tab ${targetTab.id} loaded, sending action: ${action}`)
        
        setTimeout(async () => {
          try {
            // Validate tab still exists before sending message
            const tab = await chrome.tabs.get(targetTab.id)
            if (!tab) {
              console.error(`[BG] ❌ Tab ${targetTab.id} no longer exists`)
              return
            }
            
            console.log(`[BG] 📤 Sending action ${action.type} to tab ${targetTab.id}`)
            const response = await chrome.tabs.sendMessage(targetTab.id, action)
            console.log(`[BG] ✅ Action sent successfully to tab ${targetTab.id}`)
          } catch (err) {
            console.error(`[BG] ❌ Failed to send action to tab ${targetTab.id}:`, err)
            
            // Check if tab was closed or content script not injected
            if (err.message.includes('Receiving end does not exist')) {
              console.log(`[BG] 🔧 Tab ${targetTab.id} exists but content script not ready - this may need retry`)
            } else if (err.message.includes('No tab with id')) {
              console.log(`[BG] 🔧 Tab ${targetTab.id} was closed during operation`)
            } else if (err.message.includes('message channel closed')) {
              console.log(`[BG] 🔧 Tab ${targetTab.id} content script was closed/unloaded during operation - continuing anyway`)
            } else {
              console.log(`[BG] 🔧 Other tab communication error: ${err.message}`)
            }
            
            // Don't throw the error - let the operation continue
            console.log(`[BG] ⚠️ Continuing with operation despite tab communication failure`)
          }
        }, 2000)
      }
    }
    
    chrome.tabs.onUpdated.addListener(tabLoadListener)
    
    sendResponse({ 
      success: true, 
      message: `Reddit tab reused/created for ${action}`,
      tabId: targetTab.id 
    })
  } catch (error) {
    console.error('[BG] Failed to reuse reddit tab:', error)
    sendResponse({ success: false, error: error.message })
  }
}

// Export default function for Quasar bridge compatibility
export default bexBackground((bridge) => {
  console.log('Background script bridge initialized', bridge)
})