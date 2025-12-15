import { statsLogger } from "./logger.js";// Stats Content Script - Handles profile detection and data collection
// Only runs on reddit.com pages (excluding submit pages)

// Shared utility functions
function qs(selector) {
  return document.querySelector(selector)
}

function qsa(selector) {
  return document.querySelectorAll(selector)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function deepQuery(selector, root = document) {
  return root.querySelector(selector)
}

// Storage functions
async function getStoredUsername() {
  try {
    const result = await chrome.storage.sync.get(['redditUser'])
    return result.redditUser || null
  } catch (error) {
    statsLogger.warn('Failed to get stored username:', error)
    return null
  }
}


async function storeRedditProfileData(username, postsData) {
  try {
    statsLogger.log(` Storing profile data for ${username} with ${postsData.length} posts`)

    // Log sample of posts data being stored
    if (postsData.length > 0) {
      statsLogger.log(' Sample post data being stored:', {
        title: postsData[0].title,
        author: postsData[0].author,
        subreddit: postsData[0].subreddit,
        score: postsData[0].score,
        commentCount: postsData[0].commentCount,
        itemState: postsData[0].itemState
      })
    }

    // Store posts data in the format expected by popup for Status report
    const storageData = {
      username: username,
      posts: postsData,
      timestamp: Date.now(),
      totalPosts: postsData.length
    }

    await chrome.storage.local.set({
      latestPostsData: storageData
    })

    // Create derived userStatus from latestPostsData for popup compatibility
    const derivedUserStatus = {
      userName: username,
      currentUser: username,
      storedUser: username,
      isMatch: true,
      lastCheck: Date.now(),
      totalPosts: postsData.length,
      postsCount: postsData.length,
      lastPostText: postsData.length > 0 ? postsData[0].title || 'Recent post' : 'No posts',
      lastPostDate: postsData.length > 0 ? postsData[0].timestamp || Date.now() : null,
      currentUrl: window.location.href,
      timestamp: Date.now(),
      collectingPostsData: false,
      dataFresh: true,
      // Enhanced metadata
      lastPostScore: postsData.length > 0 ? postsData[0].score || 0 : 0,
      lastPostComments: postsData.length > 0 ? postsData[0].commentCount || 0 : 0,
      lastPostSubreddit: postsData.length > 0 ? postsData[0].subreddit || 'unknown' : 'unknown',
      lastPostAuthor: postsData.length > 0 ? postsData[0].author || 'unknown' : 'unknown'
    }

    // Update both userStatus locations to maintain compatibility
    await chrome.storage.local.set({ userStatus: derivedUserStatus })
    await chrome.storage.sync.set({ userStatus: derivedUserStatus })

    statsLogger.log(` Stored profile data for ${username}: ${postsData.length} posts`)
    statsLogger.log(` Updated derived userStatus with enhanced metadata`)
    statsLogger.log(' latestPostsData structure:', storageData)
    statsLogger.log(' derived userStatus structure:', derivedUserStatus)

    // Notify background script
    chrome.runtime.sendMessage({
      type: 'POSTS_DATA_UPDATED',
      data: {
        username: username,
        postsCount: postsData.length,
        lastPost: postsData.length > 0 ? postsData[0] : null
      }
    })

  } catch (error) {
    statsLogger.error(' Failed to store profile data:', error)
  }
}

// Profile detection functions
// Cache variables to prevent unnecessary re-extractions
let cachedUsername = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Initialize cache from storage on script load
async function initializeUsernameCache() {
  try {
    const storedUser = await getStoredUsername()
    if (storedUser && storedUser.seren_name) {
      cachedUsername = storedUser.seren_name
      cacheTimestamp = storedUser.timestamp || Date.now()
      statsLogger.log(`Stats: Initialized cache from storage: ${cachedUsername}`)
    }
  } catch (error) {
    statsLogger.warn('Stats: Failed to initialize username cache:', error)
  }
}

// Get authenticated username from user dropdown/avatar (shows YOUR username)
function getAuthenticatedUsername() {
  // Check cache first
  if (cachedUsername && Date.now() - cacheTimestamp < CACHE_DURATION) {
    statsLogger.log(`Stats: Using cached authenticated username: ${cachedUsername}`)
    return cachedUsername
  }

  // Try to get username from user dropdown without opening it
  const authSelectors = [
    'button[id*="user-dropdown"] [class*="text-12"]',
    '[data-testid="user-menu-trigger"] span[class*="text-12"]',
    '.header-user-dropdown [class*="text-12"]',
    'button[aria-label*="User"] span[class*="text-12"]'
  ]

  for (const selector of authSelectors) {
    const element = qs(selector)
    if (element) {
      const text = element.textContent?.trim()
      if (text && text.startsWith('u/')) {
        // Update cache
        cachedUsername = text
        cacheTimestamp = Date.now()
        return text
      }
    }
  }

  // If not found, try existing dropdown detection as fallback
  const dropdownButton = qs('button[aria-label*="user"], [data-testid="user-avatar"], #expand-user-drawer-button') ||
                         qs('button[aria-label*="u/"]') ||
                         qs('[data-testid="user-dropdown-button"]')

  if (dropdownButton) {
    const ariaLabel = dropdownButton.getAttribute('aria-label')
    if (ariaLabel) {
      const labelMatch = ariaLabel.match(/u\/([^\s]+)/)
      if (labelMatch) {
        const username = `u/${labelMatch[1]}`
        cachedUsername = username
        cacheTimestamp = Date.now()
        return username
      }
    }

    const buttonText = dropdownButton.textContent?.trim()
    if (buttonText && buttonText.startsWith('u/')) {
      cachedUsername = buttonText
      cacheTimestamp = Date.now()
      return buttonText
    }
  }

  return null
}

function extractUsernameFromPage() {
  statsLogger.log('Stats: Extracting username from current page with authenticated priority...')

  // Method 1: Prioritize authenticated user detection (make it sync for compatibility)
  const authUsername = getAuthenticatedUsername()
  if (authUsername) {
    statsLogger.log(`Stats: Found authenticated username: ${authUsername}`)
    return authUsername.replace('u/', '')
  }

  // Method 2: Only check URL if we're on our own profile page
  const urlMatch = window.location.href.match(/reddit\.com\/u\/([^\/]+)/) ||
                   window.location.href.match(/reddit\.com\/user\/([^\/]+)/)
  if (urlMatch && urlMatch[1] !== 'adobe') { // Filter out obvious wrong usernames
    statsLogger.log('Stats: Found username in URL:', urlMatch[1])
    return urlMatch[1]
  }

  // Method 3: Generic page element scanning as final fallback (with filtering)
  const usernameElement = qs('[data-testid="username"], .username, [href*="/u/"]')
  if (usernameElement) {
    const username = usernameElement.textContent?.trim() ||
                    usernameElement.href?.match(/\/u\/([^\/]+)/)?.[1]
    if (username && username.startsWith('u/')) {
      const cleanUsername = username.replace('u/', '')
      // Filter out obvious corporate/brand usernames that aren't real users
      if (cleanUsername !== 'adobe' && cleanUsername.length > 2 && !cleanUsername.match(/^[a-z]+$/)) {
        statsLogger.log('Stats: Found username in element fallback:', cleanUsername)
        return cleanUsername
      }
    }
  }

  statsLogger.log('Stats: No authenticated username found, returning null to avoid wrong user detection')
  return null
}

async function navigateToUserPosts(username) {
  statsLogger.log('Navigating to user posts page for:', username)

  const postsUrl = `https://www.reddit.com/u/${username}/submitted/`

  // Set sessionStorage flag to track navigation state with timestamp
  sessionStorage.setItem('reddit-post-machine-script-stage', 'profile-switching-to-posts')
  sessionStorage.setItem('reddit-post-machine-script-stage-timestamp', Date.now().toString())

  window.location.href = postsUrl
  await waitForCondition(() => window.location.href === postsUrl, 5000)
}

async function waitForCondition(condition, timeout = 5000) {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return true
    }
    await sleep(100)
  }

  return false
}


// Focused function to extract data from found shreddit-post elements
function extractPostDataFromShredditPosts(shredditPosts) {
  statsLogger.log(`🔍 Extracting enhanced data from ${shredditPosts.length} shreddit-post elements...`)

  const posts = []

  shredditPosts.forEach((post, index) => {
    try {
      statsLogger.log(`\n--- Processing post ${index + 1}: ${post.id} ---`)

      let searchRoot = post

      // Check if post has shadow root
      if (post.shadowRoot) {
        statsLogger.log(`🌑 Post ${post.id} has shadow root`)
        searchRoot = post.shadowRoot
      } else {
        statsLogger.log(`📄 Post ${post.id} uses normal DOM`)
      }

      // Extract data attributes from shreddit-post element (primary source)
      const postAttributes = {
        postTitle: post.getAttribute('post-title'),
        author: post.getAttribute('author'),
        subredditPrefixedName: post.getAttribute('subreddit-prefixed-name'),
        score: post.getAttribute('score'),
        commentCount: post.getAttribute('comment-count'),
        createdTimestamp: post.getAttribute('created-timestamp'),
        postType: post.getAttribute('post-type'),
        contentHref: post.getAttribute('content-href'),
        permalink: post.getAttribute('permalink'),
        postId: post.getAttribute('id'),
        domain: post.getAttribute('domain'),
        itemState: post.getAttribute('item-state'),
        viewContext: post.getAttribute('view-context'),
        voteType: post.getAttribute('vote-type'),
        awardCount: post.getAttribute('award-count'),
        userId: post.getAttribute('user-id'),
        authorId: post.getAttribute('author-id'),
        subredditId: post.getAttribute('subreddit-id')
      }

      // Method 1: Look for title in shadow root first - prioritize specific title selectors
      let titleElement = searchRoot.querySelector('a[slot="title"]') ||
                        searchRoot.querySelector('a[id*="post-title"]') ||
                        searchRoot.querySelector('[data-testid="post-title"]') ||
                        searchRoot.querySelector('h3') ||
                        searchRoot.querySelector('a[href*="/comments/"]:not([name="comments-action-button"])')

      // Method 2: If not found in shadow root, check the main post element
      if (!titleElement) {
        titleElement = post.querySelector('a[slot="title"]') ||
                      post.querySelector('a[id*="post-title"]') ||
                      post.querySelector('[data-testid="post-title"]') ||
                      post.querySelector('h3') ||
                      post.querySelector('a[href*="/comments/"]:not([name="comments-action-button"])')
      }

      // Method 3: Use the specific ID pattern for the exact title element
      if (!titleElement && post.id) {
        titleElement = document.querySelector(`a[id="post-title-${post.id}"]`) ||
                      document.querySelector(`#${post.id} a[slot="title"]`) ||
                      document.querySelector(`#${post.id} [data-testid="post-title"]`)
      }

      // Method 4: Try more specific selectors for Reddit's new structure
      if (!titleElement && post.id) {
        titleElement = searchRoot.querySelector(`a[id*="post-title-${post.id}"]`) ||
                      post.querySelector(`a[id*="post-title-${post.id}"]`)
      }

      statsLogger.log(`🔍 Title element for ${post.id}:`, titleElement)
      if (titleElement) {
        statsLogger.log(`🔍 Title element tag:`, titleElement.tagName)
        statsLogger.log(`🔍 Title element classes:`, titleElement.className)
        statsLogger.log(`🔍 Title element ID:`, titleElement.id)
      }

      // Method 5: Look for any link with content
      if (!titleElement) {
        const allLinks = post.querySelectorAll('a')
        for (const link of allLinks) {
          if (link.textContent?.trim().length > 5) {
            titleElement = link
            statsLogger.log(`🔗 Found title in fallback link: ${link.textContent?.trim().substring(0, 30)}...`)
            break
          }
        }
      }

      // Extract score with multiple methods, prioritize HTML attributes
      let score = postAttributes.score || '0'
      if (!postAttributes.score) {
        const scoreElement = searchRoot.querySelector('faceplate-number') ||
                          searchRoot.querySelector('[data-testid="post-vote-score"]') ||
                          searchRoot.querySelector('.score') ||
                          searchRoot.querySelector('[slot="vote-score"]') ||
                          post.querySelector('faceplate-number') ||
                          post.querySelector('[data-testid="post-vote-score"]') ||
                          post.querySelector('.score')
        score = scoreElement?.textContent?.trim() || '0'
      }

      // Extract comments with multiple methods, prioritize HTML attributes
      let comments = postAttributes.commentCount || '0'
      if (!postAttributes.commentCount) {
        const commentsElement = searchRoot.querySelector('a[href*="/comments/"] span') ||
                             searchRoot.querySelector('[data-testid="comment-count"]') ||
                             searchRoot.querySelector('[slot="comment-count"]') ||
                             post.querySelector('a[href*="/comments/"] span') ||
                             post.querySelector('[data-testid="comment-count"]')
        comments = commentsElement?.textContent?.trim() || '0'
      }

      // Extract URL, prioritize HTML attributes
      const postUrl = postAttributes.permalink ||
                     (searchRoot.querySelector('a[href*="/comments/"]') ||
                      searchRoot.querySelector('a[slot="full-post-link"]') ||
                      post.querySelector('a[href*="/comments/"]') ||
                      post.querySelector('a[slot="full-post-link"]'))?.href || ''

      const title = postAttributes.postTitle || titleElement?.textContent?.trim() || 'No title'
      const timestamp = postAttributes.createdTimestamp ||
                       (searchRoot.querySelector('time')?.getAttribute('datetime') ||
                        post.querySelector('time')?.getAttribute('datetime') || new Date().toISOString())

      // Enhanced post data object with all metadata
      const postData = {
        // Core identifiers
        id: post.id || postAttributes.postId || '',
        title: title,
        url: postUrl,
        timestamp: timestamp,

        // Author and subreddit information
        author: postAttributes.author || '',
        subreddit: postAttributes.subredditPrefixedName || '',
        authorId: postAttributes.authorId || '',
        subredditId: postAttributes.subredditId || '',

        // Engagement metrics
        score: parseInt(score) || 0,
        commentCount: parseInt(comments) || 0,
        awardCount: parseInt(postAttributes.awardCount) || 0,

        // Post content information
        postType: postAttributes.postType || '',
        domain: postAttributes.domain || '',
        contentHref: postAttributes.contentHref || '',

        // Status and moderation
        itemState: postAttributes.itemState || '',
        viewContext: postAttributes.viewContext || '',
        voteType: postAttributes.voteType || '',

        // Enhanced moderation detection
        moderationStatus: {
          isRemoved: post.textContent?.includes('removed by the moderators') ||
                    post.querySelector('[icon-name="remove"]') !== null || false,
          isLocked: post.querySelector('[icon-name="lock-fill"]') !== null,
          itemState: postAttributes.itemState || ''
        },

        // Additional metadata
        userId: postAttributes.userId || '',
        permalink: postAttributes.permalink || ''
      }

      statsLogger.log(`📊 Enhanced post data extracted:`, {
        id: postData.id,
        title: postData.title,
        author: postData.author,
        subreddit: postData.subreddit,
        score: postData.score,
        commentCount: postData.commentCount,
        postType: postData.postType,
        itemState: postData.itemState
      })

      posts.push(postData)

    } catch (error) {
      statsLogger.error(`❌ Error processing post ${index + 1}:`, error)
    }
  })

  statsLogger.log(`\n✅ Successfully extracted enhanced data from ${posts.length} posts`)
  return posts
}

// Helper method to check post status (same as dom.js)
function checkPostStatus(postElement, statusType) {
  const statusClasses = [
    `[class*="${statusType}"]`,
    `[class*="moderator"]`,
    `[data-testid*="${statusType}"]`,
    '.removed',
    '.deleted',
    '.blocked'
  ]

  // Check post element and its children for status indicators
  for (const selector of statusClasses) {
    const elements = postElement.querySelectorAll(selector)
    if (elements.length > 0) {
      // Verify it's not just a class name coincidence
      const text = elements[0].textContent?.toLowerCase() || ''
      if (text.includes(statusType) || text.includes('moderator') || text.includes('removed') || text.includes('deleted')) {
        return true
      }
    }
  }

  // Check for icon-based moderation indicators
  const moderationIcons = postElement.querySelector('[icon-name="remove"]')
  if (moderationIcons) {
    return true
  }

  // Check for specific status text patterns
  const statusTexts = [
    'removed by moderator',
    'deleted by moderator',
    'this post has been removed',
    'post blocked',
    'moderator action'
  ]

  const postText = postElement.textContent?.toLowerCase() || ''
  return statusTexts.some(statusText => postText.includes(statusText))
}

// Handle check user status request
async function handleCheckUserStatus(userName) {
  statsLogger.log('Check user status request for:', userName)

  try {
    // Navigate to user profile and posts
    await navigateToUserProfile(userName)
    await navigateToPostsTab()

    // Extract enhanced post data using the new function
    const shredditApp = document.querySelector('shreddit-app')
    if (!shredditApp) {
      throw new Error('Reddit app container not found')
    }

    // Find all shreddit-post elements with IDs
    const shredditPosts = Array.from(shredditApp.querySelectorAll('shreddit-post[id^="t3_"]'))
    statsLogger.log(`🎯 Found ${shredditPosts.length} shreddit-post elements with IDs`)

    if (shredditPosts.length === 0) {
      return {
        postsInfo: {
          posts: [],
          total: 0,
          lastPost: null
        },
        lastPost: null,
        totalPosts: 0,
        userName: userName
      }
    }

    // Extract enhanced post data
    const postsData = extractPostDataFromShredditPosts(shredditPosts)

    // Create status report with expected structure for background.js
    const status = {
      postsInfo: {
        posts: postsData,
        total: postsData.length,
        lastPost: postsData.length > 0 ? postsData[0] : null
      },
      lastPost: postsData.length > 0 ? postsData[0] : null,
      totalPosts: postsData.length,
      userName: userName,
      timestamp: new Date().toISOString()
    }

    statsLogger.log('Enhanced user status check result:', status)
    return status

  } catch (error) {
    statsLogger.error('Error checking user status:', error)
    return {
      postsInfo: {
        posts: [],
        total: 0,
        lastPost: null
      },
      lastPost: null,
      totalPosts: 0,
      userName: userName,
      error: error.message
    }
  }
}

// Navigate to user profile (helper function)
async function navigateToUserProfile(userName) {
  statsLogger.log('Navigating to user profile...')

  // Extract username without u/ prefix if present
  const cleanUsername = userName.replace('u/', '')
  const targetUrl = `https://www.reddit.com/user/${cleanUsername}`

  // Check if we are already on the correct page
  if (window.location.href.split('?')[0] === targetUrl ||
      window.location.href.split('?')[0] === targetUrl + '/') {
    statsLogger.log('Already on user profile page')
    return true
  }

  window.location.href = targetUrl
  await new Promise(resolve => setTimeout(resolve, 3000))
  return true
}

// Navigate to posts tab (helper function)
async function navigateToPostsTab() {
  statsLogger.log('Navigating to Posts tab...')

  if (window.location.pathname.endsWith('/submitted') ||
      window.location.pathname.endsWith('/submitted/')) {
    statsLogger.log('Already on submitted/posts page')
    return true
  }

  const postsTabSelectors = [
    'a[href*="/submitted/"]',
    '#profile-tab-posts_tab',
    'faceplate-tracker[noun="posts_tab"] a',
    '[data-testid*="posts"]'
  ]

  for (const selector of postsTabSelectors) {
    const postsTab = document.querySelector(selector)
    if (postsTab && postsTab.textContent?.toLowerCase().includes('posts')) {
      statsLogger.log('Found Posts tab, clicking...')
      postsTab.click()
      await new Promise(resolve => setTimeout(resolve, 2000))
      return true
    }
  }

  return false
}

// Manual trigger function for debugging
window.triggerProfileDataCollection = async function() {
  statsLogger.log('🔧 MANUAL TRIGGER: Starting profile data collection...')

  try {
    const username = extractUsernameFromPage()
    if (!username) {
      statsLogger.log('❌ No username found on current page')
      return { success: false, error: 'No username found' }
    }

    statsLogger.log(`🔧 MANUAL TRIGGER: Found username: ${username}`)

    // Capture posts data directly
    const postsData = await capturePostsData()
    statsLogger.log(`🔧 MANUAL TRIGGER: Captured ${postsData.length} posts`)

    if (postsData.length > 0) {
      // Store the data
      await storeRedditProfileData(username, postsData)
      statsLogger.log('🔧 MANUAL TRIGGER: Data stored successfully')

      return {
        success: true,
        username: username,
        postsCount: postsData.length,
        samplePost: postsData[0]
      }
    } else {
      statsLogger.log('❌ MANUAL TRIGGER: No posts found')
      return { success: false, error: 'No posts found' }
    }

  } catch (error) {
    statsLogger.error('❌ MANUAL TRIGGER: Error:', error)
    return { success: false, error: error.message }
  }
}

statsLogger.log('🔧 Manual trigger available: window.triggerProfileDataCollection()')

// ⚡ TINY REUSABLE FUNCTION: Quick post data collection for autoflow
async function quickCollectPostData(options = {}) {
  const {
    maxPosts = 3,
    timeout = 5000,
    includeModeration = true,
    includeEngagement = true
  } = options

  statsLogger.log(`⚡ Quick collecting ${maxPosts} posts with ${timeout}ms timeout`)

  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const shredditApp = document.querySelector('shreddit-app')
    if (!shredditApp) {
      await sleep(200)
      continue
    }

    const shredditPosts = Array.from(shredditApp.querySelectorAll('shreddit-post[id^="t3_"]')).slice(0, maxPosts)

    if (shredditPosts.length > 0) {
      statsLogger.log(`⚡ Found ${shredditPosts.length} posts, extracting...`)

      const posts = shredditPosts.map(post => {
        const attrs = {
          id: post.id || '',
          title: post.getAttribute('post-title') || '',
          author: post.getAttribute('author') || '',
          subreddit: post.getAttribute('subreddit-prefixed-name') || '',
          score: parseInt(post.getAttribute('score') || '0'),
          commentCount: parseInt(post.getAttribute('comment-count') || '0'),
          timestamp: post.getAttribute('created-timestamp') || new Date().toISOString(),
          itemState: post.getAttribute('item-state') || '',
          postType: post.getAttribute('post-type') || '',
          permalink: post.getAttribute('permalink') || '',
          url: post.getAttribute('content-href') || post.getAttribute('permalink') || ''
        }

        // Add moderation detection if requested
        if (includeModeration) {
          attrs.moderationStatus = {
            isRemoved: post.textContent?.includes('removed by the moderators') ||
                      post.querySelector('[icon-name="remove"]') !== null,
            isLocked: post.querySelector('[icon-name="lock-fill"]') !== null,
            itemState: attrs.itemState
          }
          // Legacy compatibility
          attrs.isRemoved = attrs.moderationStatus.isRemoved
          attrs.isBlocked = attrs.moderationStatus.isRemoved
        }

        return attrs
      })

      statsLogger.log(`⚡ Quick collection complete: ${posts.length} posts`)
      return posts
    }

    await sleep(200)
  }

  statsLogger.log('⚡ Quick collection timeout - no posts found')
  return []
}

// 🎯 SINGLE AUTOFLOW FUNCTION: Fresh post data collection for decision making
async function getPostsDataForAutoflowDecision(username) {
  statsLogger.log('🎯 Collecting fresh posts data for autoflow decision...')

  try {
    // Ensure we're on the submitted page for fresh data
    if (!window.location.href.includes('/submitted')) {
      statsLogger.log('⚠️ Not on submitted page, navigating...')
      await navigateToUserProfile(username)
      await navigateToPostsTab()
      // Small delay to ensure page loads
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // 🔧 Use the SAME robust DOM analysis method as the full stats script
    statsLogger.log('🎯 Using full DOM analysis method for reliable data collection...')
    const posts = await capturePostsData()

    statsLogger.log(`🎯 Full DOM analysis collected ${posts.length} fresh posts for autoflow decision`)

    if (posts.length === 0) {
      return {
        postsInfo: { posts: [], total: 0, lastPost: null },
        lastPost: null,
        totalPosts: 0,
        userName: username,
        timestamp: new Date().toISOString(),
        dataFresh: true
      }
    }

    const lastPost = posts[0] // Most recent post

    return {
      postsInfo: {
        posts: posts,
        total: posts.length,
        lastPost: lastPost
      },
      lastPost: lastPost,
      totalPosts: posts.length,
      userName: username,
      timestamp: new Date().toISOString(),
      dataFresh: true
    }

  } catch (error) {
    statsLogger.error('❌ Error collecting fresh posts data for autoflow:', error)

    // Fallback to quick collection if navigation fails
    statsLogger.log('🔧 Fallback: Attempting quick collection as last resort...')
    const posts = await quickCollectPostData({
      maxPosts: 5,
      timeout: 3000,
      includeModeration: true,
      includeEngagement: true
    })

    statsLogger.log(`🔧 Fallback collected ${posts.length} posts`)

    return {
      postsInfo: { posts: posts, total: posts.length, lastPost: posts[0] || null },
      lastPost: posts[0] || null,
      totalPosts: posts.length,
      userName: username,
      timestamp: new Date().toISOString(),
      dataFresh: false,
      error: error.message
    }
  }
}

// Export for global access
window.quickCollectPostData = quickCollectPostData
window.getPostsDataForAutoflowDecision = getPostsDataForAutoflowDecision

statsLogger.log('⚡ Autoflow function available: getPostsDataForAutoflowDecision(username)')

async function capturePostsData() {
  statsLogger.log('Capturing posts data from current page...')

  const posts = []
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    // Use only the correct path: shreddit-app -> shreddit-post elements with IDs
    statsLogger.log('=== SEARCHING SHREDDIT-APP FOR POSTS ===')

    const shredditApp = document.querySelector('shreddit-app')
    if (!shredditApp) {
      statsLogger.log('❌ shreddit-app not found')
    } else {
      statsLogger.log('✅ Found shreddit-app')

      // Find all shreddit-post elements with IDs
      const shredditPosts = Array.from(shredditApp.querySelectorAll('shreddit-post[id^="t3_"]'))
      statsLogger.log(`🎯 Found ${shredditPosts.length} shreddit-post elements with IDs`)

      if (shredditPosts.length > 0) {
        statsLogger.log('🔍 Using enhanced post data extraction...')
        const extractedPosts = extractPostDataFromShredditPosts(shredditPosts)
        statsLogger.log(`✅ Enhanced extraction captured ${extractedPosts.length} posts with metadata`)

        // Log first post to verify enhanced data
        if (extractedPosts.length > 0) {
          statsLogger.log('📊 Sample enhanced post data:', {
            id: extractedPosts[0].id,
            title: extractedPosts[0].title,
            author: extractedPosts[0].author,
            subreddit: extractedPosts[0].subreddit,
            score: extractedPosts[0].score,
            commentCount: extractedPosts[0].commentCount,
            itemState: extractedPosts[0].itemState
          })
        }

        posts.push(...extractedPosts)

        statsLogger.log(`✅ Successfully captured ${posts.length} posts with enhanced metadata`)
        return posts
      }
    }

    statsLogger.log(`No posts found, attempt ${attempts + 1}/${maxAttempts}`)
    await sleep(1000)
    attempts++
  }

  statsLogger.log('Failed to find posts after maximum attempts')
  return []
}

// Main profile detection script
async function runProfileDetectionScript() {
  statsLogger.log('=== PROFILE DETECTION SCRIPT STARTED ===')

  try {
    // Extract username from current page
    const username = extractUsernameFromPage()
    if (!username) {
      statsLogger.log('No username found, cannot proceed with profile detection')
      return
    }

    statsLogger.log('Detected username:', username)

    // Store username if not already stored
    const storedUser = await getStoredUsername()
    if (!storedUser || !storedUser.seren_name) {
      await chrome.storage.sync.set({
        redditUser: {
          seren_name: username,
          lastCheck: Date.now()
        }
      })
    }

    // Navigate to user's posts page
    await navigateToUserPosts(username)

  } catch (error) {
    statsLogger.error('Profile detection script error:', error)
    sessionStorage.removeItem('reddit-post-machine-script-stage')
  }
}

async function continueProfileDataCollection() {
  statsLogger.log('=== CONTINUING PROFILE DATA COLLECTION ===')

  try {
    const username = extractUsernameFromPage()
    if (!username) {
      statsLogger.log('No username found on posts page')
      sessionStorage.removeItem('reddit-post-machine-script-stage')
      return
    }

    statsLogger.log('Collecting posts data for:', username)

    // Capture posts data
    const postsData = await capturePostsData()

    if (postsData.length > 0) {
      // Store the profile data
      await storeRedditProfileData(username, postsData)
      statsLogger.log('Profile data collection completed successfully')

      // Update user status with fresh data
      const freshStatus = {
        userName: username,
        currentUser: username,
        storedUser: username,
        isMatch: true,
        lastCheck: Date.now(),
        totalPosts: postsData.length,
        postsCount: postsData.length,
        lastPostText: postsData.length > 0 ? postsData[0].title || 'Recent post' : 'No posts',
        lastPostDate: postsData.length > 0 ? postsData[0].timestamp || Date.now() : null,
        currentUrl: window.location.href,
        timestamp: Date.now(),
        collectingPostsData: false,
        dataFresh: true
      }

      chrome.storage.local.set({
        userStatus: freshStatus
      }).then(() => {
        statsLogger.log('User status updated with fresh posts data')

        // Trigger auto-flow decision analysis by sending ACTION_COMPLETED to background
        chrome.runtime.sendMessage({
          type: 'ACTION_COMPLETED',
          action: 'GET_POSTS',
          success: true,
          data: {
            total: postsData.length,
            lastPostDate: postsData.length > 0 ? postsData[0].timestamp || Date.now() : null,
            posts: postsData,
            lastPost: postsData.length > 0 ? postsData[0] : null
          }
        }).catch(err => {
          statsLogger.warn('Failed to trigger auto-flow decision analysis:', err)
        })
      }).catch(error => {
        statsLogger.error('Failed to update user status:', error)
      })
    } else {
      statsLogger.log('No posts data found to store')

      // Update status to indicate collection completed but no data found
      const noDataStatus = {
        currentUser: username,
        storedUser: username,
        isMatch: true,
        lastCheck: Date.now(),
        postsCount: 0,
        currentUrl: window.location.href,
        timestamp: Date.now(),
        collectingPostsData: false,
        dataFresh: true,
        postsDataError: 'No posts found on user page'
      }

      chrome.storage.local.set({
        userStatus: noDataStatus
      }).catch(() => {})
    }

    // Clear script stage
    sessionStorage.removeItem('reddit-post-machine-script-stage')

    statsLogger.log('=== PROFILE DETECTION SCRIPT COMPLETED ===')

  } catch (error) {
    statsLogger.error('Continue profile data collection error:', error)
    sessionStorage.removeItem('reddit-post-machine-script-stage')

    // Update status with error
    chrome.storage.local.set({
      userStatus: {
        error: error.message,
        timestamp: Date.now(),
        collectingPostsData: false,
        dataFresh: false
      }
    }).catch(() => {})
  }
}

// Handle manual script trigger from background/popup
async function handleManualScriptTrigger(scriptType, mode) {
  statsLogger.log(`=== MANUAL TRIGGER: ${scriptType} (mode: ${mode}) ===`)

  try {
    if (scriptType === 'profile') {
      // Clear any existing script stage for manual execution
      sessionStorage.removeItem('reddit-post-machine-script-stage')
      statsLogger.log('Manually triggering profile detection script')
      await runProfileDetectionScript()
    } else {
      statsLogger.log(`Manual trigger for ${scriptType} not handled by stats script`)
    }
  } catch (error) {
    statsLogger.error('Manual script trigger error:', error)
  }
}

// Handle extract username and create post (legacy support)
function handleExtractUsernameAndCreatePost() {
  statsLogger.log('Handling extract username and create post request')

  const username = extractUsernameFromPage()
  if (username) {
    statsLogger.log('Extracted username:', username)

    // Store username
    chrome.storage.sync.set({
      redditUser: {
        seren_name: username,
        lastCheck: Date.now()
      }
    }).then(() => {
      statsLogger.log('Username stored successfully')
    }).catch(error => {
      statsLogger.error('Failed to store username:', error)
    })
  }
}

// Handle delete last post request
function handleDeleteLastPost(userName) {
  statsLogger.log('Delete last post request for:', userName)
  // This would be implemented if needed for stats functionality
  statsLogger.log('Delete last post not implemented in stats script')
}

// Helper function to find and click View Profile when username not found
async function handleUserNotFoundNavigation() {
  statsLogger.log('Username not found, attempting automatic navigation to user profile...')

  try {
    // Step 1: Find and click user dropdown/avatar button
    const dropdownButton = qs('button[aria-label*="user"], [data-testid="user-avatar"], #expand-user-drawer-button') ||
                           qs('button[aria-label*="u/"]') ||
                           qs('[data-testid="user-dropdown-button"]')

    if (!dropdownButton) {
      statsLogger.log('User dropdown button not found')
      return false
    }

    statsLogger.log('Found user dropdown button, clicking to open menu')
    dropdownButton.click()
    await sleep(1000) // Wait for menu to appear

    // Step 2: Find and click "View Profile" link in the dropdown menu
    const viewProfileLink = qs('a[href*="/u/"], a[href*="/user/"]') ||
                            qs('[role="menuitem"] a') ||
                            qs('.dropdown-menu a[href*="/"]')

    if (!viewProfileLink) {
      statsLogger.log('View Profile link not found in dropdown')
      // Try to close dropdown and return false
      document.body.click()
      return false
    }

    statsLogger.log('Found View Profile link, navigating to user profile')
    const profileUrl = viewProfileLink.href

    // Set sessionStorage flag to track navigation state
    sessionStorage.setItem('reddit-post-machine-script-stage', 'profile-navigating')
    sessionStorage.setItem('reddit-post-machine-script-stage-timestamp', Date.now().toString())

    window.location.href = profileUrl

    // Wait for navigation to complete
    await waitForCondition(() => window.location.href.includes('/u/') || window.location.href.includes('/user/'), 5000)

    statsLogger.log('Successfully navigated to user profile page')
    return true

  } catch (error) {
    statsLogger.error('Error during automatic user profile navigation:', error)
    return false
  }
}

// Helper function to search shadow DOM for elements
function queryShadowDOM(selector, root = document) {
  // First try normal querySelector
  const element = root.querySelector(selector)
  if (element) return element

  // Recursively search shadow roots
  const allElements = root.querySelectorAll('*')
  for (const el of allElements) {
    if (el.shadowRoot) {
      const shadowElement = queryShadowDOM(selector, el.shadowRoot)
      if (shadowElement) return shadowElement
    }
  }

  return null
}

// Helper function to find element by text content including shadow DOM
function findElementByText(text, root = document) {
  // Search in main document
  const elements = root.querySelectorAll('*')
  for (const el of elements) {
    if (el.textContent?.trim().toLowerCase() === text.toLowerCase()) {
      return el
    }
  }

  // Search in shadow roots
  for (const el of elements) {
    if (el.shadowRoot) {
      const shadowElement = findElementByText(text, el.shadowRoot)
      if (shadowElement) return shadowElement
    }
  }

  return null
}

// Helper function to navigate to posts tab from profile page
async function navigateToPostsFromProfile() {
  statsLogger.log('Navigating to Posts tab from profile page...')

  try {
    // Look for Posts tab/button on profile page with shadow DOM support
    let postsTab = queryShadowDOM('faceplate-tracker[noun="posts_tab"]') ||
                   queryShadowDOM('a[href*="/submitted"]') ||
                   queryShadowDOM('button[data-testid="posts-tab"]') ||
                   queryShadowDOM('[data-click-id="user_posts"]') ||
                   queryShadowDOM('[role="tab"]') ||
                   qs('a[href*="/submitted/"]') // fallback to normal DOM

    // If still not found, try text-based search
    if (!postsTab) {
      statsLogger.log('Using text-based search for Posts tab')
      postsTab = findElementByText('Posts') || findElementByText('Submitted')
    }

    // If we found generic tabs, filter for Posts text
    if (postsTab && !postsTab.getAttribute('noun')?.includes('posts_tab')) {
      const allTabs = queryShadowDOMAll('[role="tab"], faceplate-tracker, a[href*="/submitted"], button[data-testid*="tab"]')
      for (const tab of allTabs) {
        const text = tab.textContent?.trim().toLowerCase()
        if (text === 'posts' || text === 'submitted') {
          postsTab = tab
          break
        }
      }
    }

    if (!postsTab) {
      statsLogger.log('🔍 Searching for Posts tab - trying alternative detection methods...')
      // Try to find any clickable element that contains 'posts' in attributes
      const allElements = document.querySelectorAll('*')
      for (const el of allElements) {
        const attributes = el.getAttributeNames()
        for (const attr of attributes) {
          if (el.getAttribute(attr)?.toLowerCase().includes('posts')) {
            postsTab = el
            statsLogger.log('Found posts element as fallback:', el.tagName, attr)
            break
          }
        }
        if (postsTab) break
      }
    }

    if (!postsTab) {
      statsLogger.log('Posts tab not found after all attempts')
      return false
    }

    statsLogger.log('Found Posts tab, navigating to submitted posts:', postsTab.tagName, postsTab.textContent?.trim())

    // Update sessionStorage flag for posts navigation
    sessionStorage.setItem('reddit-post-machine-script-stage', 'profile-switching-to-posts')
    sessionStorage.setItem('reddit-post-machine-script-stage-timestamp', Date.now().toString())

    // Try to click the tab first, if that doesn't work, construct URL
    try {
      postsTab.click()
      statsLogger.log('Clicked Posts tab, waiting for content to load...')

      // Wait longer for posts content to load after clicking Posts tab
      await sleep(3000)

      // Check if navigation happened
      if (window.location.href.includes('/submitted')) {
        statsLogger.log('Successfully navigated to submitted posts via click')
        return true
      }
    } catch (clickError) {
      statsLogger.log('Click failed, trying direct navigation')
    }

    // Fallback: construct submitted URL from current username
    const username = extractUsernameFromPage()
    if (username) {
      const postsUrl = `https://www.reddit.com/u/${username}/submitted/`
      statsLogger.log('Navigating directly to submitted URL:', postsUrl)
      window.location.href = postsUrl

      // Wait for navigation to complete
      await waitForCondition(() => window.location.href.includes('/submitted'), 5000)

      statsLogger.log('Successfully navigated to submitted posts page')
      return true
    }

    return false

  } catch (error) {
    statsLogger.error('Error navigating to Posts tab:', error)
    return false
  }
}

// Helper function to query all elements including shadow DOM
function queryShadowDOMAll(selector, root = document) {
  const elements = Array.from(root.querySelectorAll(selector))

  // Recursively search shadow roots
  const allElements = root.querySelectorAll('*')
  for (const el of allElements) {
    if (el.shadowRoot) {
      const shadowElements = queryShadowDOMAll(selector, el.shadowRoot)
      elements.push(...shadowElements)
    }
  }

  return elements
}
// Handle check user status request
async function handleCheckUserStatus(userName) {
  statsLogger.log('Check user status request for:', userName)

  try {
    // Check if current user matches the stored user
    let currentUser = extractUsernameFromPage()
    let storedUser = await getStoredUsername()

    // If no current user found, attempt automatic navigation
    if (!currentUser) {
      statsLogger.log('No username found on current page, attempting automatic navigation')

      // Update status to show navigation attempt
      const navigationStatus = {
        currentUser: null,
        storedUser: storedUser?.seren_name || null,
        isMatch: false,
        lastCheck: storedUser?.lastCheck || null,
        postsCount: 0,
        currentUrl: window.location.href,
        timestamp: Date.now(),
        collectingPostsData: true,
        dataFresh: false,
        statusMessage: 'Attempting automatic navigation to user profile...'
      }

      chrome.storage.local.set({
        userStatus: navigationStatus
      }).catch(() => {})

      const navigationSuccess = await handleUserNotFoundNavigation()
      if (navigationSuccess) {
        statsLogger.log('Automatic navigation to profile successful')
        // Update status to show profile navigation success
        const profileStatus = {
          ...navigationStatus,
          statusMessage: 'Successfully navigated to user profile, proceeding to posts...'
        }

        chrome.storage.local.set({
          userStatus: profileStatus
        }).catch(() => {})

        // After profile navigation, try to navigate to posts
        const postsNavigationSuccess = await navigateToPostsFromProfile()
        if (postsNavigationSuccess) {
          statsLogger.log('Automatic navigation to posts successful')
          // At this point, continueProfileDataCollection will handle the rest
          return
        } else {
          // Posts navigation failed
          const postsFailedStatus = {
            ...profileStatus,
            collectingPostsData: false,
            postsDataError: 'Failed to navigate to Posts tab from profile page'
          }

          chrome.storage.local.set({
            userStatus: postsFailedStatus
          }).catch(() => {})
          return
        }
      } else {
        // Profile navigation failed
        const profileFailedStatus = {
          ...navigationStatus,
          collectingPostsData: false,
          postsDataError: 'Failed to navigate to user profile'
        }

        chrome.storage.local.set({
          userStatus: profileFailedStatus
        }).catch(() => {})
        return
      }
    }

    // Get cached profile data to see if we need fresh collection
    const profileData = await chrome.storage.local.get(['redditProfileData'])
    const cachedData = profileData.redditProfileData
    const isDataStale = !cachedData || (Date.now() - cachedData.lastUpdated > 3600000) // 1 hour

    const status = {
      currentUser: currentUser,
      storedUser: storedUser?.seren_name || null,
      isMatch: currentUser === storedUser?.seren_name,
      lastCheck: storedUser?.lastCheck || null,
      postsCount: cachedData?.posts?.length || 0,
      currentUrl: window.location.href,
      timestamp: Date.now(),
      collectingPostsData: false,
      dataFresh: !isDataStale && cachedData?.username === currentUser,
      statusMessage: isDataStale ? 'Data is stale, collecting fresh posts...' : 'Using cached data'
    }

    statsLogger.log('User status check result:', status)

    // Store initial status in chrome.storage
    chrome.storage.local.set({
      userStatus: status
    }).then(() => {
      statsLogger.log('User status stored in local storage')
    }).catch(error => {
      statsLogger.error('Failed to store user status:', error)
    })

    // Only collect fresh posts data if we have a current user and data is stale
    if (currentUser && isDataStale) {
      statsLogger.log('Collecting fresh posts data for user:', currentUser)

      // Update status to show collection is starting
      const collectingStatus = {
        ...status,
        collectingPostsData: true,
        dataFresh: false,
        statusMessage: 'Collecting fresh posts data...'
      }

      chrome.storage.local.set({
        userStatus: collectingStatus
      }).catch(() => {})

      // Store username for the profile detection flow
      await chrome.storage.sync.set({
        redditUser: {
          seren_name: currentUser,
          lastCheck: Date.now()
        }
      })

      // Trigger the full profile detection flow to collect posts data
      await runProfileDetectionScript()
    } else if (currentUser && !isDataStale) {
      statsLogger.log('Using cached posts data for user:', currentUser)
    } else {
      statsLogger.log('No current user found, cannot collect posts data')
    }

  } catch (error) {
    statsLogger.error('Error checking user status:', error)

    // Store error status in storage
    chrome.storage.local.set({
      userStatus: {
        error: error.message,
        timestamp: Date.now(),
        collectingPostsData: false,
        statusMessage: 'Error occurred during status check'
      }
    }).catch(() => {})
  }
}

// Message listener
// Initialize stats script
statsLogger.log('Stats content script loaded on URL:', window.location.href)

// Exit early if we're on a submit page (this shouldn't happen but prevents message conflicts)
if (window.location.href.includes('/submit')) {
  statsLogger.warn('Stats script loaded on submit page - this should not happen. Exiting early.')
  // Don't set up message listener to avoid conflicts
} else {
  // Initialize username cache from storage
  initializeUsernameCache()

  // Only set up message listener if not on submit page
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    statsLogger.log('Stats script received message:', message)

    switch (message.type) {
      case 'DELETE_LAST_POST':
        handleDeleteLastPost(message.userName)
        break

      case 'CHECK_USER_STATUS':
        handleCheckUserStatus(message.userName)
        break

      case 'MANUAL_TRIGGER_SCRIPT':
        handleManualScriptTrigger(message.scriptType, message.mode)
        break

      case 'GET_FRESH_POSTS_FOR_DECISION':
        // 🎯 NEW: Handle fresh posts data collection for autoflow decision
        statsLogger.log('📊 Stats script received GET_FRESH_POSTS_FOR_DECISION for user:', message.userName)
        getPostsDataForAutoflowDecision(message.userName).then(freshData => {
          statsLogger.log('📊 Stats script collected fresh data, sending response:', freshData)
          chrome.runtime.sendMessage({
            type: 'FRESH_POSTS_COLLECTED',
            data: freshData
          }).catch(error => {
            statsLogger.error('📊 Failed to send FRESH_POSTS_COLLECTED message:', error)
          })
        }).catch(error => {
          statsLogger.error('📊 Error in getPostsDataForAutoflowDecision:', error)
          chrome.runtime.sendMessage({
            type: 'FRESH_POSTS_COLLECTED',
            data: { error: error.message, dataFresh: false }
          }).catch(sendError => {
            statsLogger.error('📊 Failed to send error response:', sendError)
          })
        })
        break

      case 'REDDIT_PAGE_LOADED':
        const currentScriptStage = sessionStorage.getItem('reddit-post-machine-script-stage')
        if (currentScriptStage === 'profile-switching-to-posts' && window.location.href.includes('/submitted')) {
          statsLogger.log('Reddit page loaded after navigation, continuing profile data collection')
          setTimeout(() => continueProfileDataCollection(), 2000)
        }
        break

      default:
        statsLogger.log('Stats script: Unknown message type:', message.type)
    }
  })

  // Check for and clear stale sessionStorage flags (prevent "step is still running" lockups)
  const scriptStage = sessionStorage.getItem('reddit-post-machine-script-stage')
  if (scriptStage) {
    const stageTimestamp = sessionStorage.getItem('reddit-post-machine-script-stage-timestamp')
    if (stageTimestamp && (Date.now() - parseInt(stageTimestamp) > 300000)) { // 5 minutes
      statsLogger.log('Clearing stale script stage flag:', scriptStage)
      sessionStorage.removeItem('reddit-post-machine-script-stage')
      sessionStorage.removeItem('reddit-post-machine-script-stage-timestamp')
    }
  }

  // Check if we need to continue profile data collection from previous navigation
  if (scriptStage === 'profile-switching-to-posts' && window.location.href.includes('/submitted')) {
    statsLogger.log('Continuing profile data collection from previous navigation')
    setTimeout(() => continueProfileDataCollection(), 2000)
  } else if (scriptStage === 'profile-navigating' && (window.location.href.includes('/u/') || window.location.href.includes('/user/'))) {
    statsLogger.log('On profile page after automatic navigation, proceeding to posts')
    setTimeout(() => navigateToPostsFromProfile(), 2000)
  }
}

// Note: Auto-run disabled to prevent automatic tab creation
// Auto-run would be triggered here if needed

// Export default function for Quasar bridge compatibility
export default function (bridge) {
  // This function is called by Quasar's BEX bridge system
  statsLogger.log('Stats script bridge initialized', bridge)
}
