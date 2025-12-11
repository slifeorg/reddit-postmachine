// Stats Content Script - Handles profile detection and data collection
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
    console.warn('Failed to get stored username:', error)
    return null
  }
}

async function storeRedditProfileData(username, postsData) {
  try {
    console.log(` Storing profile data for ${username} with ${postsData.length} posts`)
    
    // Log sample of posts data being stored
    if (postsData.length > 0) {
      console.log(' Sample post data being stored:', {
        title: postsData[0].title,
        author: postsData[0].author,
        subreddit: postsData[0].subreddit,
        score: postsData[0].score,
        commentCount: postsData[0].commentCount,
        itemState: postsData[0].itemState
      })
    }
    
    // Store in local storage for detailed data
    await chrome.storage.local.set({
      redditProfileData: {
        username: username,
        posts: postsData,
        lastUpdated: Date.now()
      }
    })
    
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
    
    console.log(` Stored profile data for ${username}: ${postsData.length} posts`)
    console.log(` Posts data also saved to latestPostsData for Status report`)
    console.log(' latestPostsData structure:', storageData)
    
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
    console.error(' Failed to store profile data:', error)
  }
}

async function storeRedditProfileData(username, postsData) {
  try {
    console.log(` Storing profile data for ${username} with ${postsData.length} posts`)
    
    // Log sample of posts data being stored
    if (postsData.length > 0) {
      console.log(' Sample post data being stored:', {
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
    
    console.log(` Stored profile data for ${username}: ${postsData.length} posts`)
    console.log(` Updated derived userStatus with enhanced metadata`)
    console.log(' latestPostsData structure:', storageData)
    console.log(' derived userStatus structure:', derivedUserStatus)
    
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
    console.error(' Failed to store profile data:', error)
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
      console.log(`Stats: Initialized cache from storage: ${cachedUsername}`)
    }
  } catch (error) {
    console.warn('Stats: Failed to initialize username cache:', error)
  }
}

// Get authenticated username from user dropdown/avatar (shows YOUR username)
function getAuthenticatedUsername() {
  // Check cache first
  if (cachedUsername && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log(`Stats: Using cached authenticated username: ${cachedUsername}`)
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
  console.log('Stats: Extracting username from current page with authenticated priority...')
  
  // Method 1: Prioritize authenticated user detection (make it sync for compatibility)
  const authUsername = getAuthenticatedUsername()
  if (authUsername) {
    console.log(`Stats: Found authenticated username: ${authUsername}`)
    return authUsername.replace('u/', '')
  }
  
  // Method 2: Only check URL if we're on our own profile page
  const urlMatch = window.location.href.match(/reddit\.com\/u\/([^\/]+)/) || 
                   window.location.href.match(/reddit\.com\/user\/([^\/]+)/)
  if (urlMatch && urlMatch[1] !== 'adobe') { // Filter out obvious wrong usernames
    console.log('Stats: Found username in URL:', urlMatch[1])
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
        console.log('Stats: Found username in element fallback:', cleanUsername)
        return cleanUsername
      }
    }
  }
  
  console.log('Stats: No authenticated username found, returning null to avoid wrong user detection')
  return null
}

async function navigateToUserPosts(username) {
  console.log('Navigating to user posts page for:', username)
  
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

// Targeted debugging function for the specific DOM structure
function debugSubgridContainer() {
  console.log('=== DEBUGGING SUBGRID CONTAINER STRUCTURE ===')
  
  // Step 1: Find #subgrid-container
  const subgridContainer = document.querySelector('#subgrid-container')
  if (!subgridContainer) {
    console.log('❌ #subgrid-container not found in main DOM')
    return []
  }
  
  console.log('✅ Found #subgrid-container')
  
  // Step 2: Look for div > shreddit-feed within it
  const div = subgridContainer.querySelector('div')
  if (!div) {
    console.log('❌ No direct div child found in #subgrid-container')
    return []
  }
  
  console.log('✅ Found div in #subgrid-container')
  
  // Step 3: Look for shreddit-feed
  let shredditFeed = div.querySelector('shreddit-feed')
  
  // If not found in direct div, search deeper
  if (!shredditFeed) {
    console.log('🔍 Searching deeper for shreddit-feed...')
    const allFeeds = subgridContainer.querySelectorAll('shreddit-feed')
    if (allFeeds.length > 0) {
      shredditFeed = allFeeds[0]
      console.log(`✅ Found shreddit-feed deeper in structure (${allFeeds.length} total)`)
    }
  }
  
  if (!shredditFeed) {
    console.log('❌ shreddit-feed not found in #subgrid-container')
    return []
  }
  
  console.log('✅ Found shreddit-feed')
  
  // Step 4: Check if shreddit-feed has shadow root
  if (shredditFeed.shadowRoot) {
    console.log('🌑 shreddit-feed has shadow root')
    const shadowArticles = shredditFeed.shadowRoot.querySelectorAll('article')
    console.log(`📄 Found ${shadowArticles.length} articles in shadow root`)
    
    // Log details of each article
    shadowArticles.forEach((article, index) => {
      console.log(`  [${index + 1}] Article: id="${article.id || 'none'}", class="${article.className || 'none'}"`)
      const postLink = article.querySelector('[data-ks-id^="t3_"]')
      if (postLink) {
        console.log(`    -> Has post link: data-ks-id="${postLink.getAttribute('data-ks-id')}"`)
      }
    })
    
    return Array.from(shadowArticles)
  } else {
    console.log('📄 shreddit-feed does NOT have shadow root, searching in normal DOM')
    const normalArticles = shredditFeed.querySelectorAll('article')
    console.log(`📄 Found ${normalArticles.length} articles in normal DOM`)
    
    // Log details of each article
    normalArticles.forEach((article, index) => {
      console.log(`  [${index + 1}] Article: id="${article.id || 'none'}", class="${article.className || 'none'}"`)
      const postLink = article.querySelector('[data-ks-id^="t3_"]')
      if (postLink) {
        console.log(`    -> Has post link: data-ks-id="${postLink.getAttribute('data-ks-id')}"`)
      }
    })
    
    return Array.from(normalArticles)
  }
}

// Aggressive shadow DOM search function for shreddit-post elements
function findShredditPostsGreedy() {
  console.log('Starting aggressive search for shreddit-post elements...')
  const posts = []
  const visited = new Set()
  
  function logNodeStructure(node, depth = 0) {
    const indent = '  '.repeat(depth)
    try {
      if (node === document) {
        console.log(`${indent}Document`)
      } else if (node.tagName) {
        console.log(`${indent}Node: ${node.tagName.toLowerCase()}${node.id ? '#' + node.id : ''}${node.className ? '.' + Array.from(node.classList).join('.') : ''}`)
      }
      
      if (node.shadowRoot) {
        console.log(`${indent}  Has shadowRoot`)
        const shadowChildren = node.shadowRoot.querySelectorAll('*')
        console.log(`${indent}  ShadowRoot has ${shadowChildren.length} direct children`)
      }
    } catch (error) {
      console.log(`${indent}Error logging node:`, error)
    }
  }
  
  function searchInNode(node, depth = 0) {
    if (depth > 10) {
      console.log(`${'  '.repeat(depth)}Max depth reached`)
      return
    }
    if (visited.has(node)) return
    visited.add(node)
    
    console.log(`${'  '.repeat(depth)}Searching at depth ${depth}`)
    logNodeStructure(node, depth)
    
    try {
      // Find shreddit-post elements in this node
      const shredditPosts = node.querySelectorAll ? node.querySelectorAll('shreddit-post') : []
      console.log(`${'  '.repeat(depth)}Found ${shredditPosts.length} shreddit-post elements`)
      shredditPosts.forEach((post, index) => {
        if (!posts.includes(post)) {
          posts.push(post)
          console.log(`${'  '.repeat(depth)}  [${index + 1}] shreddit-post: id="${post.id || 'none'}", class="${post.className || 'none'}"`)
        }
      })
      
      // Also check for article elements that might be posts
      const articles = node.querySelectorAll ? node.querySelectorAll('article') : []
      console.log(`${'  '.repeat(depth)}Found ${articles.length} article elements`)
      articles.forEach((article, index) => {
        const hasPostData = article.querySelector('[data-ks-id^="t3_"]')
        console.log(`${'  '.repeat(depth)}  [${index + 1}] article: id="${article.id || 'none'}", hasPostData=${!!hasPostData}`)
        if (!posts.includes(article) && hasPostData) {
          posts.push(article)
          console.log(`${'  '.repeat(depth)}    -> Added to posts list`)
        }
      })
      
      // Recursively search in shadow roots
      if (node.querySelectorAll) {
        const allElements = node.querySelectorAll('*')
        console.log(`${'  '.repeat(depth)}Checking ${allElements.length} elements for shadow roots`)
        let shadowRootCount = 0
        for (const el of allElements) {
          if (el.shadowRoot && !visited.has(el.shadowRoot)) {
            shadowRootCount++
            console.log(`${'  '.repeat(depth)}Found shadowRoot in: ${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`)
            searchInNode(el.shadowRoot, depth + 1)
          }
        }
        console.log(`${'  '.repeat(depth)}Explored ${shadowRootCount} shadow roots`)
      }
    } catch (error) {
      console.warn(`Error searching at depth ${depth}:`, error)
    }
  }
  
  // Start search from document and all major container elements
  console.log('=== SEARCHING FROM DOCUMENT ROOT ===')
  searchInNode(document)
  
  // Also search in specific Reddit elements
  console.log('\n=== SEARCHING SPECIFIC REDDIT ELEMENTS ===')
  const redditElements = ['shreddit-app', 'shreddit-feed', 'main', '[role="main"]']
  redditElements.forEach(selector => {
    console.log(`\n--- Searching for: ${selector} ---`)
    const elements = document.querySelectorAll(selector)
    console.log(`Found ${elements.length} elements matching ${selector}`)
    elements.forEach((el, index) => {
      console.log(`  [${index + 1}] ${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}`)
      searchInNode(el)
      if (el.shadowRoot) {
        console.log(`  -> Has shadowRoot, searching within...`)
        searchInNode(el.shadowRoot)
      }
    })
  })
  
  console.log(`\n=== SEARCH COMPLETE ===`)
  console.log(`Aggressive search found ${posts.length} total post elements`)
  return posts
}

// Focused function to extract data from found shreddit-post elements
function extractPostDataFromShredditPosts(shredditPosts) {
  console.log(`🔍 Extracting enhanced data from ${shredditPosts.length} shreddit-post elements...`)
  
  const posts = []
  
  shredditPosts.forEach((post, index) => {
    try {
      console.log(`\n--- Processing post ${index + 1}: ${post.id} ---`)
      
      let searchRoot = post
      
      // Check if post has shadow root
      if (post.shadowRoot) {
        console.log(`🌑 Post ${post.id} has shadow root`)
        searchRoot = post.shadowRoot
      } else {
        console.log(`📄 Post ${post.id} uses normal DOM`)
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
      
      console.log(`🔍 Title element for ${post.id}:`, titleElement)
      if (titleElement) {
        console.log(`🔍 Title element tag:`, titleElement.tagName)
        console.log(`🔍 Title element classes:`, titleElement.className)
        console.log(`🔍 Title element ID:`, titleElement.id)
      }
      
      // Method 5: Look for any link with content
      if (!titleElement) {
        const allLinks = post.querySelectorAll('a')
        for (const link of allLinks) {
          if (link.textContent?.trim().length > 5) {
            titleElement = link
            console.log(`🔗 Found title in fallback link: ${link.textContent?.trim().substring(0, 30)}...`)
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
        
        // Additional metadata
        userId: postAttributes.userId || '',
        permalink: postAttributes.permalink || ''
      }
      
      console.log(`📊 Enhanced post data extracted:`, {
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
      console.error(`❌ Error processing post ${index + 1}:`, error)
    }
  })
  
  console.log(`\n✅ Successfully extracted enhanced data from ${posts.length} posts`)
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
  console.log('Check user status request for:', userName)
  
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
    console.log(`🎯 Found ${shredditPosts.length} shreddit-post elements with IDs`)
    
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
    
    console.log('Enhanced user status check result:', status)
    return status
    
  } catch (error) {
    console.error('Error checking user status:', error)
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
  console.log('Navigating to user profile...')
  
  // Extract username without u/ prefix if present
  const cleanUsername = userName.replace('u/', '')
  const targetUrl = `https://www.reddit.com/user/${cleanUsername}`
  
  // Check if we are already on the correct page
  if (window.location.href.split('?')[0] === targetUrl || 
      window.location.href.split('?')[0] === targetUrl + '/') {
    console.log('Already on user profile page')
    return true
  }
  
  window.location.href = targetUrl
  await new Promise(resolve => setTimeout(resolve, 3000))
  return true
}

// Navigate to posts tab (helper function)
async function navigateToPostsTab() {
  console.log('Navigating to Posts tab...')
  
  if (window.location.pathname.endsWith('/submitted') || 
      window.location.pathname.endsWith('/submitted/')) {
    console.log('Already on submitted/posts page')
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
      console.log('Found Posts tab, clicking...')
      postsTab.click()
      await new Promise(resolve => setTimeout(resolve, 2000))
      return true
    }
  }
  
  return false
}

// Manual trigger function for debugging
window.triggerProfileDataCollection = async function() {
  console.log('🔧 MANUAL TRIGGER: Starting profile data collection...')
  
  try {
    const username = extractUsernameFromPage()
    if (!username) {
      console.log('❌ No username found on current page')
      return { success: false, error: 'No username found' }
    }
    
    console.log(`🔧 MANUAL TRIGGER: Found username: ${username}`)
    
    // Capture posts data directly
    const postsData = await capturePostsData()
    console.log(`🔧 MANUAL TRIGGER: Captured ${postsData.length} posts`)
    
    if (postsData.length > 0) {
      // Store the data
      await storeRedditProfileData(username, postsData)
      console.log('🔧 MANUAL TRIGGER: Data stored successfully')
      
      return { 
        success: true, 
        username: username,
        postsCount: postsData.length,
        samplePost: postsData[0]
      }
    } else {
      console.log('❌ MANUAL TRIGGER: No posts found')
      return { success: false, error: 'No posts found' }
    }
    
  } catch (error) {
    console.error('❌ MANUAL TRIGGER: Error:', error)
    return { success: false, error: error.message }
  }
}

console.log('🔧 Manual trigger available: window.triggerProfileDataCollection()')

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

async function capturePostsData() {
  console.log('Capturing posts data from current page...')
  
  const posts = []
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    // Use only the correct path: shreddit-app -> shreddit-post elements with IDs
    console.log('=== SEARCHING SHREDDIT-APP FOR POSTS ===')
    
    const shredditApp = document.querySelector('shreddit-app')
    if (!shredditApp) {
      console.log('❌ shreddit-app not found')
    } else {
      console.log('✅ Found shreddit-app')
      
      // Find all shreddit-post elements with IDs
      const shredditPosts = Array.from(shredditApp.querySelectorAll('shreddit-post[id^="t3_"]'))
      console.log(`🎯 Found ${shredditPosts.length} shreddit-post elements with IDs`)
      
      if (shredditPosts.length > 0) {
        console.log('🔍 Using enhanced post data extraction...')
        const extractedPosts = extractPostDataFromShredditPosts(shredditPosts)
        console.log(`✅ Enhanced extraction captured ${extractedPosts.length} posts with metadata`)
        
        // Log first post to verify enhanced data
        if (extractedPosts.length > 0) {
          console.log('📊 Sample enhanced post data:', {
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
        
        console.log(`✅ Successfully captured ${posts.length} posts with enhanced metadata`)
        return posts
      }
    }
    
    console.log(`No posts found, attempt ${attempts + 1}/${maxAttempts}`)
    await sleep(1000)
    attempts++
  }
  
  console.log('Failed to find posts after maximum attempts')
  return []
}

// Main profile detection script
async function runProfileDetectionScript() {
  console.log('=== PROFILE DETECTION SCRIPT STARTED ===')
  
  try {
    // Extract username from current page
    const username = extractUsernameFromPage()
    if (!username) {
      console.log('No username found, cannot proceed with profile detection')
      return
    }
    
    console.log('Detected username:', username)
    
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
    console.error('Profile detection script error:', error)
    sessionStorage.removeItem('reddit-post-machine-script-stage')
  }
}

async function continueProfileDataCollection() {
  console.log('=== CONTINUING PROFILE DATA COLLECTION ===')
  
  try {
    const username = extractUsernameFromPage()
    if (!username) {
      console.log('No username found on posts page')
      sessionStorage.removeItem('reddit-post-machine-script-stage')
      return
    }
    
    console.log('Collecting posts data for:', username)
    
    // Capture posts data
    const postsData = await capturePostsData()
    
    if (postsData.length > 0) {
      // Store the profile data
      await storeRedditProfileData(username, postsData)
      console.log('Profile data collection completed successfully')
      
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
        console.log('User status updated with fresh posts data')
        
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
          console.warn('Failed to trigger auto-flow decision analysis:', err)
        })
      }).catch(error => {
        console.error('Failed to update user status:', error)
      })
    } else {
      console.log('No posts data found to store')
      
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
    
    console.log('=== PROFILE DETECTION SCRIPT COMPLETED ===')
    
  } catch (error) {
    console.error('Continue profile data collection error:', error)
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
  console.log(`=== MANUAL TRIGGER: ${scriptType} (mode: ${mode}) ===`)
  
  try {
    if (scriptType === 'profile') {
      // Clear any existing script stage for manual execution
      sessionStorage.removeItem('reddit-post-machine-script-stage')
      console.log('Manually triggering profile detection script')
      await runProfileDetectionScript()
    } else {
      console.log(`Manual trigger for ${scriptType} not handled by stats script`)
    }
  } catch (error) {
    console.error('Manual script trigger error:', error)
  }
}

// Handle extract username and create post (legacy support)
function handleExtractUsernameAndCreatePost() {
  console.log('Handling extract username and create post request')
  
  const username = extractUsernameFromPage()
  if (username) {
    console.log('Extracted username:', username)
    
    // Store username
    chrome.storage.sync.set({
      redditUser: {
        seren_name: username,
        lastCheck: Date.now()
      }
    }).then(() => {
      console.log('Username stored successfully')
    }).catch(error => {
      console.error('Failed to store username:', error)
    })
  }
}

// Handle delete last post request
function handleDeleteLastPost(userName) {
  console.log('Delete last post request for:', userName)
  // This would be implemented if needed for stats functionality
  console.log('Delete last post not implemented in stats script')
}

// Helper function to find and click View Profile when username not found
async function handleUserNotFoundNavigation() {
  console.log('Username not found, attempting automatic navigation to user profile...')
  
  try {
    // Step 1: Find and click user dropdown/avatar button
    const dropdownButton = qs('button[aria-label*="user"], [data-testid="user-avatar"], #expand-user-drawer-button') ||
                           qs('button[aria-label*="u/"]') ||
                           qs('[data-testid="user-dropdown-button"]')
    
    if (!dropdownButton) {
      console.log('User dropdown button not found')
      return false
    }
    
    console.log('Found user dropdown button, clicking to open menu')
    dropdownButton.click()
    await sleep(1000) // Wait for menu to appear
    
    // Step 2: Find and click "View Profile" link in the dropdown menu
    const viewProfileLink = qs('a[href*="/u/"], a[href*="/user/"]') ||
                            qs('[role="menuitem"] a') ||
                            qs('.dropdown-menu a[href*="/"]')
    
    if (!viewProfileLink) {
      console.log('View Profile link not found in dropdown')
      // Try to close dropdown and return false
      document.body.click()
      return false
    }
    
    console.log('Found View Profile link, navigating to user profile')
    const profileUrl = viewProfileLink.href
    
    // Set sessionStorage flag to track navigation state
    sessionStorage.setItem('reddit-post-machine-script-stage', 'profile-navigating')
    sessionStorage.setItem('reddit-post-machine-script-stage-timestamp', Date.now().toString())
    
    window.location.href = profileUrl
    
    // Wait for navigation to complete
    await waitForCondition(() => window.location.href.includes('/u/') || window.location.href.includes('/user/'), 5000)
    
    console.log('Successfully navigated to user profile page')
    return true
    
  } catch (error) {
    console.error('Error during automatic user profile navigation:', error)
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
  console.log('Navigating to Posts tab from profile page...')
  
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
      console.log('Using text-based search for Posts tab')
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
      console.log('🔍 Searching for Posts tab - trying alternative detection methods...')
      // Try to find any clickable element that contains 'posts' in attributes
      const allElements = document.querySelectorAll('*')
      for (const el of allElements) {
        const attributes = el.getAttributeNames()
        for (const attr of attributes) {
          if (el.getAttribute(attr)?.toLowerCase().includes('posts')) {
            postsTab = el
            console.log('Found posts element as fallback:', el.tagName, attr)
            break
          }
        }
        if (postsTab) break
      }
    }
    
    if (!postsTab) {
      console.log('Posts tab not found after all attempts')
      return false
    }
    
    console.log('Found Posts tab, navigating to submitted posts:', postsTab.tagName, postsTab.textContent?.trim())
    
    // Update sessionStorage flag for posts navigation
    sessionStorage.setItem('reddit-post-machine-script-stage', 'profile-switching-to-posts')
    sessionStorage.setItem('reddit-post-machine-script-stage-timestamp', Date.now().toString())
    
    // Try to click the tab first, if that doesn't work, construct URL
    try {
      postsTab.click()
      console.log('Clicked Posts tab, waiting for content to load...')
      
      // Wait longer for posts content to load after clicking Posts tab
      await sleep(3000)
      
      // Check if navigation happened
      if (window.location.href.includes('/submitted')) {
        console.log('Successfully navigated to submitted posts via click')
        return true
      }
    } catch (clickError) {
      console.log('Click failed, trying direct navigation')
    }
    
    // Fallback: construct submitted URL from current username
    const username = extractUsernameFromPage()
    if (username) {
      const postsUrl = `https://www.reddit.com/u/${username}/submitted/`
      console.log('Navigating directly to submitted URL:', postsUrl)
      window.location.href = postsUrl
      
      // Wait for navigation to complete
      await waitForCondition(() => window.location.href.includes('/submitted'), 5000)
      
      console.log('Successfully navigated to submitted posts page')
      return true
    }
    
    return false
    
  } catch (error) {
    console.error('Error navigating to Posts tab:', error)
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
  console.log('Check user status request for:', userName)
  
  try {
    // Check if current user matches the stored user
    let currentUser = extractUsernameFromPage()
    let storedUser = await getStoredUsername()
    
    // If no current user found, attempt automatic navigation
    if (!currentUser) {
      console.log('No username found on current page, attempting automatic navigation')
      
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
        console.log('Automatic navigation to profile successful')
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
          console.log('Automatic navigation to posts successful')
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
    
    console.log('User status check result:', status)
    
    // Store initial status in chrome.storage
    chrome.storage.local.set({
      userStatus: status
    }).then(() => {
      console.log('User status stored in local storage')
    }).catch(error => {
      console.error('Failed to store user status:', error)
    })
    
    // Only collect fresh posts data if we have a current user and data is stale
    if (currentUser && isDataStale) {
      console.log('Collecting fresh posts data for user:', currentUser)
      
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
      console.log('Using cached posts data for user:', currentUser)
    } else {
      console.log('No current user found, cannot collect posts data')
    }
    
  } catch (error) {
    console.error('Error checking user status:', error)
    
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
console.log('Stats content script loaded on URL:', window.location.href)

// Exit early if we're on a submit page (this shouldn't happen but prevents message conflicts)
if (window.location.href.includes('/submit')) {
  console.warn('Stats script loaded on submit page - this should not happen. Exiting early.')
  // Don't set up message listener to avoid conflicts
} else {
  // Initialize username cache from storage
  initializeUsernameCache()
  
  // Only set up message listener if not on submit page
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Stats script received message:', message)
    
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
        
      case 'REDDIT_PAGE_LOADED':
        const currentScriptStage = sessionStorage.getItem('reddit-post-machine-script-stage')
        if (currentScriptStage === 'profile-switching-to-posts' && window.location.href.includes('/submitted')) {
          console.log('Reddit page loaded after navigation, continuing profile data collection')
          setTimeout(() => continueProfileDataCollection(), 2000)
        }
        break
        
      default:
        console.log('Stats script: Unknown message type:', message.type)
    }
  })

  // Check for and clear stale sessionStorage flags (prevent "step is still running" lockups)
  const scriptStage = sessionStorage.getItem('reddit-post-machine-script-stage')
  if (scriptStage) {
    const stageTimestamp = sessionStorage.getItem('reddit-post-machine-script-stage-timestamp')
    if (stageTimestamp && (Date.now() - parseInt(stageTimestamp) > 300000)) { // 5 minutes
      console.log('Clearing stale script stage flag:', scriptStage)
      sessionStorage.removeItem('reddit-post-machine-script-stage')
      sessionStorage.removeItem('reddit-post-machine-script-stage-timestamp')
    }
  }

  // Check if we need to continue profile data collection from previous navigation
  if (scriptStage === 'profile-switching-to-posts' && window.location.href.includes('/submitted')) {
    console.log('Continuing profile data collection from previous navigation')
    setTimeout(() => continueProfileDataCollection(), 2000)
  } else if (scriptStage === 'profile-navigating' && (window.location.href.includes('/u/') || window.location.href.includes('/user/'))) {
    console.log('On profile page after automatic navigation, proceeding to posts')
    setTimeout(() => navigateToPostsFromProfile(), 2000)
  }
}

// Note: Auto-run disabled to prevent automatic tab creation
// Auto-run would be triggered here if needed

// Export default function for Quasar bridge compatibility
export default function (bridge) {
  // This function is called by Quasar's BEX bridge system
  console.log('Stats script bridge initialized', bridge)
}
