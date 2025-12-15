<template>
  <q-page class="q-pa-md" style="min-width: 350px; min-height: 400px;">
    <!-- Top action buttons -->
    <div class="row q-mb-md q-gutter-sm justify-center">
      <q-btn
        round
        color="primary"
        icon="add"
        size="md"
        @click="createPost"
        :disable="!storedUsername"
        class="shadow-2"
      >
        <q-tooltip>Create New Post</q-tooltip>
      </q-btn>
      
      <q-btn
        v-if="storedUsername"
        round
        color="info"
        icon="info"
        size="md"
        @click="checkUserStatus"
        class="shadow-2"
      >
        <q-tooltip>Check User Status</q-tooltip>
      </q-btn>
    </div>

    <div class="text-center q-mb-md">
      <q-avatar size="60px" class="q-mb-sm">
      </q-avatar>

      <!-- Show username if available, otherwise show app name -->
      <div v-if="storedUsername" class="text-h6 text-primary">{{ storedUsername }}</div>

      <!-- Show status based on username availability -->
      <div v-if="storedUsername" class="text-caption text-positive">
        <q-icon name="check_circle" class="q-mr-xs" />
        Ready to post
      </div>
      <div v-else class="text-caption text-grey-6">
        <q-icon name="account_circle" class="q-mr-xs" />
        No user detected
      </div>

      <!-- Short status line showing last post info -->
      <div v-if="userStatus && storedUsername" class="text-caption text-grey-7 q-mt-xs" style="font-size: 11px;">
        <q-icon name="history" size="xs" class="q-mr-xs" />
        {{ postsCountText }} posts · Last: {{ shortLastPostText }}
      </div>
    </div>
    <q-separator class="q-mb-md" />

    <div class="q-gutter-y-sm">
      <!-- Show detect user button if no username is stored -->
      <q-btn
        v-if="!storedUsername"
        class="full-width"
        color="orange"
        icon="person_search"
        label="Detect Reddit User"
        @click="detectUser"
      />




      <q-btn
        v-if="storedUsername"
        class="full-width q-mt-sm"
        color="primary"
        icon="play_arrow"
        label="Start Auto Flow"
        @click="startAutoFlow"
      />

     

      <!-- Display auto-flow decision report if available -->
      <div v-if="decisionReport" class="q-mt-sm">
        <q-card class="q-pa-sm decision-card">
          <q-card-section class="q-pa-sm">
            <div class="text-subtitle2 decision-title">
              <q-icon :name="getDecisionIcon(decisionReport.decision)" class="q-mr-sm" />
              Auto-Flow Decision
            </div>
            <div class="text-body2 q-mt-xs">
              <div class="decision-item"><strong>Total Posts:</strong> {{ decisionReport.totalPosts }}</div>
              <div v-if="decisionReport.lastPostAge !== null" class="decision-item">
                <strong>Last Post Age:</strong> {{ decisionReport.lastPostAge }} hours ago
              </div>
              <div class="decision-item"><strong>Last Post Status:</strong> 
                <span :class="getStatusClass(decisionReport.lastPostStatus)">
                  {{ formatStatus(decisionReport.lastPostStatus) }}
                </span>
              </div>
              <div class="decision-item"><strong>Decision:</strong> 
                <span :class="getDecisionClass(decisionReport.decision)">
                  {{ formatDecision(decisionReport.decision) }}
                </span>
              </div>
              <div class="decision-item"><strong>Reason:</strong> {{ formatReason(decisionReport.reason) }}</div>
              <div class="text-caption decision-time">
                Analyzed {{ formatTimestamp(decisionReport.timestamp) }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Display auto-flow execution results if available -->
      <div v-if="executionResult" class="q-mt-sm">
        <q-card class="q-pa-sm execution-card">
          <q-card-section class="q-pa-sm">
            <div class="text-subtitle2 execution-title">
              <q-icon :name="getExecutionIcon(executionResult.status)" class="q-mr-sm" />
              Auto-Flow Execution Results
            </div>
            <div class="text-body2 q-mt-xs">
              <div class="execution-item"><strong>Action Taken:</strong> 
                <span :class="getExecutionStatusClass(executionResult.status)">
                  {{ formatExecutionStatus(executionResult.status) }}
                </span>
              </div>
              <div class="execution-item"><strong>Post Result:</strong> 
                <span :class="getPostResultClass(executionResult.postResult)">
                  {{ formatPostResult(executionResult.postResult) }}
                </span>
              </div>
              <div v-if="executionResult.postId" class="execution-item">
                <strong>Post ID:</strong> {{ executionResult.postId }}
              </div>
              <div v-if="executionResult.errorMessage" class="execution-item">
                <strong>Error:</strong> <span class="text-negative">{{ executionResult.errorMessage }}</span>
              </div>
              <div class="text-caption execution-time">
                Executed {{ formatTimestamp(executionResult.timestamp) }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <q-btn
        v-if="storedUsername"
        class="full-width"
        color="negative"
        icon="delete"
        label="Delete Last Post"
        @click="deleteLastPost"
      />


      <q-separator class="q-my-md" />



    </div>

    <div class="q-mt-md text-center">
      <div class="text-caption text-grey-6">
        Extension: <span class="text-positive">Connected</span>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'

export default defineComponent({
  name: 'PopupPage',
  setup() {
    const storedUsername = ref('')
    const userStatus = ref(null)
    const postsData = ref(null)
    const decisionReport = ref(null)
    const executionResult = ref(null)

    const getPostsArray = () => {
      const data = postsData.value
      const posts = data?.posts || data?.postsInfo?.posts
      return Array.isArray(posts) ? posts : []
    }

    const postsCountText = computed(() => {
      const fromStatus = userStatus.value?.postsCount
      if (typeof fromStatus === 'number') return fromStatus
      const data = postsData.value
      const fromTotal = data?.total
      if (typeof fromTotal === 'number') return fromTotal
      const fromTotalPosts = data?.totalPosts
      if (typeof fromTotalPosts === 'number') return fromTotalPosts
      return getPostsArray().length
    })

    // Computed property for short last post text display
    const shortLastPostText = computed(() => {
      const posts = getPostsArray()
      if (posts.length === 0) {
        return 'never'
      }
      try {
        const lastPost = posts[0]
        const lastDate = new Date(lastPost.timestamp)
        const now = new Date()
        const diffMs = now - lastDate
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'today'
        if (diffDays === 1) return 'yesterday'
        if (diffDays < 7) return `${diffDays}d ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
        return lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      } catch {
        return 'unknown'
      }
    })

    // Format last post text for detailed status
    const formatLastPostText = (userStatus) => {
      const posts = getPostsArray()
      if (posts.length === 0) {
        return 'never'
      }
      try {
        const lastPost = posts[0]
        const lastDate = new Date(lastPost.timestamp)
        const now = new Date()
        const diffMs = now - lastDate
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'today'
        if (diffDays === 1) return 'yesterday'
        if (diffDays < 7) return `${diffDays}d ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
        return lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      } catch {
        return 'unknown'
      }
    }

    // Load stored username when popup opens
    const loadStoredUsername = async () => {
      try {
        const response = await new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { type: 'GET_STORED_USERNAME' },
            resolve
          )
        })

        if (response.success && response.data && response.data.seren_name) {
          storedUsername.value = response.data.seren_name
          console.log('Popup: Loaded stored username:', response.data.seren_name)
        } else {
          console.log('Popup: No stored username found')
          storedUsername.value = ''
        }
      } catch (error) {
        console.error('Popup: Error loading stored username:', error)
        storedUsername.value = ''
      }
    }

    // Load decision report when popup opens
    const loadDecisionReport = async () => {
      try {
        const result = await new Promise((resolve) => {
          chrome.storage.local.get(['lastDecisionReport'], resolve)
        })

        if (result.lastDecisionReport) {
          decisionReport.value = result.lastDecisionReport
          console.log('Popup: Loaded decision report:', result.lastDecisionReport)
        } else {
          console.log('Popup: No decision report found')
          decisionReport.value = null
        }
      } catch (error) {
        console.error('Popup: Error loading decision report:', error)
        decisionReport.value = null
      }
    }

    // Load execution result when popup opens
    const loadExecutionResult = async () => {
      try {
        const result = await new Promise((resolve) => {
          chrome.storage.local.get(['lastExecutionResult'], resolve)
        })

        if (result.lastExecutionResult) {
          executionResult.value = result.lastExecutionResult
          console.log('Popup: Loaded execution result:', result.lastExecutionResult)
        } else {
          console.log('Popup: No execution result found')
          executionResult.value = null
        }
      } catch (error) {
        console.error('Popup: Error loading execution result:', error)
        executionResult.value = null
      }
    }

    // Format status for display
    const formatStatus = (status) => {
      const statusMap = {
        'active': '✅ Active',
        'removed': '🚫 Removed',
        'blocked': '⛔ Blocked',
        'deleted': '🗑️ Deleted',
        'unknown': '❓ Unknown'
      }
      return statusMap[status] || status
    }

    // Format decision for display
    const formatDecision = (decision) => {
      const decisionMap = {
        'no_create': '✅ No Action Needed',
        'create': '📝 Create New Post',
        'create_with_delete': '🗑️ Delete & Create New'
      }
      return decisionMap[decision] || decision
    }

    // Format reason for display
    const formatReason = (reason) => {
      const reasonMap = {
        'no_posts': 'No posts found',
        'old_post': 'Last post is older than one week',
        'post_blocked': 'Last post was blocked/removed',
        'post_downvoted': 'Last post has downvotes',
        'recent_post': 'Last post is recent and active'
      }
      return reasonMap[reason] || reason
    }

    // Format execution status for display
    const formatExecutionStatus = (status) => {
      const statusMap = {
        'completed': '✅ Completed',
        'failed': '❌ Failed',
        'skipped': '⏭️ Skipped',
        'in_progress': '🔄 In Progress'
      }
      return statusMap[status] || status
    }

    // Format post result for display
    const formatPostResult = (result) => {
      const resultMap = {
        'created': '📝 Post Created',
        'deleted': '🗑️ Post Deleted',
        'deleted_and_created': '🗑️📝 Deleted & Created',
        'none': '⏸️ No Action Taken',
        'error': '❌ Error Occurred'
      }
      return resultMap[result] || result
    }

    // Get decision card CSS class
    const getDecisionCardClass = (decision) => {
      const classMap = {
        'no_create': 'status-success',
        'create': 'status-warning', 
        'create_with_delete': 'status-error'
      }
      return classMap[decision] || ''
    }

    // Get decision icon
    const getDecisionIcon = (decision) => {
      const iconMap = {
        'no_create': 'check_circle',
        'create': 'add_circle',
        'create_with_delete': 'delete_sweep'
      }
      return iconMap[decision] || 'info'
    }

    // Get status CSS class
    const getStatusClass = (status) => {
      const classMap = {
        'active': 'text-positive',
        'removed': 'text-negative',
        'blocked': 'text-warning',
        'deleted': 'text-negative'
      }
      return classMap[status] || ''
    }

    // Get decision CSS class
    const getDecisionClass = (decision) => {
      const classMap = {
        'no_create': 'text-positive',
        'create': 'text-warning',
        'create_with_delete': 'text-negative'
      }
      return classMap[decision] || ''
    }

    // Get execution icon
    const getExecutionIcon = (status) => {
      const iconMap = {
        'completed': 'check_circle',
        'failed': 'error',
        'skipped': 'skip_next',
        'in_progress': 'refresh'
      }
      return iconMap[status] || 'info'
    }

    // Get execution status CSS class
    const getExecutionStatusClass = (status) => {
      const classMap = {
        'completed': 'text-positive',
        'failed': 'text-negative',
        'skipped': 'text-warning',
        'in_progress': 'text-info'
      }
      return classMap[status] || ''
    }

    // Get post result CSS class
    const getPostResultClass = (result) => {
      const classMap = {
        'created': 'text-positive',
        'deleted': 'text-negative',
        'deleted_and_created': 'text-warning',
        'none': 'text-grey',
        'error': 'text-negative'
      }
      return classMap[result] || ''
    }
    const loadUserStatus = async () => {
      try {
        const response = await new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { type: 'GET_USER_STATUS' },
            resolve
          )
        })

        if (response.success && response.data) {
          userStatus.value = response.data
          console.log('Popup: Loaded user status:', response.data)
          console.log('Popup: User status structure:', JSON.stringify(response.data, null, 2))
          console.log('Popup: currentUser:', response.data.currentUser)
          console.log('Popup: postsCount:', response.data.postsCount)
        } else {
          console.log('Popup: No user status found')
          userStatus.value = null
        }
      } catch (error) {
        console.error('Popup: Error loading user status:', error)
        userStatus.value = null
      }
    }

    const loadPostsData = () => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(['latestPostsData'], (result) => {
                console.log('Popup: Raw storage result:', result);
                if (result.latestPostsData) {
                    postsData.value = result.latestPostsData;
                    console.log('Popup: Loaded posts data from storage:', result.latestPostsData);
                    console.log('Popup: Found', result.latestPostsData.posts?.length || 0, 'posts');
                } else {
                    console.log('Popup: No posts data found in storage');
                    postsData.value = null;
                }
            });
        }
    }

    // Format timestamp for display
    const formatTimestamp = (timestamp) => {
      try {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMinutes = Math.floor((now - date) / (1000 * 60))

        if (diffMinutes < 1) return 'just now'
        if (diffMinutes < 60) return `${diffMinutes}m ago`

        const diffHours = Math.floor(diffMinutes / 60)
        if (diffHours < 24) return `${diffHours}h ago`

        const diffDays = Math.floor(diffHours / 24)
        if (diffDays < 7) return `${diffDays}d ago`

        return date.toLocaleDateString()
      } catch (error) {
        return 'unknown'
      }
    }

    // Load username and user status on component mount
    onMounted(() => {
      loadStoredUsername()
      loadUserStatus()
      loadPostsData()
      loadDecisionReport()
      loadExecutionResult()
    })

    // Listen for messages from content script
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'POSTS_UPDATED') {
                console.log('Popup: Received POSTS_UPDATED message', message.data);
                postsData.value = message.data;
                // Also refresh user status if needed, or mapping logic here
                // For now just extended data
            }
        });
    }

    // Listen for storage changes to update UI when username or status is stored
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.onChanged.addListener((changes, area) => {
        console.log('Popup: Storage changed:', Object.keys(changes), 'Area:', area);
        
        if (changes.redditUser && changes.redditUser.newValue && changes.redditUser.newValue.seren_name) {
          storedUsername.value = changes.redditUser.newValue.seren_name
          console.log('Popup: Username updated via storage listener:', changes.redditUser.newValue.seren_name)
        }
        
        if (changes.userStatus && changes.userStatus.newValue) {
          userStatus.value = changes.userStatus.newValue
          console.log('Popup: User status updated via storage listener:', changes.userStatus.newValue)
        }
        
        // Listen for latestPostsData changes in local storage
        if (area === 'local' && changes.latestPostsData && changes.latestPostsData.newValue) {
          postsData.value = changes.latestPostsData.newValue;
          console.log('Popup: Posts data updated via storage listener');
          console.log('Popup: New posts data:', changes.latestPostsData.newValue);
        }
        
        // Listen for decision report changes in local storage
        if (area === 'local' && changes.lastDecisionReport && changes.lastDecisionReport.newValue) {
          decisionReport.value = changes.lastDecisionReport.newValue;
          console.log('Popup: Decision report updated via storage listener');
          console.log('Popup: New decision report:', changes.lastDecisionReport.newValue);
        }
        
        // Listen for execution result changes in local storage
        if (area === 'local' && changes.lastExecutionResult && changes.lastExecutionResult.newValue) {
          executionResult.value = changes.lastExecutionResult.newValue;
          console.log('Popup: Execution result updated via storage listener');
          console.log('Popup: New execution result:', changes.lastExecutionResult.newValue);
        }
      })
    }
    
    // Manual refresh function for debugging
    const refreshPostsData = () => {
        console.log('Popup: Manual refresh triggered');
        loadPostsData();
        // Also debug all storage contents
        chrome.storage.local.get(null, (allData) => {
            console.log('Popup: All storage contents:', allData);
        });
    }

    const createPost = async () => {
      console.log('Creating new post...')

      // First check if we have a stored username
      if (!storedUsername.value) {
        await loadStoredUsername()
      }

      try {
        // Check if we're already on Reddit
        const currentTab = await getCurrentTab()

        if (currentTab.url && currentTab.url.includes('reddit.com')) {
          // Already on Reddit, use stored username if available or extract from page
          console.log('Already on Reddit, using stored username or extracting from page')
          if (storedUsername.value) {
            // We have a stored username, use background script to create proper submit tab
            console.log('Using background script to create submit tab')
            chrome.runtime.sendMessage({
              type: 'CREATE_POST_FROM_POPUP',
              userName: storedUsername.value
            }).then(response => {
              if (response.success) {
                console.log('Background script created post tab successfully:', response.tabId)
              } else {
                console.error('Failed to create post tab:', response.error)
              }
            }).catch(error => {
              console.error('Error requesting post tab creation:', error)
            })
          } else {
            // No stored username, extract from page first
            await initiatePostCreationOnReddit(currentTab.id)
          }
        } else {
          // Open Reddit first, then get username from page
          console.log('Opening Reddit to extract username')
          await openRedditAndCreatePost()
        }
      } catch (error) {
        console.error('Error in createPost:', error)
      }
    }

    const getCurrentTab = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        return tab
      } catch (error) {
        console.error('Error getting current tab:', error)
        return { url: null, id: null }
      }
    }

    const openRedditAndCreatePost = () => {
      return new Promise((resolve) => {
        // Use centralized tab reuse system instead of creating new tab
        chrome.runtime.sendMessage({
          type: 'CREATE_POST_TAB',
          postData: null // Let background script generate via API
        }).then(response => {
          if (response.success) {
            console.log('Post tab created/reused successfully:', response.tabId)
            resolve()
          } else {
            console.error('Failed to create post tab:', response.error)
            resolve()
          }
        }).catch(error => {
          console.error('Error creating post tab:', error)
          resolve()
        })
      })
    }

    const initiatePostCreationOnReddit = async (tabId) => {
      try {
        // Send message to content script to extract username and start post creation
        chrome.tabs.sendMessage(tabId, {
          type: 'EXTRACT_USERNAME_AND_CREATE_POST'
        })
      } catch (error) {
        console.error('Error communicating with content script:', error)
      }
    }

    const deleteLastPost = async () => {
      console.log('Deleting last post...')

      if (!storedUsername.value) {
        console.log('No username stored, cannot delete last post')
        return
      }

      try {
        // Get current tab and send delete message directly
        const currentTab = await getCurrentTab()
        
        if (currentTab.url && currentTab.url.includes('reddit.com')) {
          console.log('Sending delete message to current tab:', currentTab.id)
          chrome.tabs.sendMessage(currentTab.id, {
            type: 'DELETE_LAST_POST',
            userName: storedUsername.value
          }).then(response => {
            console.log('Delete message sent successfully:', response)
          }).catch(error => {
            console.error('Error sending delete message:', error)
          })
        } else {
          console.log('Current tab is not on Reddit, cannot delete post')
        }
      } catch (error) {
        console.error('Error in deleteLastPost:', error)
      }
    }

    const schedulePost = () => {
      console.log('Scheduling post...')
      // TODO: Open scheduler
    }

    const openSettings = () => {
      console.log('Opening settings...')
      // TODO: Open settings page
    }

    const detectUser = async () => {
      console.log('Manually detecting Reddit user...')

      try {
        // Use centralized tab reuse system for username extraction
        console.log('Using tab reuse to detect user...')
        chrome.runtime.sendMessage({
          type: 'REUSE_REDDIT_TAB',
          url: 'https://www.reddit.com/',
          action: {
            type: 'EXTRACT_USERNAME_AND_CREATE_POST'
          }
        }).then(response => {
          if (response.success) {
            console.log('Tab reused for username detection:', response.tabId)
          } else {
            console.error('Failed to reuse tab for username detection:', response.error)
          }
        }).catch(error => {
          console.error('Error reusing tab for username detection:', error)
        })
      } catch (error) {
        console.error('Error in detectUser:', error)
      }
    }

    const checkUserStatus = async () => {
      console.log('Checking user status and last post date...')

      if (!storedUsername.value) {
        console.log('No username stored, cannot check user status')
        return
      }

      try {
        // Use centralized tab reuse system for status check
        console.log('Using tab reuse to check user status...')
        chrome.runtime.sendMessage({
          type: 'REUSE_REDDIT_TAB',
          url: 'https://www.reddit.com/',
          action: {
            type: 'CHECK_USER_STATUS',
            userName: storedUsername.value
          }
        }).then(response => {
          if (response.success) {
            console.log('Tab reused for status check:', response.tabId)
          } else {
            console.error('Failed to reuse tab for status check:', response.error)
          }
        }).catch(error => {
          console.error('Error reusing tab for status check:', error)
        })
      } catch (error) {
        console.error('Error in checkUserStatus:', error)
      }
    }

    const startAutoFlow = async () => {
      console.log('Starting auto flow manually...')

      if (!storedUsername.value) {
        console.log('No username stored, cannot start auto flow')
        return
      }

      try {
        console.log('Triggering auto flow automation...')
        chrome.runtime.sendMessage({
          type: 'CHECK_USER_STATUS',
          userName: storedUsername.value
        }).then(response => {
          if (response.success) {
            console.log('Auto flow started successfully:', response.message)
            console.log('Tab ID:', response.tabId)
          } else {
            console.error('Failed to start auto flow:', response.error)
          }
        }).catch(error => {
          console.error('Error starting auto flow:', error)
        })
      } catch (error) {
        console.error('Error in startAutoFlow:', error)
      }
    }

    const openHelp = () => {
      console.log('Opening help...')
      // TODO: Open help documentation
    }

    // Test function to create mock execution result
    const testExecutionResult = async () => {
      const mockResult = {
        status: 'completed',
        postResult: 'created',
        postId: 'test12345',
        errorMessage: null,
        timestamp: Date.now()
      }
      
      try {
        await chrome.storage.local.set({ lastExecutionResult: mockResult })
        console.log('Test execution result saved:', mockResult)
        loadExecutionResult()
      } catch (error) {
        console.error('Failed to save test execution result:', error)
      }
    }

    return {
      storedUsername,
      userStatus,
      postsData,
      decisionReport,
      executionResult,
      postsCountText,
      shortLastPostText,
      formatLastPostText,
      formatTimestamp,
      formatStatus,
      formatDecision,
      formatReason,
      formatExecutionStatus,
      formatPostResult,
      getDecisionCardClass,
      getDecisionIcon,
      getStatusClass,
      getDecisionClass,
      getExecutionIcon,
      getExecutionStatusClass,
      getPostResultClass,
      createPost,
      detectUser,
      checkUserStatus,
      startAutoFlow,
      deleteLastPost,
      schedulePost,
      openSettings,
      openHelp,
      refreshPostsData,
      testExecutionResult
    }
  }
})
</script>

<style lang="scss" scoped>
.status-card {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.status-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: white;
}

.status-item {
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.95);
}

.status-time {
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 11px;
}

.decision-card {
  background: linear-gradient(135deg, #43a047 0%, #66bb6a 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(67, 160, 71, 0.3);
}

.decision-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: white;
}

.decision-item {
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.95);
}

.decision-time {
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 11px;
}

.execution-card {
  background: linear-gradient(135deg, #7e57c2 0%, #9575cd 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(126, 87, 194, 0.3);
}

.execution-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: white;
}

.execution-item {
  margin-bottom: 4px;
  color: rgba(255, 255, 255, 0.95);
}

.execution-time {
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 11px;
}

.text-positive {
  color: #4caf50 !important;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  border: 1px solid #4caf50;
}

.text-negative {
  color: #f44336 !important;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  border: 1px solid #f44336;
}

.text-warning {
  color: #ff9800 !important;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  border: 1px solid #ff9800;
}
</style>
