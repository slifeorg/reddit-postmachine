import { postServiceLogger } from "./logger.js";/**
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

    // Remove u/ prefix if present
    const cleanAgentName = agentName.replace(/^u\//, '')

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        postServiceLogger.log(
          `[PostDataService] Generating post for agent: ${cleanAgentName} (attempt ${attempt}/${maxRetries})`
        )

        // Get API configuration from storage
        const storageResult = await chrome.storage.sync.get(['apiConfig'])
        const apiConfig = storageResult.apiConfig || {
          endpoint:
            'https://32016-51127.bacloud.info/api/method/reddit_postmachine.reddit_postmachine.doctype.subreddit_template.subreddit_template.generate_post_for_agent',
         	 token: '8fbbf0a7c626e18:2c3693fb52ac66f'
        }

        const requestBody = {
          agent_name: cleanAgentName
        }

        postServiceLogger.log('[PostDataService] API Request Details:', {
          endpoint: apiConfig.endpoint,
          agentName: cleanAgentName,
          body: requestBody
        })

        const response = await fetch(apiConfig.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${apiConfig.token}`
          },
          body: JSON.stringify(requestBody)
        })

        let data
        try {
          data = await response.json()
        } catch (e) {
          postServiceLogger.error('[PostDataService] Failed to parse response as JSON:', e)
          throw new Error(`API request failed: ${response.status} ${response.statusText} - Invalid JSON response`)
        }

        if (!response.ok) {
          let errorDetails = `${response.status} ${response.statusText}`
          postServiceLogger.error('[PostDataService] API Error Response:', data)
          errorDetails += ` - ${JSON.stringify(data)}`
          throw new Error(`API request failed: ${errorDetails}`)
        }

        postServiceLogger.log('[PostDataService] Generated post from API:', data)

        // Handle new API response format with post_name
        if (data && data.message && data.message.status === 'success' && data.message.post_name) {
          postServiceLogger.log('[PostDataService] Received post_name, fetching full post data:', data.message.post_name)

          // Second API call to get full post data using Frappe REST API
          const postName = data.message.post_name
          const frappeEndpoint = `https://32016-51127.bacloud.info/api/resource/Reddit%20Post/${postName}`

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
          postServiceLogger.log('[PostDataService] Fetched full post data from Frappe:', frappeData)

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
        postServiceLogger.error(`[PostDataService] API call failed (attempt ${attempt}/${maxRetries}):`, error)

        if (attempt === maxRetries) {
          // Final attempt failed, throw error instead of using fallback
          const errorMessage = `Failed to generate post after ${maxRetries} attempts: ${error.message}`
          postServiceLogger.error('[PostDataService] ' + errorMessage)
          throw new Error(errorMessage)
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

    // Check if there's a recently deleted post to filter out
    const userName = postsData?.userName
    let deletedPostId = null
    if (userName) {
      const deletedPostKey = `deletedPost_${userName}`
      const deletedPostData = await chrome.storage.local.get([deletedPostKey])
      if (deletedPostData[deletedPostKey]) {
        const deletedInfo = deletedPostData[deletedPostKey]
        // Only consider it if deleted within last 10 minutes
        if (Date.now() - deletedInfo.timestamp < 10 * 60 * 1000) {
          deletedPostId = deletedInfo.postId
          postServiceLogger.log(`[PostDataService] 🗑️ Filtering out recently deleted post: ${deletedPostId}`)
        } else {
          // Clean up old deleted post record
          await chrome.storage.local.remove([deletedPostKey])
        }
      }
    }

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

    postServiceLogger.log('=== AUTO-FLOW DECISION ANALYSIS ===')
    postServiceLogger.log(`[PostDataService] Analyzing ${decisionReport.totalPosts} posts for auto-flow decision`)

    // Filter out the deleted post if present
    let postsToAnalyze = postsData?.postsInfo?.posts || []
    if (deletedPostId && postsToAnalyze.length > 0) {
      const originalLength = postsToAnalyze.length
      postsToAnalyze = postsToAnalyze.filter(post => post.id !== deletedPostId)
      if (postsToAnalyze.length !== originalLength) {
        postServiceLogger.log(`[PostDataService] 🗑️ Filtered out deleted post. Posts before: ${originalLength}, after: ${postsToAnalyze.length}`)
      }
    }

    // Analyze posts to determine if new post is needed
    if (!postsData || !postsData.postsInfo || postsToAnalyze.length === 0) {
      postServiceLogger.log('[PostDataService] ❌ DECISION: No posts found (after filtering deleted post), should create new post')
      decisionReport.decision = 'create'
      decisionReport.reason = 'no_posts'
      this.saveDecisionReport(decisionReport)
      return { shouldCreate: true, reason: 'no_posts', decisionReport }
    }

    const lastPost = postsToAnalyze[0] // Most recent post after filtering
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Calculate post age for reporting
    const postDate = new Date(lastPost.timestamp)
    const ageInHours = (now - postDate) / (1000 * 60 * 60)
    decisionReport.lastPostAge = Math.round(ageInHours * 10) / 10 // Round to 1 decimal

    postServiceLogger.log(`[PostDataService] 📊 Enhanced last post details:`)
    postServiceLogger.log(`   - Title: "${lastPost.title || 'No title'}"`)
    postServiceLogger.log(`   - Age: ${decisionReport.lastPostAge} hours ago`)
    postServiceLogger.log(`   - URL: ${lastPost.url || 'No URL'}`)
    postServiceLogger.log(`   - Author: ${lastPost.author || 'Unknown'}`)
    postServiceLogger.log(`   - Subreddit: ${lastPost.subreddit || 'Unknown'}`)
    postServiceLogger.log(
      `   - Score: ${lastPost.score || 0} | Comments: ${lastPost.commentCount || 0} | Awards: ${lastPost.awardCount || 0}`
    )
    postServiceLogger.log(
      `   - Post Type: ${lastPost.postType || 'Unknown'} | Domain: ${lastPost.domain || 'N/A'}`
    )
    postServiceLogger.log(
      `   - Status: Removed=${lastPost.moderationStatus.isRemoved}, Blocked=${lastPost.moderationStatus.isBlocked}, Deleted=${lastPost.deleted}`
    )
    postServiceLogger.log(
      `   - Item State: ${lastPost.itemState || 'Unknown'} | View Context: ${lastPost.viewContext || 'Unknown'}`
    )

    // Enhanced decision logic using new metadata

    // Priority 1: Check if last post is removed or blocked by moderators
    // If removed by moderators, we should delete it first before creating a new post
    if (lastPost.moderationStatus.isRemoved || lastPost.moderationStatus.isBlocked || lastPost.hasModeratorAction) {
      if (lastPost.moderationStatus.isRemoved) {
        // Post is removed by moderators, delete it first before creating new post
        postServiceLogger.log('[PostDataService] 🗑️ DECISION: Last post was removed by moderators, should delete it first then create new post')
        decisionReport.decision = 'create_with_delete'
        decisionReport.reason = 'post_removed_by_moderator'
        decisionReport.lastPostStatus = 'removed'
        this.saveDecisionReport(decisionReport)
        return { shouldCreate: true, reason: 'post_removed_by_moderator', lastPost: lastPost, decisionReport }
      } else {
        // Post is blocked or has other moderator action, try to delete it
        postServiceLogger.log('[PostDataService] 🗑️ DECISION: Last post was blocked/moderated, should delete it first then create new post')
        decisionReport.decision = 'create_with_delete'
        decisionReport.reason = 'post_blocked'
        decisionReport.lastPostStatus = lastPost.isBlocked ? 'blocked' : 'moderated'
        this.saveDecisionReport(decisionReport)
        return { shouldCreate: true, reason: 'post_blocked', lastPost: lastPost, decisionReport }
      }
    }

    // Priority 2: Check if post is in UNMODERATED state - wait for moderation (only if not removed/blocked)
    if (lastPost.itemState === 'UNMODERATED') {
      if (ageInHours <= 1) {
        postServiceLogger.log('[PostDataService] ⏳ DECISION: Last post is under moderation review, should wait')
        decisionReport.decision = 'wait'
        decisionReport.reason = 'under_moderation'
        decisionReport.lastPostStatus = 'unmoderated'
        this.saveDecisionReport(decisionReport)
        return { shouldCreate: false, reason: 'under_moderation', lastPost: lastPost, decisionReport }
      }

      postServiceLogger.log(
        '[PostDataService] ⏰ DECISION: Last post is still unmoderated but older than 1 hour, should create new post'
      )
      decisionReport.decision = 'create'
      decisionReport.reason = 'stale_unmoderated'
      decisionReport.lastPostStatus = 'unmoderated'
      this.saveDecisionReport(decisionReport)
      return { shouldCreate: true, reason: 'stale_unmoderated', lastPost: lastPost, decisionReport }
    }

    // Priority 3: Check if last post has negative score (downvotes)
    if (lastPost.score < 0) {
      postServiceLogger.log('[PostDataService] 👎 DECISION: Last post has negative score, should create new post and delete downvoted post')
      decisionReport.decision = 'create_with_delete'
      decisionReport.reason = 'post_downvoted'
      decisionReport.lastPostStatus = lastPost.isRemoved ? 'removed' : lastPost.isBlocked ? 'blocked' : 'downvoted'
      this.saveDecisionReport(decisionReport)
      return { shouldCreate: true, reason: 'post_downvoted', lastPost: lastPost, decisionReport }
    }

    if (ageInHours < 24) {
      postServiceLogger.log('[PostDataService] ✅ DECISION: Last post is recent (< 24h), skipping engagement-based creation')
      decisionReport.decision = 'no_create'
      decisionReport.reason = 'recent_post'
      decisionReport.lastPostStatus = 'active'
      this.saveDecisionReport(decisionReport)
      return { shouldCreate: false, reason: 'recent_post', decisionReport }
    }

    // Priority 5: Check if last post has very low engagement (score + comments)
    const totalEngagement = (lastPost.score || 0) + (lastPost.commentCount || 0)
    if (totalEngagement < 2) {
      postServiceLogger.log(
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
      postServiceLogger.log('[PostDataService] ⏰ DECISION: Last post is older than one week, should create new post without deletion')
      decisionReport.decision = 'create'
      decisionReport.reason = 'old_post'
      decisionReport.lastPostStatus = lastPost.isRemoved ? 'removed' : lastPost.isBlocked ? 'blocked' : 'active'
      this.saveDecisionReport(decisionReport)
      return { shouldCreate: true, reason: 'old_post', lastPost: lastPost, decisionReport }
    }

    postServiceLogger.log('[PostDataService] ✅ DECISION: Last post is recent and active, no new post needed')
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
      postServiceLogger.log('[PostDataService] 💾 Decision report saved to storage:', decisionReport.decision)
    } catch (error) {
      postServiceLogger.error('[PostDataService] Failed to save decision report:', error)
    }
  }

  // Save execution result to storage for popup visibility
  static async saveExecutionResult(executionResult) {
    try {
      await chrome.storage.local.set({
        lastExecutionResult: executionResult,
        lastExecutionTimestamp: executionResult.timestamp
      })
      postServiceLogger.log('[PostDataService] 💾 Execution result saved to storage:', executionResult.status, '-', executionResult.postResult)
    } catch (error) {
      postServiceLogger.error('[PostDataService] Failed to save execution result:', error)
    }
  }

  // Update post status (and optionally Reddit metadata) using Frappe REST API
  // extraFields is an optional object, e.g. { reddit_post_url, reddit_post_id, posted_at }
  static async updatePostStatus(postName, status = 'Posted', extraFields = null) {
    try {
      postServiceLogger.log(
        `[PostDataService] Updating post ${postName} status to: ${status}`,
        extraFields ? { extraFields } : {}
      )

      // Get API configuration from storage
      const storageResult = await chrome.storage.sync.get(['apiConfig'])
      const apiConfig = storageResult.apiConfig || {
        token: '8fbbf0a7c626e18:2c3693fb52ac66f'
      }

      // Use Frappe REST API to update the document
      const updateEndpoint = `https://32016-51127.bacloud.info/api/resource/Reddit%20Post/${postName}`

      const updateData = {
        status: status
      }

      // Shallow-merge any extra fields so extension can also push reddit_post_url/id
      if (extraFields && typeof extraFields === 'object') {
        Object.assign(updateData, extraFields)
      }

      const response = await fetch(updateEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${apiConfig.token}`
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error(`Failed to update post status: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      postServiceLogger.log(`[PostDataService] ✅ Post status/metadata updated successfully:`, result)
      return result
    } catch (error) {
      postServiceLogger.error('[PostDataService] Failed to update post status/metadata:', error)
      throw error
    }
  }


}

/**
 * Fetch next post to create
 * Orchestrates post fetching and decision making
 */
export async function fetchNextPost() {
  postServiceLogger.log('[BG] Checking for new posts to create (API service)...')

  try {
    // Get stored username to use as agent name
    const syncResult = await chrome.storage.sync.get(['redditUser'])
    const localResult = await chrome.storage.local.get(['redditUser'])
    const redditUser = syncResult.redditUser || localResult.redditUser

    if (!redditUser || !redditUser.seren_name) {
      postServiceLogger.log('[BG] No username found, skipping API call')
      return null
    }

    const agentName = redditUser.seren_name
    const cleanAgentName = agentName.replace(/^u\//, '')
    postServiceLogger.log(`[BG] Using agent name: ${agentName} (cleaned: ${cleanAgentName})`)

    // Check if we should create a post
    if (await PostDataService.shouldCreatePost({ userName: agentName })) {
      const postData = await PostDataService.generatePost(cleanAgentName)
      postServiceLogger.log('[BG] API service says: CREATE POST')
      return postData
    }

    postServiceLogger.log('[BG] API service says: NO POST NEEDED')
    return null
  } catch (error) {
    postServiceLogger.error('[BG] Error in fetchNextPost:', error)
    return null
  }
}

