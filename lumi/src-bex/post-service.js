/**
 * Post Service Module
 * Handles post generation, API integration, and post creation decision logic
 */

import { AutoFlowStateManager } from './state-manager.js'

/**
 * Post Data Service with real API integration
 * Handles post generation, decision analysis, and result storage
 */
export class PostDataService {
  static async generatePost(agentName) {
    const maxRetries = 3
    const retryDelay = 1000 // 1 second base delay

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `[PostDataService] Generating post for agent: ${agentName} (attempt ${attempt}/${maxRetries})`
        )

        // Get API configuration from storage
        const storageResult = await chrome.storage.sync.get(['apiConfig'])
        const apiConfig = storageResult.apiConfig || {
          endpoint:
            'https://dev.slife.guru/api/method/reddit_postmachine.reddit_postmachine.doctype.subreddit_template.subreddit_template.generate_post_for_agent',
          token: '8fbbf0a7c626e18:e8e4a08a650a5fb'
        }

        const response = await fetch(apiConfig.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${apiConfig.token}`
          },
          body: JSON.stringify({
            agent_name: agentName.replace(/^u\\/, '')
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
              Authorization: `token ${apiConfig.token}`
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
        if (
          data &&
          data.message &&
          data.message.docs &&
          Array.isArray(data.message.docs) &&
          data.message.docs.length > 0
        ) {
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
        await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1)))
      }
    }
  }

  static normalizeLatestPostsData(latestPostsData, userName) {
    if (!latestPostsData) return null
    const posts = latestPostsData?.postsInfo?.posts || latestPostsData?.posts
    if (!Array.isArray(posts)) return null

    const ts = latestPostsData?.lastUpdated || latestPostsData?.timestamp || latestPostsData?.lastUpdate || null

    return {
      userName,
      postsInfo: { posts },
      lastUpdated: ts
    }
  }

  static async shouldCreatePost(postsData) {
    // Save state before decision analysis
    await AutoFlowStateManager.saveState('analyzing_posts', { postsData, userName: postsData?.userName })

    // Create decision report for logging and storage
    const decisionReport = {
      timestamp: new Date().toISOString(),
      totalPosts: postsData?.postsInfo?.posts?.length || 0,
      lastPostAge: null,
      lastPostStatus: 'unknown',
      decision: 'no_create',
      reason: 'no_posts',
      lastPost: postsData?.lastPost || null
    }

    console.log('=== AUTO-FLOW DECISION ANALYSIS ===')
    console.log(`[PostDataService] Analyzing ${decisionReport.totalPosts} posts for auto-flow decision`)

    // Analyze posts to determine if new post is needed
    if (!postsData || !postsData.postsInfo || !postsData.postsInfo.posts || postsData.postsInfo.posts.length === 0) {
      console.log('[PostDataService] ❌ DECISION: No posts found, should create new post')
      decisionReport.decision = 'create'
      decisionReport.reason = 'no_posts'
      this.saveDecisionReport(decisionReport)
      return { shouldCreate: true, reason: 'no_posts', decisionReport }
    }

    const lastPost = postsData.postsInfo.posts[0] // Most recent post
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Calculate post age for reporting
    const postDate = new Date(lastPost.timestamp)
    const ageInHours = (now - postDate) / (1000 * 60 * 60)
    decisionReport.lastPostAge = Math.round(ageInHours * 10) / 10 // Round to 1 decimal

    console.log(`[PostDataService] 📊 Enhanced last post details:`)
    console.log(`   - Title: "${lastPost.title || 'No title'}"`)
    console.log(`   - Age: ${decisionReport.lastPostAge} hours ago`)
    console.log(`   - URL: ${lastPost.url || 'No URL'}`)
    console.log(`   - Author: ${lastPost.author || 'Unknown'}`)
    console.log(`   - Subreddit: ${lastPost.subreddit || 'Unknown'}`)
    console.log(
      `   - Score: ${lastPost.score || 0} | Comments: ${lastPost.commentCount || 0} | Awards: ${lastPost.awardCount || 0}`
    )
    console.log(
      `   - Post Type: ${lastPost.postType || 'Unknown'} | Domain: ${lastPost.domain || 'N/A'}`
    )
    console.log(
      `   - Status: Removed=${lastPost.isRemoved}, Blocked=${lastPost.isBlocked}, Deleted=${lastPost.deleted}`
    )
    console.log(
      `   - Item State: ${lastPost.itemState || 'Unknown'} | View Context: ${lastPost.viewContext || 'Unknown'}`
    )

    // Enhanced decision logic using new metadata

    // Priority 1: Check if post is in UNMODERATED state - wait for moderation
    if (lastPost.itemState === 'UNMODERATED') {
      if (ageInHours <= 1) {
        console.log('[PostDataService] ⏳ DECISION: Last post is under moderation review, should wait')
        decisionReport.decision = 'wait'
        decisionReport.reason = 'under_moderation'
        decisionReport.lastPostStatus = 'unmoderated'
        this.saveDecisionReport(decisionReport)
        return { shouldCreate: false, reason: 'under_moderation', lastPost: lastPost, decisionReport }
      }

      console.log(
        '[PostDataService] ⏰ DECISION: Last post is still unmoderated but older than 1 hour, should create new post'
      )
      decisionReport.decision = 'create'
      decisionReport.reason = 'stale_unmoderated'
      decisionReport.lastPostStatus = 'unmoderated'
      this.saveDecisionReport(decisionReport)
      return { shouldCreate: true, reason: 'stale_unmoderated', lastPost: lastPost, decisionReport }
    }

    // Priority 2: Check if last post has negative score (downvotes)
    if (lastPost.score < 0) {
      console.log('[PostDataService] 👎 DECISION: Last post has negative score, should create new post and delete downvoted post')
      decisionReport.decision = 'create_with_delete'
      decisionReport.reason = 'post_downvoted'
      decisionReport.lastPostStatus = lastPost.isRemoved ? 'removed' : lastPost.isBlocked ? 'blocked' : 'downvoted'
      this.saveDecisionReport(decisionReport)
      return { shouldCreate: true, reason: 'post_downvoted', lastPost: lastPost, decisionReport }
    }

    // Priority 4: Check if last post is removed or blocked by moderators
    if (lastPost.isRemoved || lastPost.isBlocked || lastPost.hasModeratorAction) {
      console.log('[PostDataService] 🚫 DECISION: Last post was removed/blocked, should create new post and delete removed post')
      decisionReport.decision = 'create_with_delete'
      decisionReport.reason = 'post_removed'
      decisionReport.lastPostStatus = lastPost.isRemoved ? 'removed' : lastPost.isBlocked ? 'blocked' : 'moderated'
      this.saveDecisionReport(decisionReport)
      return { shouldCreate: true, reason: 'post_removed', lastPost: lastPost, decisionReport }
    }

    if (ageInHours < 24) {
      console.log('[PostDataService] ✅ DECISION: Last post is recent (< 24h), skipping engagement-based creation')
      decisionReport.decision = 'no_create'
      decisionReport.reason = 'recent_post'
      decisionReport.lastPostStatus = 'active'
      this.saveDecisionReport(decisionReport)
      return { shouldCreate: false, reason: 'recent_post', decisionReport }
    }

    // Priority 5: Check if last post has very low engagement (score + comments)
    const totalEngagement = (lastPost.score || 0) + (lastPost.commentCount || 0)
    if (totalEngagement < 2) {
      console.log(
        '[PostDataService] 📉 DECISION: Last post has very low engagement (< 2), should create new post and delete low-performing post'
      )
      decisionReport.decision = 'create_with_delete'
      decisionReport.reason = 'low_engagement'
      decisionReport.lastPostStatus = 'low_engagement'
      this.saveDecisionReport(decisionReport)
      return { shouldCreate: true, reason: 'low_engagement', lastPost: lastPost, decisionReport }
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

    // Priority 6: Check if last post is blocked or removed by moderator
    if (lastPost.isBlocked || lastPost.isRemoved || lastPost.deleted) {
      const status = lastPost.isRemoved ? 'removed' : lastPost.isBlocked ? 'blocked' : 'deleted'

      // Check if the removed/blocked post is older than one week - if so, preserve it
      if (postDate < oneWeekAgo) {
        console.log(
          `[PostDataService] 🚫 DECISION: Last post is ${status} by moderator but older than one week, should create new post without deletion`
        )
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

  // Save execution result to storage for popup visibility
  static async saveExecutionResult(executionResult) {
    try {
      await chrome.storage.local.set({
        lastExecutionResult: executionResult,
        lastExecutionTimestamp: executionResult.timestamp
      })
      console.log('[PostDataService] 💾 Execution result saved to storage:', executionResult.status, '-', executionResult.postResult)
    } catch (error) {
      console.error('[PostDataService] Failed to save execution result:', error)
    }
  }

  // Keep dummy method as fallback
  static generateDummyPost() {
    const posts = [
      {
        title: 'Amazing sphynx kittens are ready to steal your heart! 🐱',
        body: '#shorts #sphynx #missmermaid #kitten #cat #adorable',
        url: 'https://youtube.com/shorts/0xmhrS_VNNY?si=awYc8i5YljycesXq',
        subreddit: 'sphynx',
        post_type: 'link'
      },
      {
        title: 'Cute sphynx babies capture your heart',
        body: '#shorts #sphynx #missmermaid #kitten #cat #love',
        url: 'https://youtube.com/shorts/dQw4w9WgXcQ?si=randomstring',
        subreddit: 'sphynx',
        post_type: 'link'
      },
      {
        title: 'Hairless beauties showing their playful side! 🎭',
        body: '#shorts #sphynx #missmermaid #playful #cats #funny',
        url: 'https://youtube.com/shorts/playful123?si=example',
        subreddit: 'sphynx',
        post_type: 'link'
      }
    ]

    const randomPost = posts[Math.floor(Math.random() * posts.length)]
    console.log('[PostDataService] Generated dummy post:', randomPost.title)
    return randomPost
  }
}

/**
 * Fetch next post to create
 * Orchestrates post fetching and decision making
 */
export async function fetchNextPost() {
  console.log('[BG] Checking for new posts to create (API service)...')

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
    if (await PostDataService.shouldCreatePost({ userName: agentName })) {
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

