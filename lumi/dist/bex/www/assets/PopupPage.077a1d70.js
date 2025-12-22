import { _ as _export_sfc, d as defineComponent, r as ref, C as computed, D as onMounted, o as openBlock, c as createBlock, w as withCtx, v as QPage_default, f as createCommentVNode, x as createBaseVNode, a as createVNode, E as QTooltip_default, h as createTextVNode, z as QBtn_default, n as createElementBlock, t as toDisplayString, e as QIcon_default, F as Fragment, G as QSeparator_default, A as QCardSection_default, H as normalizeClass, B as QCard_default } from "./index.3b1eadad.js";
var PopupPage_vue_vue_type_style_index_0_scoped_true_lang = "";
const _sfc_main = defineComponent({
  name: "PopupPage",
  setup() {
    const storedUsername = ref("");
    const userStatus = ref(null);
    const postsData = ref(null);
    const decisionReport = ref(null);
    const executionResult = ref(null);
    const getPostsArray = () => {
      const data = postsData.value;
      const posts = data?.posts || data?.postsInfo?.posts;
      return Array.isArray(posts) ? posts : [];
    };
    const postsCountText = computed(() => {
      const fromStatus = userStatus.value?.postsCount;
      if (typeof fromStatus === "number") {
        console.log("Popup: Using postsCount from userStatus:", fromStatus);
        return fromStatus;
      }
      const data = postsData.value;
      const fromTotal = data?.total;
      if (typeof fromTotal === "number") {
        console.log("Popup: Using total from data:", fromTotal);
        return fromTotal;
      }
      const fromTotalPosts = data?.totalPosts;
      if (typeof fromTotalPosts === "number") {
        console.log("Popup: Using totalPosts from data:", fromTotalPosts);
        return fromTotalPosts;
      }
      const postsArrayLength = getPostsArray().length;
      console.log("Popup: Using posts array length:", postsArrayLength);
      console.log("Popup: postsData.value:", data);
      console.log("Popup: postsInfo?.posts:", data?.postsInfo?.posts);
      return postsArrayLength;
    });
    const shortLastPostText = computed(() => {
      const posts = getPostsArray();
      if (posts.length === 0) {
        return "never";
      }
      try {
        const lastPost = posts[0];
        const lastDate = new Date(lastPost.timestamp);
        const now = new Date();
        const diffMs = now - lastDate;
        const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
        if (diffDays === 0)
          return "today";
        if (diffDays === 1)
          return "yesterday";
        if (diffDays < 7)
          return `${diffDays}d ago`;
        if (diffDays < 30)
          return `${Math.floor(diffDays / 7)}w ago`;
        return lastDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } catch {
        return "unknown";
      }
    });
    const formatLastPostText = (userStatus2) => {
      const posts = getPostsArray();
      if (posts.length === 0) {
        return "never";
      }
      try {
        const lastPost = posts[0];
        const lastDate = new Date(lastPost.timestamp);
        const now = new Date();
        const diffMs = now - lastDate;
        const diffDays = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
        if (diffDays === 0)
          return "today";
        if (diffDays === 1)
          return "yesterday";
        if (diffDays < 7)
          return `${diffDays}d ago`;
        if (diffDays < 30)
          return `${Math.floor(diffDays / 7)}w ago`;
        return lastDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } catch {
        return "unknown";
      }
    };
    const loadStoredUsername = async () => {
      try {
        const response = await new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { type: "GET_STORED_USERNAME" },
            resolve
          );
        });
        if (response.success && response.data && response.data.seren_name) {
          storedUsername.value = response.data.seren_name;
          console.log("Popup: Loaded stored username:", response.data.seren_name);
        } else {
          console.log("Popup: No stored username found");
          storedUsername.value = "";
        }
      } catch (error) {
        console.error("Popup: Error loading stored username:", error);
        storedUsername.value = "";
      }
    };
    const loadDecisionReport = async () => {
      try {
        const result = await new Promise((resolve) => {
          chrome.storage.local.get(["lastDecisionReport"], resolve);
        });
        if (result.lastDecisionReport) {
          decisionReport.value = result.lastDecisionReport;
          console.log("Popup: Loaded decision report:", result.lastDecisionReport);
        } else {
          console.log("Popup: No decision report found");
          decisionReport.value = null;
        }
      } catch (error) {
        console.error("Popup: Error loading decision report:", error);
        decisionReport.value = null;
      }
    };
    const loadExecutionResult = async () => {
      try {
        const result = await new Promise((resolve) => {
          chrome.storage.local.get(["lastExecutionResult"], resolve);
        });
        if (result.lastExecutionResult) {
          executionResult.value = result.lastExecutionResult;
          console.log("Popup: Loaded execution result:", result.lastExecutionResult);
        } else {
          console.log("Popup: No execution result found");
          executionResult.value = null;
        }
      } catch (error) {
        console.error("Popup: Error loading execution result:", error);
        executionResult.value = null;
      }
    };
    const formatStatus = (status) => {
      const statusMap = {
        active: "Active",
        removed: "Removed",
        blocked: "Blocked",
        deleted: "Deleted",
        unknown: "Unknown"
      };
      return statusMap[status] || status;
    };
    const formatDecision = (decision) => {
      const decisionMap = {
        no_create: "No Action Needed",
        create: "Create New Post",
        create_with_delete: "Delete & Create New"
      };
      return decisionMap[decision] || decision;
    };
    const formatReason = (reason) => {
      const reasonMap = {
        "no_posts": "No posts found",
        "old_post": "Last post is older than one week",
        "post_blocked": "Last post was blocked/removed",
        "post_downvoted": "Last post has downvotes",
        "recent_post": "Last post is recent and active"
      };
      return reasonMap[reason] || reason;
    };
    const formatExecutionStatus = (status) => {
      const statusMap = {
        completed: "Completed",
        failed: "Failed",
        skipped: "Skipped",
        in_progress: "In Progress"
      };
      return statusMap[status] || status;
    };
    const formatPostResult = (result) => {
      const resultMap = {
        created: "Post Created",
        deleted: "Post Deleted",
        deleted_and_created: "Deleted & Created",
        none: "No Action Taken",
        error: "Error Occurred"
      };
      return resultMap[result] || result;
    };
    const getDecisionCardClass = (decision) => {
      const classMap = {
        "no_create": "status-success",
        "create": "status-warning",
        "create_with_delete": "status-error"
      };
      return classMap[decision] || "";
    };
    const getDecisionIcon = (decision) => {
      const iconMap = {
        "no_create": "check_circle",
        "create": "add_circle",
        "create_with_delete": "delete_sweep"
      };
      return iconMap[decision] || "info";
    };
    const getStatusClass = (status) => {
      const classMap = {
        "active": "text-positive",
        "removed": "text-negative",
        "blocked": "text-warning",
        "deleted": "text-negative"
      };
      return classMap[status] || "";
    };
    const getDecisionClass = (decision) => {
      const classMap = {
        "no_create": "text-positive",
        "create": "text-warning",
        "create_with_delete": "text-negative"
      };
      return classMap[decision] || "";
    };
    const getExecutionIcon = (status) => {
      const iconMap = {
        "completed": "check_circle",
        "failed": "error",
        "skipped": "skip_next",
        "in_progress": "refresh"
      };
      return iconMap[status] || "info";
    };
    const getExecutionStatusClass = (status) => {
      const classMap = {
        "completed": "text-positive",
        "failed": "text-negative",
        "skipped": "text-warning",
        "in_progress": "text-info"
      };
      return classMap[status] || "";
    };
    const getPostResultClass = (result) => {
      const classMap = {
        "created": "text-positive",
        "deleted": "text-negative",
        "deleted_and_created": "text-warning",
        "none": "text-grey",
        "error": "text-negative"
      };
      return classMap[result] || "";
    };
    const loadUserStatus = async () => {
      try {
        const response = await new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { type: "GET_USER_STATUS" },
            resolve
          );
        });
        if (response.success && response.data) {
          userStatus.value = response.data;
          console.log("Popup: Loaded user status:", response.data);
          console.log("Popup: User status structure:", JSON.stringify(response.data, null, 2));
          console.log("Popup: currentUser:", response.data.currentUser);
          console.log("Popup: postsCount:", response.data.postsCount);
        } else {
          console.log("Popup: No user status found");
          userStatus.value = null;
        }
      } catch (error) {
        console.error("Popup: Error loading user status:", error);
        userStatus.value = null;
      }
    };
    const loadPostsData = () => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(["latestPostsData"], (result) => {
          console.log("Popup: Raw storage result:", result);
          if (result.latestPostsData) {
            postsData.value = result.latestPostsData;
            console.log("Popup: Loaded posts data from storage:", result.latestPostsData);
            console.log("Popup: postsInfo:", result.latestPostsData.postsInfo);
            console.log("Popup: postsInfo.posts:", result.latestPostsData.postsInfo?.posts);
            console.log("Popup: Found", result.latestPostsData.postsInfo?.posts?.length || 0, "posts");
            console.log("Popup: postsInfo.total:", result.latestPostsData.postsInfo?.total);
          } else {
            console.log("Popup: No posts data found in storage");
            postsData.value = null;
          }
        });
      }
    };
    const formatTimestamp = (timestamp) => {
      try {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / (1e3 * 60));
        if (diffMinutes < 1)
          return "just now";
        if (diffMinutes < 60)
          return `${diffMinutes}m ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24)
          return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7)
          return `${diffDays}d ago`;
        return date.toLocaleDateString();
      } catch (error) {
        return "unknown";
      }
    };
    onMounted(() => {
      loadStoredUsername();
      loadUserStatus();
      loadPostsData();
      loadDecisionReport();
      loadExecutionResult();
      setTimeout(() => {
        loadExecutionResult();
        console.log("Popup: Reloaded execution result after delay");
      }, 500);
    });
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "POSTS_UPDATED") {
          console.log("Popup: Received POSTS_UPDATED message", message.data);
          postsData.value = message.data;
        }
      });
    }
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.onChanged.addListener((changes, area) => {
        console.log("Popup: Storage changed:", Object.keys(changes), "Area:", area);
        if (changes.redditUser && changes.redditUser.newValue && changes.redditUser.newValue.seren_name) {
          storedUsername.value = changes.redditUser.newValue.seren_name;
          console.log("Popup: Username updated via storage listener:", changes.redditUser.newValue.seren_name);
        }
        if (changes.userStatus && changes.userStatus.newValue) {
          userStatus.value = changes.userStatus.newValue;
          console.log("Popup: User status updated via storage listener:", changes.userStatus.newValue);
        }
        if (area === "local" && changes.latestPostsData && changes.latestPostsData.newValue) {
          postsData.value = changes.latestPostsData.newValue;
          console.log("Popup: Posts data updated via storage listener");
          console.log("Popup: New posts data:", changes.latestPostsData.newValue);
        }
        if (area === "local" && changes.lastDecisionReport && changes.lastDecisionReport.newValue) {
          decisionReport.value = changes.lastDecisionReport.newValue;
          console.log("Popup: Decision report updated via storage listener");
          console.log("Popup: New decision report:", changes.lastDecisionReport.newValue);
        }
        if (area === "local" && changes.lastExecutionResult && changes.lastExecutionResult.newValue) {
          executionResult.value = changes.lastExecutionResult.newValue;
          console.log("Popup: Execution result updated via storage listener");
          console.log("Popup: New execution result:", changes.lastExecutionResult.newValue);
        }
      });
    }
    const refreshPostsData = () => {
      console.log("Popup: Manual refresh triggered");
      loadPostsData();
      chrome.storage.local.get(null, (allData) => {
        console.log("Popup: All storage contents:", allData);
      });
    };
    const createPost = async () => {
      console.log("Creating new post...");
      if (!storedUsername.value) {
        await loadStoredUsername();
      }
      try {
        const currentTab = await getCurrentTab();
        if (currentTab.url && currentTab.url.includes("reddit.com")) {
          console.log("Already on Reddit, using stored username or extracting from page");
          if (storedUsername.value) {
            console.log("Using background script to create submit tab");
            chrome.runtime.sendMessage({
              type: "CREATE_POST_FROM_POPUP",
              userName: storedUsername.value
            }).then((response) => {
              if (response.success) {
                console.log("Background script created post tab successfully:", response.tabId);
              } else {
                console.error("Failed to create post tab:", response.error);
              }
            }).catch((error) => {
              console.error("Error requesting post tab creation:", error);
            });
          } else {
            await initiatePostCreationOnReddit(currentTab.id);
          }
        } else {
          console.log("Opening Reddit to extract username");
          await openRedditAndCreatePost();
        }
      } catch (error) {
        console.error("Error in createPost:", error);
      }
    };
    const getCurrentTab = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab;
      } catch (error) {
        console.error("Error getting current tab:", error);
        return { url: null, id: null };
      }
    };
    const openRedditAndCreatePost = () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: "CREATE_POST_TAB",
          postData: null
        }).then((response) => {
          if (response.success) {
            console.log("Post tab created/reused successfully:", response.tabId);
            resolve();
          } else {
            console.error("Failed to create post tab:", response.error);
            resolve();
          }
        }).catch((error) => {
          console.error("Error creating post tab:", error);
          resolve();
        });
      });
    };
    const initiatePostCreationOnReddit = async (tabId) => {
      try {
        chrome.tabs.sendMessage(tabId, {
          type: "EXTRACT_USERNAME_AND_CREATE_POST"
        });
      } catch (error) {
        console.error("Error communicating with content script:", error);
      }
    };
    const deleteLastPost = async () => {
      console.log("Deleting last post...");
      if (!storedUsername.value) {
        console.log("No username stored, cannot delete last post");
        return;
      }
      try {
        const currentTab = await getCurrentTab();
        if (currentTab.url && currentTab.url.includes("reddit.com")) {
          console.log("Sending delete message to current tab:", currentTab.id);
          chrome.tabs.sendMessage(currentTab.id, {
            type: "DELETE_LAST_POST",
            userName: storedUsername.value
          }).then((response) => {
            console.log("Delete message sent successfully:", response);
          }).catch((error) => {
            console.error("Error sending delete message:", error);
          });
        } else {
          console.log("Current tab is not on Reddit, cannot delete post");
        }
      } catch (error) {
        console.error("Error in deleteLastPost:", error);
      }
    };
    const schedulePost = () => {
      console.log("Scheduling post...");
    };
    const openSettings = () => {
      console.log("Opening settings...");
    };
    const detectUser = async () => {
      console.log("Manually detecting Reddit user...");
      try {
        console.log("Using tab reuse to detect user...");
        chrome.runtime.sendMessage({
          type: "REUSE_REDDIT_TAB",
          url: "https://www.reddit.com/",
          action: {
            type: "EXTRACT_USERNAME_AND_CREATE_POST"
          }
        }).then((response) => {
          if (response.success) {
            console.log("Tab reused for username detection:", response.tabId);
          } else {
            console.error("Failed to reuse tab for username detection:", response.error);
          }
        }).catch((error) => {
          console.error("Error reusing tab for username detection:", error);
        });
      } catch (error) {
        console.error("Error in detectUser:", error);
      }
    };
    const checkUserStatus = async () => {
      console.log("Checking user status and last post date...");
      if (!storedUsername.value) {
        console.log("No username stored, cannot check user status");
        return;
      }
      try {
        console.log("Using tab reuse to check user status...");
        chrome.runtime.sendMessage({
          type: "REUSE_REDDIT_TAB",
          url: "https://www.reddit.com/",
          action: {
            type: "CHECK_USER_STATUS",
            userName: storedUsername.value
          }
        }).then((response) => {
          if (response.success) {
            console.log("Tab reused for status check:", response.tabId);
          } else {
            console.error("Failed to reuse tab for status check:", response.error);
          }
        }).catch((error) => {
          console.error("Error reusing tab for status check:", error);
        });
      } catch (error) {
        console.error("Error in checkUserStatus:", error);
      }
    };
    const startAutoFlow = async () => {
      console.log("Starting auto flow manually...");
      if (!storedUsername.value) {
        console.log("No username stored, cannot start auto flow");
        return;
      }
      try {
        console.log("Triggering auto flow automation...");
        chrome.runtime.sendMessage({
          type: "CHECK_USER_STATUS",
          userName: storedUsername.value
        }).then((response) => {
          if (response.success) {
            console.log("Auto flow started successfully:", response.message);
            console.log("Tab ID:", response.tabId);
          } else {
            console.error("Failed to start auto flow:", response.error);
          }
        }).catch((error) => {
          console.error("Error starting auto flow:", error);
        });
      } catch (error) {
        console.error("Error in startAutoFlow:", error);
      }
    };
    const openHelp = () => {
      console.log("Opening help...");
    };
    const testExecutionResult = async () => {
      const mockResult = {
        status: "completed",
        postResult: "created",
        postId: "test12345",
        errorMessage: null,
        timestamp: Date.now()
      };
      try {
        await chrome.storage.local.set({ lastExecutionResult: mockResult });
        console.log("Test execution result saved:", mockResult);
        loadExecutionResult();
      } catch (error) {
        console.error("Failed to save test execution result:", error);
      }
    };
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
    };
  }
});
const _hoisted_1 = { class: "row q-mb-sm q-gutter-sm justify-center" };
const _hoisted_2 = { class: "text-center q-mb-md" };
const _hoisted_3 = {
  key: 0,
  class: "text-h6 text-primary"
};
const _hoisted_4 = { class: "text-caption text-grey-6" };
const _hoisted_5 = {
  key: 2,
  class: "text-caption text-grey-7 q-mt-xs",
  style: { "font-size": "11px" }
};
const _hoisted_6 = { class: "q-gutter-y-sm" };
const _hoisted_7 = {
  key: 1,
  class: "q-mt-sm"
};
const _hoisted_8 = { class: "text-subtitle2 decision-title" };
const _hoisted_9 = { class: "text-body2 q-mt-xs" };
const _hoisted_10 = { class: "decision-item" };
const _hoisted_11 = {
  key: 0,
  class: "decision-item"
};
const _hoisted_12 = { class: "decision-item" };
const _hoisted_13 = { class: "decision-item" };
const _hoisted_14 = { class: "decision-item" };
const _hoisted_15 = { class: "text-caption decision-time" };
const _hoisted_16 = {
  key: 2,
  class: "q-mt-sm"
};
const _hoisted_17 = { class: "text-subtitle2 execution-title" };
const _hoisted_18 = { class: "text-body2 q-mt-xs" };
const _hoisted_19 = { class: "execution-item" };
const _hoisted_20 = { class: "execution-item" };
const _hoisted_21 = {
  key: 0,
  class: "execution-item"
};
const _hoisted_22 = {
  key: 1,
  class: "execution-item"
};
const _hoisted_23 = { class: "text-negative" };
const _hoisted_24 = { class: "text-caption execution-time" };
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createBlock(QPage_default, {
    class: "q-pa-md",
    style: { "min-width": "350px", "min-height": "400px" }
  }, {
    default: withCtx(() => [
      createCommentVNode(" Top action buttons "),
      createBaseVNode("div", _hoisted_1, [
        createVNode(QBtn_default, {
          round: "",
          color: "grey-8",
          icon: "add",
          size: "sm",
          onClick: _ctx.createPost,
          disable: !_ctx.storedUsername,
          class: "mono-btn shadow-1"
        }, {
          default: withCtx(() => [
            createVNode(QTooltip_default, null, {
              default: withCtx(() => [..._cache[0] || (_cache[0] = [
                createTextVNode("Create New Post", -1)
              ])]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["onClick", "disable"]),
        _ctx.storedUsername ? (openBlock(), createBlock(QBtn_default, {
          key: 0,
          round: "",
          color: "grey-8",
          icon: "info",
          size: "sm",
          onClick: _ctx.checkUserStatus,
          class: "mono-btn shadow-1"
        }, {
          default: withCtx(() => [
            createVNode(QTooltip_default, null, {
              default: withCtx(() => [..._cache[1] || (_cache[1] = [
                createTextVNode("Check User Status", -1)
              ])]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["onClick"])) : createCommentVNode("v-if", true),
        _ctx.storedUsername ? (openBlock(), createBlock(QBtn_default, {
          key: 1,
          round: "",
          color: "grey-8",
          icon: "delete",
          size: "sm",
          class: "mono-btn shadow-1",
          onClick: _ctx.deleteLastPost
        }, null, 8, ["onClick"])) : createCommentVNode("v-if", true),
        _ctx.storedUsername ? (openBlock(), createBlock(QBtn_default, {
          key: 2,
          class: "full-width q-mt-sm mono-btn",
          color: "grey-8",
          icon: "play_arrow",
          label: "Auto Flow",
          size: "sm",
          onClick: _ctx.startAutoFlow
        }, null, 8, ["onClick"])) : createCommentVNode("v-if", true)
      ]),
      createBaseVNode("div", _hoisted_2, [
        createCommentVNode('      <q-avatar size="60px" class="q-mb-sm">'),
        createCommentVNode("      </q-avatar>"),
        createCommentVNode(" Show username if available, otherwise show app name "),
        _ctx.storedUsername ? (openBlock(), createElementBlock("div", _hoisted_3, toDisplayString(_ctx.storedUsername), 1)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
          createCommentVNode(" Show status based on username availability "),
          createCommentVNode('      <div v-if="storedUsername" class="text-caption text-positive">'),
          createCommentVNode('        <q-icon name="check_circle" class="q-mr-xs" />'),
          createCommentVNode("        Ready to post"),
          createCommentVNode("      </div>"),
          createBaseVNode("div", _hoisted_4, [
            createVNode(QIcon_default, {
              name: "account_circle",
              class: "q-mr-xs"
            }),
            _cache[2] || (_cache[2] = createTextVNode(" No user detected ", -1))
          ])
        ], 2112)),
        createCommentVNode(" Short status line showing last post info "),
        _ctx.userStatus && _ctx.storedUsername ? (openBlock(), createElementBlock("div", _hoisted_5, [
          createVNode(QIcon_default, {
            name: "history",
            size: "xs",
            class: "q-mr-xs"
          }),
          createTextVNode(" " + toDisplayString(_ctx.postsCountText) + " posts \xB7 Last: " + toDisplayString(_ctx.shortLastPostText), 1)
        ])) : createCommentVNode("v-if", true)
      ]),
      createVNode(QSeparator_default, { class: "q-mb-md" }),
      createBaseVNode("div", _hoisted_6, [
        createCommentVNode(" Show detect user button if no username is stored "),
        !_ctx.storedUsername ? (openBlock(), createBlock(QBtn_default, {
          key: 0,
          class: "full-width mono-btn",
          color: "grey-8",
          icon: "person_search",
          label: "Detect Reddit User",
          size: "sm",
          onClick: _ctx.detectUser
        }, null, 8, ["onClick"])) : createCommentVNode("v-if", true),
        createCommentVNode(" Display auto-flow decision report if available "),
        _ctx.decisionReport ? (openBlock(), createElementBlock("div", _hoisted_7, [
          createVNode(QCard_default, { class: "q-pa-sm decision-card" }, {
            default: withCtx(() => [
              createVNode(QCardSection_default, { class: "q-pa-sm" }, {
                default: withCtx(() => [
                  createBaseVNode("div", _hoisted_8, [
                    createVNode(QIcon_default, {
                      name: _ctx.getDecisionIcon(_ctx.decisionReport.decision),
                      class: "q-mr-sm"
                    }, null, 8, ["name"]),
                    _cache[3] || (_cache[3] = createTextVNode(" Auto-Flow Decision ", -1))
                  ]),
                  createBaseVNode("div", _hoisted_9, [
                    createBaseVNode("div", _hoisted_10, [
                      _cache[4] || (_cache[4] = createBaseVNode("strong", null, "Total Posts:", -1)),
                      createTextVNode(" " + toDisplayString(_ctx.decisionReport.totalPosts), 1)
                    ]),
                    _ctx.decisionReport.lastPostAge !== null ? (openBlock(), createElementBlock("div", _hoisted_11, [
                      _cache[5] || (_cache[5] = createBaseVNode("strong", null, "Last Post Age:", -1)),
                      createTextVNode(" " + toDisplayString(_ctx.decisionReport.lastPostAge) + " hours ago ", 1)
                    ])) : createCommentVNode("v-if", true),
                    createBaseVNode("div", _hoisted_12, [
                      _cache[6] || (_cache[6] = createBaseVNode("strong", null, "Last Post Status:", -1)),
                      createBaseVNode("span", {
                        class: normalizeClass(_ctx.getStatusClass(_ctx.decisionReport.lastPostStatus))
                      }, toDisplayString(_ctx.formatStatus(_ctx.decisionReport.lastPostStatus)), 3)
                    ]),
                    createBaseVNode("div", _hoisted_13, [
                      _cache[7] || (_cache[7] = createBaseVNode("strong", null, "Decision:", -1)),
                      createBaseVNode("span", {
                        class: normalizeClass(_ctx.getDecisionClass(_ctx.decisionReport.decision))
                      }, toDisplayString(_ctx.formatDecision(_ctx.decisionReport.decision)), 3)
                    ]),
                    createBaseVNode("div", _hoisted_14, [
                      _cache[8] || (_cache[8] = createBaseVNode("strong", null, "Reason:", -1)),
                      createTextVNode(" " + toDisplayString(_ctx.formatReason(_ctx.decisionReport.reason)), 1)
                    ]),
                    createBaseVNode("div", _hoisted_15, " Analyzed " + toDisplayString(_ctx.formatTimestamp(_ctx.decisionReport.timestamp)), 1)
                  ])
                ]),
                _: 1
              })
            ]),
            _: 1
          })
        ])) : createCommentVNode("v-if", true),
        createCommentVNode(" Display auto-flow execution results if available "),
        _ctx.executionResult ? (openBlock(), createElementBlock("div", _hoisted_16, [
          createVNode(QCard_default, { class: "q-pa-sm execution-card" }, {
            default: withCtx(() => [
              createVNode(QCardSection_default, { class: "q-pa-sm" }, {
                default: withCtx(() => [
                  createBaseVNode("div", _hoisted_17, [
                    createVNode(QIcon_default, {
                      name: _ctx.getExecutionIcon(_ctx.executionResult.status),
                      class: "q-mr-sm"
                    }, null, 8, ["name"]),
                    _cache[9] || (_cache[9] = createTextVNode(" Auto-Flow Execution Results ", -1))
                  ]),
                  createBaseVNode("div", _hoisted_18, [
                    createBaseVNode("div", _hoisted_19, [
                      _cache[10] || (_cache[10] = createBaseVNode("strong", null, "Action Taken:", -1)),
                      createBaseVNode("span", {
                        class: normalizeClass(_ctx.getExecutionStatusClass(_ctx.executionResult.status))
                      }, toDisplayString(_ctx.formatExecutionStatus(_ctx.executionResult.status)), 3)
                    ]),
                    createBaseVNode("div", _hoisted_20, [
                      _cache[11] || (_cache[11] = createBaseVNode("strong", null, "Post Result:", -1)),
                      createBaseVNode("span", {
                        class: normalizeClass(_ctx.getPostResultClass(_ctx.executionResult.postResult))
                      }, toDisplayString(_ctx.formatPostResult(_ctx.executionResult.postResult)), 3)
                    ]),
                    _ctx.executionResult.postId ? (openBlock(), createElementBlock("div", _hoisted_21, [
                      _cache[12] || (_cache[12] = createBaseVNode("strong", null, "Post ID:", -1)),
                      createTextVNode(" " + toDisplayString(_ctx.executionResult.postId), 1)
                    ])) : createCommentVNode("v-if", true),
                    _ctx.executionResult.errorMessage ? (openBlock(), createElementBlock("div", _hoisted_22, [
                      _cache[13] || (_cache[13] = createBaseVNode("strong", null, "Error:", -1)),
                      _cache[14] || (_cache[14] = createTextVNode()),
                      createBaseVNode("span", _hoisted_23, toDisplayString(_ctx.executionResult.errorMessage), 1)
                    ])) : createCommentVNode("v-if", true),
                    createBaseVNode("div", _hoisted_24, " Executed " + toDisplayString(_ctx.formatTimestamp(_ctx.executionResult.timestamp)), 1)
                  ])
                ]),
                _: 1
              })
            ]),
            _: 1
          })
        ])) : createCommentVNode("v-if", true),
        createVNode(QSeparator_default, { class: "q-my-md" }),
        createCommentVNode(" Version footer "),
        _cache[15] || (_cache[15] = createBaseVNode("div", { class: "q-mt-xs q-pt-none text-center text-caption text-grey-6" }, " v0.9.0 ", -1))
      ])
    ]),
    _: 1
  });
}
var PopupPage = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ae2d0c32"], ["__file", "/workspace/development/frappe-bench/apps/reddit_postmachine/lumi/src/pages/PopupPage.vue"]]);
export { PopupPage as default };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9wdXBQYWdlLjA3N2ExZDcwLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcGFnZXMvUG9wdXBQYWdlLnZ1ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8dGVtcGxhdGU+XG5cdCAgPHEtcGFnZSBjbGFzcz1cInEtcGEtbWRcIiBzdHlsZT1cIm1pbi13aWR0aDogMzUwcHg7IG1pbi1oZWlnaHQ6IDQwMHB4O1wiPlxuICAgIDwhLS0gVG9wIGFjdGlvbiBidXR0b25zIC0tPlxuICAgIDxkaXYgY2xhc3M9XCJyb3cgcS1tYi1zbSBxLWd1dHRlci1zbSBqdXN0aWZ5LWNlbnRlclwiPlxuICAgICAgPHEtYnRuXG4gICAgICAgIHJvdW5kXG4gICAgICAgIGNvbG9yPVwiZ3JleS04XCJcbiAgICAgICAgaWNvbj1cImFkZFwiXG4gICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgIEBjbGljaz1cImNyZWF0ZVBvc3RcIlxuICAgICAgICA6ZGlzYWJsZT1cIiFzdG9yZWRVc2VybmFtZVwiXG4gICAgICAgIGNsYXNzPVwibW9uby1idG4gc2hhZG93LTFcIlxuICAgICAgPlxuICAgICAgICA8cS10b29sdGlwPkNyZWF0ZSBOZXcgUG9zdDwvcS10b29sdGlwPlxuICAgICAgPC9xLWJ0bj5cblxuICAgICAgPHEtYnRuXG4gICAgICAgIHYtaWY9XCJzdG9yZWRVc2VybmFtZVwiXG4gICAgICAgIHJvdW5kXG4gICAgICAgIGNvbG9yPVwiZ3JleS04XCJcbiAgICAgICAgaWNvbj1cImluZm9cIlxuICAgICAgICBzaXplPVwic21cIlxuICAgICAgICBAY2xpY2s9XCJjaGVja1VzZXJTdGF0dXNcIlxuICAgICAgICBjbGFzcz1cIm1vbm8tYnRuIHNoYWRvdy0xXCJcbiAgICAgID5cbiAgICAgICAgPHEtdG9vbHRpcD5DaGVjayBVc2VyIFN0YXR1czwvcS10b29sdGlwPlxuXG4gICAgICA8L3EtYnRuPlxuXHRcdCAgPHEtYnRuXG4gICAgICAgIHYtaWY9XCJzdG9yZWRVc2VybmFtZVwiXG4gICAgICAgIHJvdW5kXG4gICAgICAgIGNvbG9yPVwiZ3JleS04XCJcbiAgICAgICAgaWNvbj1cImRlbGV0ZVwiXG4gICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgIGNsYXNzPVwibW9uby1idG4gc2hhZG93LTFcIlxuICAgICAgICBAY2xpY2s9XCJkZWxldGVMYXN0UG9zdFwiXG4gICAgICAvPlxuXHRcdFx0PHEtYnRuXG4gICAgICAgIHYtaWY9XCJzdG9yZWRVc2VybmFtZVwiXG4gICAgICAgIGNsYXNzPVwiZnVsbC13aWR0aCBxLW10LXNtIG1vbm8tYnRuXCJcbiAgICAgICAgY29sb3I9XCJncmV5LThcIlxuICAgICAgICBpY29uPVwicGxheV9hcnJvd1wiXG4gICAgICAgIGxhYmVsPVwiQXV0byBGbG93XCJcbiAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgQGNsaWNrPVwic3RhcnRBdXRvRmxvd1wiXG4gICAgICAvPlxuXG4gICAgPC9kaXY+XG5cbiAgICA8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXIgcS1tYi1tZFwiPlxuPCEtLSAgICAgIDxxLWF2YXRhciBzaXplPVwiNjBweFwiIGNsYXNzPVwicS1tYi1zbVwiPi0tPlxuPCEtLSAgICAgIDwvcS1hdmF0YXI+LS0+XG5cbiAgICAgIDwhLS0gU2hvdyB1c2VybmFtZSBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBzaG93IGFwcCBuYW1lIC0tPlxuICAgICAgPGRpdiB2LWlmPVwic3RvcmVkVXNlcm5hbWVcIiBjbGFzcz1cInRleHQtaDYgdGV4dC1wcmltYXJ5XCI+e3sgc3RvcmVkVXNlcm5hbWUgfX08L2Rpdj5cblxuICAgICAgPCEtLSBTaG93IHN0YXR1cyBiYXNlZCBvbiB1c2VybmFtZSBhdmFpbGFiaWxpdHkgLS0+XG48IS0tICAgICAgPGRpdiB2LWlmPVwic3RvcmVkVXNlcm5hbWVcIiBjbGFzcz1cInRleHQtY2FwdGlvbiB0ZXh0LXBvc2l0aXZlXCI+LS0+XG48IS0tICAgICAgICA8cS1pY29uIG5hbWU9XCJjaGVja19jaXJjbGVcIiBjbGFzcz1cInEtbXIteHNcIiAvPi0tPlxuPCEtLSAgICAgICAgUmVhZHkgdG8gcG9zdC0tPlxuPCEtLSAgICAgIDwvZGl2Pi0tPlxuICAgICAgPGRpdiB2LWVsc2UgY2xhc3M9XCJ0ZXh0LWNhcHRpb24gdGV4dC1ncmV5LTZcIj5cbiAgICAgICAgPHEtaWNvbiBuYW1lPVwiYWNjb3VudF9jaXJjbGVcIiBjbGFzcz1cInEtbXIteHNcIiAvPlxuICAgICAgICBObyB1c2VyIGRldGVjdGVkXG4gICAgICA8L2Rpdj5cblxuICAgICAgPCEtLSBTaG9ydCBzdGF0dXMgbGluZSBzaG93aW5nIGxhc3QgcG9zdCBpbmZvIC0tPlxuICAgICAgPGRpdiB2LWlmPVwidXNlclN0YXR1cyAmJiBzdG9yZWRVc2VybmFtZVwiIGNsYXNzPVwidGV4dC1jYXB0aW9uIHRleHQtZ3JleS03IHEtbXQteHNcIiBzdHlsZT1cImZvbnQtc2l6ZTogMTFweDtcIj5cbiAgICAgICAgPHEtaWNvbiBuYW1lPVwiaGlzdG9yeVwiIHNpemU9XCJ4c1wiIGNsYXNzPVwicS1tci14c1wiIC8+XG4gICAgICAgIHt7IHBvc3RzQ291bnRUZXh0IH19IHBvc3RzIMK3IExhc3Q6IHt7IHNob3J0TGFzdFBvc3RUZXh0IH19XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICA8cS1zZXBhcmF0b3IgY2xhc3M9XCJxLW1iLW1kXCIgLz5cblxuICAgIDxkaXYgY2xhc3M9XCJxLWd1dHRlci15LXNtXCI+XG4gICAgICA8IS0tIFNob3cgZGV0ZWN0IHVzZXIgYnV0dG9uIGlmIG5vIHVzZXJuYW1lIGlzIHN0b3JlZCAtLT5cbiAgICAgIDxxLWJ0blxuICAgICAgICB2LWlmPVwiIXN0b3JlZFVzZXJuYW1lXCJcbiAgICAgICAgY2xhc3M9XCJmdWxsLXdpZHRoIG1vbm8tYnRuXCJcbiAgICAgICAgY29sb3I9XCJncmV5LThcIlxuICAgICAgICBpY29uPVwicGVyc29uX3NlYXJjaFwiXG4gICAgICAgIGxhYmVsPVwiRGV0ZWN0IFJlZGRpdCBVc2VyXCJcbiAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgQGNsaWNrPVwiZGV0ZWN0VXNlclwiXG4gICAgICAvPlxuICAgICAgPCEtLSBEaXNwbGF5IGF1dG8tZmxvdyBkZWNpc2lvbiByZXBvcnQgaWYgYXZhaWxhYmxlIC0tPlxuICAgICAgPGRpdiB2LWlmPVwiZGVjaXNpb25SZXBvcnRcIiBjbGFzcz1cInEtbXQtc21cIj5cbiAgICAgICAgPHEtY2FyZCBjbGFzcz1cInEtcGEtc20gZGVjaXNpb24tY2FyZFwiPlxuICAgICAgICAgIDxxLWNhcmQtc2VjdGlvbiBjbGFzcz1cInEtcGEtc21cIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LXN1YnRpdGxlMiBkZWNpc2lvbi10aXRsZVwiPlxuICAgICAgICAgICAgICA8cS1pY29uIDpuYW1lPVwiZ2V0RGVjaXNpb25JY29uKGRlY2lzaW9uUmVwb3J0LmRlY2lzaW9uKVwiIGNsYXNzPVwicS1tci1zbVwiIC8+XG4gICAgICAgICAgICAgIEF1dG8tRmxvdyBEZWNpc2lvblxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1ib2R5MiBxLW10LXhzXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWNpc2lvbi1pdGVtXCI+PHN0cm9uZz5Ub3RhbCBQb3N0czo8L3N0cm9uZz4ge3sgZGVjaXNpb25SZXBvcnQudG90YWxQb3N0cyB9fTwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IHYtaWY9XCJkZWNpc2lvblJlcG9ydC5sYXN0UG9zdEFnZSAhPT0gbnVsbFwiIGNsYXNzPVwiZGVjaXNpb24taXRlbVwiPlxuICAgICAgICAgICAgICAgIDxzdHJvbmc+TGFzdCBQb3N0IEFnZTo8L3N0cm9uZz4ge3sgZGVjaXNpb25SZXBvcnQubGFzdFBvc3RBZ2UgfX0gaG91cnMgYWdvXG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVjaXNpb24taXRlbVwiPjxzdHJvbmc+TGFzdCBQb3N0IFN0YXR1czo8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8c3BhbiA6Y2xhc3M9XCJnZXRTdGF0dXNDbGFzcyhkZWNpc2lvblJlcG9ydC5sYXN0UG9zdFN0YXR1cylcIj5cbiAgICAgICAgICAgICAgICAgIHt7IGZvcm1hdFN0YXR1cyhkZWNpc2lvblJlcG9ydC5sYXN0UG9zdFN0YXR1cykgfX1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGVjaXNpb24taXRlbVwiPjxzdHJvbmc+RGVjaXNpb246PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgPHNwYW4gOmNsYXNzPVwiZ2V0RGVjaXNpb25DbGFzcyhkZWNpc2lvblJlcG9ydC5kZWNpc2lvbilcIj5cbiAgICAgICAgICAgICAgICAgIHt7IGZvcm1hdERlY2lzaW9uKGRlY2lzaW9uUmVwb3J0LmRlY2lzaW9uKSB9fVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkZWNpc2lvbi1pdGVtXCI+PHN0cm9uZz5SZWFzb246PC9zdHJvbmc+IHt7IGZvcm1hdFJlYXNvbihkZWNpc2lvblJlcG9ydC5yZWFzb24pIH19PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWNhcHRpb24gZGVjaXNpb24tdGltZVwiPlxuICAgICAgICAgICAgICAgIEFuYWx5emVkIHt7IGZvcm1hdFRpbWVzdGFtcChkZWNpc2lvblJlcG9ydC50aW1lc3RhbXApIH19XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9xLWNhcmQtc2VjdGlvbj5cbiAgICAgICAgPC9xLWNhcmQ+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPCEtLSBEaXNwbGF5IGF1dG8tZmxvdyBleGVjdXRpb24gcmVzdWx0cyBpZiBhdmFpbGFibGUgLS0+XG4gICAgICA8ZGl2IHYtaWY9XCJleGVjdXRpb25SZXN1bHRcIiBjbGFzcz1cInEtbXQtc21cIj5cbiAgICAgICAgPHEtY2FyZCBjbGFzcz1cInEtcGEtc20gZXhlY3V0aW9uLWNhcmRcIj5cbiAgICAgICAgICA8cS1jYXJkLXNlY3Rpb24gY2xhc3M9XCJxLXBhLXNtXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGV4dC1zdWJ0aXRsZTIgZXhlY3V0aW9uLXRpdGxlXCI+XG4gICAgICAgICAgICAgIDxxLWljb24gOm5hbWU9XCJnZXRFeGVjdXRpb25JY29uKGV4ZWN1dGlvblJlc3VsdC5zdGF0dXMpXCIgY2xhc3M9XCJxLW1yLXNtXCIgLz5cbiAgICAgICAgICAgICAgQXV0by1GbG93IEV4ZWN1dGlvbiBSZXN1bHRzXG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0ZXh0LWJvZHkyIHEtbXQteHNcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImV4ZWN1dGlvbi1pdGVtXCI+PHN0cm9uZz5BY3Rpb24gVGFrZW46PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgPHNwYW4gOmNsYXNzPVwiZ2V0RXhlY3V0aW9uU3RhdHVzQ2xhc3MoZXhlY3V0aW9uUmVzdWx0LnN0YXR1cylcIj5cbiAgICAgICAgICAgICAgICAgIHt7IGZvcm1hdEV4ZWN1dGlvblN0YXR1cyhleGVjdXRpb25SZXN1bHQuc3RhdHVzKSB9fVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJleGVjdXRpb24taXRlbVwiPjxzdHJvbmc+UG9zdCBSZXN1bHQ6PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgPHNwYW4gOmNsYXNzPVwiZ2V0UG9zdFJlc3VsdENsYXNzKGV4ZWN1dGlvblJlc3VsdC5wb3N0UmVzdWx0KVwiPlxuICAgICAgICAgICAgICAgICAge3sgZm9ybWF0UG9zdFJlc3VsdChleGVjdXRpb25SZXN1bHQucG9zdFJlc3VsdCkgfX1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IHYtaWY9XCJleGVjdXRpb25SZXN1bHQucG9zdElkXCIgY2xhc3M9XCJleGVjdXRpb24taXRlbVwiPlxuICAgICAgICAgICAgICAgIDxzdHJvbmc+UG9zdCBJRDo8L3N0cm9uZz4ge3sgZXhlY3V0aW9uUmVzdWx0LnBvc3RJZCB9fVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiB2LWlmPVwiZXhlY3V0aW9uUmVzdWx0LmVycm9yTWVzc2FnZVwiIGNsYXNzPVwiZXhlY3V0aW9uLWl0ZW1cIj5cbiAgICAgICAgICAgICAgICA8c3Ryb25nPkVycm9yOjwvc3Ryb25nPiA8c3BhbiBjbGFzcz1cInRleHQtbmVnYXRpdmVcIj57eyBleGVjdXRpb25SZXN1bHQuZXJyb3JNZXNzYWdlIH19PC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtY2FwdGlvbiBleGVjdXRpb24tdGltZVwiPlxuICAgICAgICAgICAgICAgIEV4ZWN1dGVkIHt7IGZvcm1hdFRpbWVzdGFtcChleGVjdXRpb25SZXN1bHQudGltZXN0YW1wKSB9fVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvcS1jYXJkLXNlY3Rpb24+XG4gICAgICAgIDwvcS1jYXJkPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxxLXNlcGFyYXRvciBjbGFzcz1cInEtbXktbWRcIiAvPlxuXG4gICAgICA8IS0tIFZlcnNpb24gZm9vdGVyIC0tPlxuICAgICAgPGRpdiBjbGFzcz1cInEtbXQteHMgcS1wdC1ub25lIHRleHQtY2VudGVyIHRleHQtY2FwdGlvbiB0ZXh0LWdyZXktNlwiPlxuICAgICAgICB2MC45LjBcbiAgICAgIDwvZGl2PlxuXG4gICAgPC9kaXY+XG5cbiAgPC9xLXBhZ2U+XG48L3RlbXBsYXRlPlxuXG48c2NyaXB0PlxuaW1wb3J0IHsgZGVmaW5lQ29tcG9uZW50LCByZWYsIG9uTW91bnRlZCwgY29tcHV0ZWQgfSBmcm9tICd2dWUnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbXBvbmVudCh7XG4gIG5hbWU6ICdQb3B1cFBhZ2UnLFxuICBzZXR1cCgpIHtcbiAgICBjb25zdCBzdG9yZWRVc2VybmFtZSA9IHJlZignJylcbiAgICBjb25zdCB1c2VyU3RhdHVzID0gcmVmKG51bGwpXG4gICAgY29uc3QgcG9zdHNEYXRhID0gcmVmKG51bGwpXG4gICAgY29uc3QgZGVjaXNpb25SZXBvcnQgPSByZWYobnVsbClcbiAgICBjb25zdCBleGVjdXRpb25SZXN1bHQgPSByZWYobnVsbClcblxuICAgIGNvbnN0IGdldFBvc3RzQXJyYXkgPSAoKSA9PiB7XG4gICAgICBjb25zdCBkYXRhID0gcG9zdHNEYXRhLnZhbHVlXG4gICAgICBjb25zdCBwb3N0cyA9IGRhdGE/LnBvc3RzIHx8IGRhdGE/LnBvc3RzSW5mbz8ucG9zdHNcbiAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHBvc3RzKSA/IHBvc3RzIDogW11cbiAgICB9XG5cbiAgICBjb25zdCBwb3N0c0NvdW50VGV4dCA9IGNvbXB1dGVkKCgpID0+IHtcbiAgICAgIGNvbnN0IGZyb21TdGF0dXMgPSB1c2VyU3RhdHVzLnZhbHVlPy5wb3N0c0NvdW50XG4gICAgICBpZiAodHlwZW9mIGZyb21TdGF0dXMgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQb3B1cDogVXNpbmcgcG9zdHNDb3VudCBmcm9tIHVzZXJTdGF0dXM6JywgZnJvbVN0YXR1cylcbiAgICAgICAgcmV0dXJuIGZyb21TdGF0dXNcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRhdGEgPSBwb3N0c0RhdGEudmFsdWVcbiAgICAgIGNvbnN0IGZyb21Ub3RhbCA9IGRhdGE/LnRvdGFsXG4gICAgICBpZiAodHlwZW9mIGZyb21Ub3RhbCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1BvcHVwOiBVc2luZyB0b3RhbCBmcm9tIGRhdGE6JywgZnJvbVRvdGFsKVxuICAgICAgICByZXR1cm4gZnJvbVRvdGFsXG4gICAgICB9XG4gICAgICBjb25zdCBmcm9tVG90YWxQb3N0cyA9IGRhdGE/LnRvdGFsUG9zdHNcbiAgICAgIGlmICh0eXBlb2YgZnJvbVRvdGFsUG9zdHMgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQb3B1cDogVXNpbmcgdG90YWxQb3N0cyBmcm9tIGRhdGE6JywgZnJvbVRvdGFsUG9zdHMpXG4gICAgICAgIHJldHVybiBmcm9tVG90YWxQb3N0c1xuICAgICAgfVxuICAgICAgY29uc3QgcG9zdHNBcnJheUxlbmd0aCA9IGdldFBvc3RzQXJyYXkoKS5sZW5ndGhcbiAgICAgIGNvbnNvbGUubG9nKCdQb3B1cDogVXNpbmcgcG9zdHMgYXJyYXkgbGVuZ3RoOicsIHBvc3RzQXJyYXlMZW5ndGgpXG4gICAgICBjb25zb2xlLmxvZygnUG9wdXA6IHBvc3RzRGF0YS52YWx1ZTonLCBkYXRhKVxuICAgICAgY29uc29sZS5sb2coJ1BvcHVwOiBwb3N0c0luZm8/LnBvc3RzOicsIGRhdGE/LnBvc3RzSW5mbz8ucG9zdHMpXG4gICAgICByZXR1cm4gcG9zdHNBcnJheUxlbmd0aFxuICAgIH0pXG5cbiAgICAvLyBDb21wdXRlZCBwcm9wZXJ0eSBmb3Igc2hvcnQgbGFzdCBwb3N0IHRleHQgZGlzcGxheVxuICAgIGNvbnN0IHNob3J0TGFzdFBvc3RUZXh0ID0gY29tcHV0ZWQoKCkgPT4ge1xuICAgICAgY29uc3QgcG9zdHMgPSBnZXRQb3N0c0FycmF5KClcbiAgICAgIGlmIChwb3N0cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuICduZXZlcidcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGxhc3RQb3N0ID0gcG9zdHNbMF1cbiAgICAgICAgY29uc3QgbGFzdERhdGUgPSBuZXcgRGF0ZShsYXN0UG9zdC50aW1lc3RhbXApXG4gICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKClcbiAgICAgICAgY29uc3QgZGlmZk1zID0gbm93IC0gbGFzdERhdGVcbiAgICAgICAgY29uc3QgZGlmZkRheXMgPSBNYXRoLmZsb29yKGRpZmZNcyAvICgxMDAwICogNjAgKiA2MCAqIDI0KSlcblxuICAgICAgICBpZiAoZGlmZkRheXMgPT09IDApIHJldHVybiAndG9kYXknXG4gICAgICAgIGlmIChkaWZmRGF5cyA9PT0gMSkgcmV0dXJuICd5ZXN0ZXJkYXknXG4gICAgICAgIGlmIChkaWZmRGF5cyA8IDcpIHJldHVybiBgJHtkaWZmRGF5c31kIGFnb2BcbiAgICAgICAgaWYgKGRpZmZEYXlzIDwgMzApIHJldHVybiBgJHtNYXRoLmZsb29yKGRpZmZEYXlzIC8gNyl9dyBhZ29gXG4gICAgICAgIHJldHVybiBsYXN0RGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLVVTJywgeyBtb250aDogJ3Nob3J0JywgZGF5OiAnbnVtZXJpYycgfSlcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gJ3Vua25vd24nXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIEZvcm1hdCBsYXN0IHBvc3QgdGV4dCBmb3IgZGV0YWlsZWQgc3RhdHVzXG4gICAgY29uc3QgZm9ybWF0TGFzdFBvc3RUZXh0ID0gKHVzZXJTdGF0dXMpID0+IHtcbiAgICAgIGNvbnN0IHBvc3RzID0gZ2V0UG9zdHNBcnJheSgpXG4gICAgICBpZiAocG9zdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiAnbmV2ZXInXG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBsYXN0UG9zdCA9IHBvc3RzWzBdXG4gICAgICAgIGNvbnN0IGxhc3REYXRlID0gbmV3IERhdGUobGFzdFBvc3QudGltZXN0YW1wKVxuICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpXG4gICAgICAgIGNvbnN0IGRpZmZNcyA9IG5vdyAtIGxhc3REYXRlXG4gICAgICAgIGNvbnN0IGRpZmZEYXlzID0gTWF0aC5mbG9vcihkaWZmTXMgLyAoMTAwMCAqIDYwICogNjAgKiAyNCkpXG5cbiAgICAgICAgaWYgKGRpZmZEYXlzID09PSAwKSByZXR1cm4gJ3RvZGF5J1xuICAgICAgICBpZiAoZGlmZkRheXMgPT09IDEpIHJldHVybiAneWVzdGVyZGF5J1xuICAgICAgICBpZiAoZGlmZkRheXMgPCA3KSByZXR1cm4gYCR7ZGlmZkRheXN9ZCBhZ29gXG4gICAgICAgIGlmIChkaWZmRGF5cyA8IDMwKSByZXR1cm4gYCR7TWF0aC5mbG9vcihkaWZmRGF5cyAvIDcpfXcgYWdvYFxuICAgICAgICByZXR1cm4gbGFzdERhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1VUycsIHsgbW9udGg6ICdzaG9ydCcsIGRheTogJ251bWVyaWMnIH0pXG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuICd1bmtub3duJ1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIExvYWQgc3RvcmVkIHVzZXJuYW1lIHdoZW4gcG9wdXAgb3BlbnNcbiAgICBjb25zdCBsb2FkU3RvcmVkVXNlcm5hbWUgPSBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoXG4gICAgICAgICAgICB7IHR5cGU6ICdHRVRfU1RPUkVEX1VTRVJOQU1FJyB9LFxuICAgICAgICAgICAgcmVzb2x2ZVxuICAgICAgICAgIClcbiAgICAgICAgfSlcblxuICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2VzcyAmJiByZXNwb25zZS5kYXRhICYmIHJlc3BvbnNlLmRhdGEuc2VyZW5fbmFtZSkge1xuICAgICAgICAgIHN0b3JlZFVzZXJuYW1lLnZhbHVlID0gcmVzcG9uc2UuZGF0YS5zZXJlbl9uYW1lXG4gICAgICAgICAgY29uc29sZS5sb2coJ1BvcHVwOiBMb2FkZWQgc3RvcmVkIHVzZXJuYW1lOicsIHJlc3BvbnNlLmRhdGEuc2VyZW5fbmFtZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnUG9wdXA6IE5vIHN0b3JlZCB1c2VybmFtZSBmb3VuZCcpXG4gICAgICAgICAgc3RvcmVkVXNlcm5hbWUudmFsdWUgPSAnJ1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdQb3B1cDogRXJyb3IgbG9hZGluZyBzdG9yZWQgdXNlcm5hbWU6JywgZXJyb3IpXG4gICAgICAgIHN0b3JlZFVzZXJuYW1lLnZhbHVlID0gJydcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMb2FkIGRlY2lzaW9uIHJlcG9ydCB3aGVuIHBvcHVwIG9wZW5zXG4gICAgY29uc3QgbG9hZERlY2lzaW9uUmVwb3J0ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoWydsYXN0RGVjaXNpb25SZXBvcnQnXSwgcmVzb2x2ZSlcbiAgICAgICAgfSlcblxuICAgICAgICBpZiAocmVzdWx0Lmxhc3REZWNpc2lvblJlcG9ydCkge1xuICAgICAgICAgIGRlY2lzaW9uUmVwb3J0LnZhbHVlID0gcmVzdWx0Lmxhc3REZWNpc2lvblJlcG9ydFxuICAgICAgICAgIGNvbnNvbGUubG9nKCdQb3B1cDogTG9hZGVkIGRlY2lzaW9uIHJlcG9ydDonLCByZXN1bHQubGFzdERlY2lzaW9uUmVwb3J0KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdQb3B1cDogTm8gZGVjaXNpb24gcmVwb3J0IGZvdW5kJylcbiAgICAgICAgICBkZWNpc2lvblJlcG9ydC52YWx1ZSA9IG51bGxcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignUG9wdXA6IEVycm9yIGxvYWRpbmcgZGVjaXNpb24gcmVwb3J0OicsIGVycm9yKVxuICAgICAgICBkZWNpc2lvblJlcG9ydC52YWx1ZSA9IG51bGxcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMb2FkIGV4ZWN1dGlvbiByZXN1bHQgd2hlbiBwb3B1cCBvcGVuc1xuICAgIGNvbnN0IGxvYWRFeGVjdXRpb25SZXN1bHQgPSBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbJ2xhc3RFeGVjdXRpb25SZXN1bHQnXSwgcmVzb2x2ZSlcbiAgICAgICAgfSlcblxuICAgICAgICBpZiAocmVzdWx0Lmxhc3RFeGVjdXRpb25SZXN1bHQpIHtcbiAgICAgICAgICBleGVjdXRpb25SZXN1bHQudmFsdWUgPSByZXN1bHQubGFzdEV4ZWN1dGlvblJlc3VsdFxuICAgICAgICAgIGNvbnNvbGUubG9nKCdQb3B1cDogTG9hZGVkIGV4ZWN1dGlvbiByZXN1bHQ6JywgcmVzdWx0Lmxhc3RFeGVjdXRpb25SZXN1bHQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1BvcHVwOiBObyBleGVjdXRpb24gcmVzdWx0IGZvdW5kJylcbiAgICAgICAgICBleGVjdXRpb25SZXN1bHQudmFsdWUgPSBudWxsXG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1BvcHVwOiBFcnJvciBsb2FkaW5nIGV4ZWN1dGlvbiByZXN1bHQ6JywgZXJyb3IpXG4gICAgICAgIGV4ZWN1dGlvblJlc3VsdC52YWx1ZSA9IG51bGxcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGb3JtYXQgc3RhdHVzIGZvciBkaXNwbGF5XG4gICAgY29uc3QgZm9ybWF0U3RhdHVzID0gKHN0YXR1cykgPT4ge1xuICAgICAgY29uc3Qgc3RhdHVzTWFwID0ge1xuICAgICAgICBhY3RpdmU6ICdBY3RpdmUnLFxuICAgICAgICByZW1vdmVkOiAnUmVtb3ZlZCcsXG4gICAgICAgIGJsb2NrZWQ6ICdCbG9ja2VkJyxcbiAgICAgICAgZGVsZXRlZDogJ0RlbGV0ZWQnLFxuICAgICAgICB1bmtub3duOiAnVW5rbm93bidcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdGF0dXNNYXBbc3RhdHVzXSB8fCBzdGF0dXNcbiAgICB9XG5cbiAgICAvLyBGb3JtYXQgZGVjaXNpb24gZm9yIGRpc3BsYXlcbiAgICBjb25zdCBmb3JtYXREZWNpc2lvbiA9IChkZWNpc2lvbikgPT4ge1xuICAgICAgY29uc3QgZGVjaXNpb25NYXAgPSB7XG4gICAgICAgIG5vX2NyZWF0ZTogJ05vIEFjdGlvbiBOZWVkZWQnLFxuICAgICAgICBjcmVhdGU6ICdDcmVhdGUgTmV3IFBvc3QnLFxuICAgICAgICBjcmVhdGVfd2l0aF9kZWxldGU6ICdEZWxldGUgJiBDcmVhdGUgTmV3J1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlY2lzaW9uTWFwW2RlY2lzaW9uXSB8fCBkZWNpc2lvblxuICAgIH1cblxuICAgIC8vIEZvcm1hdCByZWFzb24gZm9yIGRpc3BsYXlcbiAgICBjb25zdCBmb3JtYXRSZWFzb24gPSAocmVhc29uKSA9PiB7XG4gICAgICBjb25zdCByZWFzb25NYXAgPSB7XG4gICAgICAgICdub19wb3N0cyc6ICdObyBwb3N0cyBmb3VuZCcsXG4gICAgICAgICdvbGRfcG9zdCc6ICdMYXN0IHBvc3QgaXMgb2xkZXIgdGhhbiBvbmUgd2VlaycsXG4gICAgICAgICdwb3N0X2Jsb2NrZWQnOiAnTGFzdCBwb3N0IHdhcyBibG9ja2VkL3JlbW92ZWQnLFxuICAgICAgICAncG9zdF9kb3dudm90ZWQnOiAnTGFzdCBwb3N0IGhhcyBkb3dudm90ZXMnLFxuICAgICAgICAncmVjZW50X3Bvc3QnOiAnTGFzdCBwb3N0IGlzIHJlY2VudCBhbmQgYWN0aXZlJ1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlYXNvbk1hcFtyZWFzb25dIHx8IHJlYXNvblxuICAgIH1cblxuICAgIC8vIEZvcm1hdCBleGVjdXRpb24gc3RhdHVzIGZvciBkaXNwbGF5XG4gICAgY29uc3QgZm9ybWF0RXhlY3V0aW9uU3RhdHVzID0gKHN0YXR1cykgPT4ge1xuICAgICAgY29uc3Qgc3RhdHVzTWFwID0ge1xuICAgICAgICBjb21wbGV0ZWQ6ICdDb21wbGV0ZWQnLFxuICAgICAgICBmYWlsZWQ6ICdGYWlsZWQnLFxuICAgICAgICBza2lwcGVkOiAnU2tpcHBlZCcsXG4gICAgICAgIGluX3Byb2dyZXNzOiAnSW4gUHJvZ3Jlc3MnXG4gICAgICB9XG4gICAgICByZXR1cm4gc3RhdHVzTWFwW3N0YXR1c10gfHwgc3RhdHVzXG4gICAgfVxuXG4gICAgLy8gRm9ybWF0IHBvc3QgcmVzdWx0IGZvciBkaXNwbGF5XG4gICAgY29uc3QgZm9ybWF0UG9zdFJlc3VsdCA9IChyZXN1bHQpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdE1hcCA9IHtcbiAgICAgICAgY3JlYXRlZDogJ1Bvc3QgQ3JlYXRlZCcsXG4gICAgICAgIGRlbGV0ZWQ6ICdQb3N0IERlbGV0ZWQnLFxuICAgICAgICBkZWxldGVkX2FuZF9jcmVhdGVkOiAnRGVsZXRlZCAmIENyZWF0ZWQnLFxuICAgICAgICBub25lOiAnTm8gQWN0aW9uIFRha2VuJyxcbiAgICAgICAgZXJyb3I6ICdFcnJvciBPY2N1cnJlZCdcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRNYXBbcmVzdWx0XSB8fCByZXN1bHRcbiAgICB9XG5cbiAgICAvLyBHZXQgZGVjaXNpb24gY2FyZCBDU1MgY2xhc3NcbiAgICBjb25zdCBnZXREZWNpc2lvbkNhcmRDbGFzcyA9IChkZWNpc2lvbikgPT4ge1xuICAgICAgY29uc3QgY2xhc3NNYXAgPSB7XG4gICAgICAgICdub19jcmVhdGUnOiAnc3RhdHVzLXN1Y2Nlc3MnLFxuICAgICAgICAnY3JlYXRlJzogJ3N0YXR1cy13YXJuaW5nJyxcbiAgICAgICAgJ2NyZWF0ZV93aXRoX2RlbGV0ZSc6ICdzdGF0dXMtZXJyb3InXG4gICAgICB9XG4gICAgICByZXR1cm4gY2xhc3NNYXBbZGVjaXNpb25dIHx8ICcnXG4gICAgfVxuXG4gICAgLy8gR2V0IGRlY2lzaW9uIGljb25cbiAgICBjb25zdCBnZXREZWNpc2lvbkljb24gPSAoZGVjaXNpb24pID0+IHtcbiAgICAgIGNvbnN0IGljb25NYXAgPSB7XG4gICAgICAgICdub19jcmVhdGUnOiAnY2hlY2tfY2lyY2xlJyxcbiAgICAgICAgJ2NyZWF0ZSc6ICdhZGRfY2lyY2xlJyxcbiAgICAgICAgJ2NyZWF0ZV93aXRoX2RlbGV0ZSc6ICdkZWxldGVfc3dlZXAnXG4gICAgICB9XG4gICAgICByZXR1cm4gaWNvbk1hcFtkZWNpc2lvbl0gfHwgJ2luZm8nXG4gICAgfVxuXG4gICAgLy8gR2V0IHN0YXR1cyBDU1MgY2xhc3NcbiAgICBjb25zdCBnZXRTdGF0dXNDbGFzcyA9IChzdGF0dXMpID0+IHtcbiAgICAgIGNvbnN0IGNsYXNzTWFwID0ge1xuICAgICAgICAnYWN0aXZlJzogJ3RleHQtcG9zaXRpdmUnLFxuICAgICAgICAncmVtb3ZlZCc6ICd0ZXh0LW5lZ2F0aXZlJyxcbiAgICAgICAgJ2Jsb2NrZWQnOiAndGV4dC13YXJuaW5nJyxcbiAgICAgICAgJ2RlbGV0ZWQnOiAndGV4dC1uZWdhdGl2ZSdcbiAgICAgIH1cbiAgICAgIHJldHVybiBjbGFzc01hcFtzdGF0dXNdIHx8ICcnXG4gICAgfVxuXG4gICAgLy8gR2V0IGRlY2lzaW9uIENTUyBjbGFzc1xuICAgIGNvbnN0IGdldERlY2lzaW9uQ2xhc3MgPSAoZGVjaXNpb24pID0+IHtcbiAgICAgIGNvbnN0IGNsYXNzTWFwID0ge1xuICAgICAgICAnbm9fY3JlYXRlJzogJ3RleHQtcG9zaXRpdmUnLFxuICAgICAgICAnY3JlYXRlJzogJ3RleHQtd2FybmluZycsXG4gICAgICAgICdjcmVhdGVfd2l0aF9kZWxldGUnOiAndGV4dC1uZWdhdGl2ZSdcbiAgICAgIH1cbiAgICAgIHJldHVybiBjbGFzc01hcFtkZWNpc2lvbl0gfHwgJydcbiAgICB9XG5cbiAgICAvLyBHZXQgZXhlY3V0aW9uIGljb25cbiAgICBjb25zdCBnZXRFeGVjdXRpb25JY29uID0gKHN0YXR1cykgPT4ge1xuICAgICAgY29uc3QgaWNvbk1hcCA9IHtcbiAgICAgICAgJ2NvbXBsZXRlZCc6ICdjaGVja19jaXJjbGUnLFxuICAgICAgICAnZmFpbGVkJzogJ2Vycm9yJyxcbiAgICAgICAgJ3NraXBwZWQnOiAnc2tpcF9uZXh0JyxcbiAgICAgICAgJ2luX3Byb2dyZXNzJzogJ3JlZnJlc2gnXG4gICAgICB9XG4gICAgICByZXR1cm4gaWNvbk1hcFtzdGF0dXNdIHx8ICdpbmZvJ1xuICAgIH1cblxuICAgIC8vIEdldCBleGVjdXRpb24gc3RhdHVzIENTUyBjbGFzc1xuICAgIGNvbnN0IGdldEV4ZWN1dGlvblN0YXR1c0NsYXNzID0gKHN0YXR1cykgPT4ge1xuICAgICAgY29uc3QgY2xhc3NNYXAgPSB7XG4gICAgICAgICdjb21wbGV0ZWQnOiAndGV4dC1wb3NpdGl2ZScsXG4gICAgICAgICdmYWlsZWQnOiAndGV4dC1uZWdhdGl2ZScsXG4gICAgICAgICdza2lwcGVkJzogJ3RleHQtd2FybmluZycsXG4gICAgICAgICdpbl9wcm9ncmVzcyc6ICd0ZXh0LWluZm8nXG4gICAgICB9XG4gICAgICByZXR1cm4gY2xhc3NNYXBbc3RhdHVzXSB8fCAnJ1xuICAgIH1cblxuICAgIC8vIEdldCBwb3N0IHJlc3VsdCBDU1MgY2xhc3NcbiAgICBjb25zdCBnZXRQb3N0UmVzdWx0Q2xhc3MgPSAocmVzdWx0KSA9PiB7XG4gICAgICBjb25zdCBjbGFzc01hcCA9IHtcbiAgICAgICAgJ2NyZWF0ZWQnOiAndGV4dC1wb3NpdGl2ZScsXG4gICAgICAgICdkZWxldGVkJzogJ3RleHQtbmVnYXRpdmUnLFxuICAgICAgICAnZGVsZXRlZF9hbmRfY3JlYXRlZCc6ICd0ZXh0LXdhcm5pbmcnLFxuICAgICAgICAnbm9uZSc6ICd0ZXh0LWdyZXknLFxuICAgICAgICAnZXJyb3InOiAndGV4dC1uZWdhdGl2ZSdcbiAgICAgIH1cbiAgICAgIHJldHVybiBjbGFzc01hcFtyZXN1bHRdIHx8ICcnXG4gICAgfVxuICAgIGNvbnN0IGxvYWRVc2VyU3RhdHVzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKFxuICAgICAgICAgICAgeyB0eXBlOiAnR0VUX1VTRVJfU1RBVFVTJyB9LFxuICAgICAgICAgICAgcmVzb2x2ZVxuICAgICAgICAgIClcbiAgICAgICAgfSlcblxuICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2VzcyAmJiByZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgdXNlclN0YXR1cy52YWx1ZSA9IHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICBjb25zb2xlLmxvZygnUG9wdXA6IExvYWRlZCB1c2VyIHN0YXR1czonLCByZXNwb25zZS5kYXRhKVxuICAgICAgICAgIGNvbnNvbGUubG9nKCdQb3B1cDogVXNlciBzdGF0dXMgc3RydWN0dXJlOicsIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlLmRhdGEsIG51bGwsIDIpKVxuICAgICAgICAgIGNvbnNvbGUubG9nKCdQb3B1cDogY3VycmVudFVzZXI6JywgcmVzcG9uc2UuZGF0YS5jdXJyZW50VXNlcilcbiAgICAgICAgICBjb25zb2xlLmxvZygnUG9wdXA6IHBvc3RzQ291bnQ6JywgcmVzcG9uc2UuZGF0YS5wb3N0c0NvdW50KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdQb3B1cDogTm8gdXNlciBzdGF0dXMgZm91bmQnKVxuICAgICAgICAgIHVzZXJTdGF0dXMudmFsdWUgPSBudWxsXG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1BvcHVwOiBFcnJvciBsb2FkaW5nIHVzZXIgc3RhdHVzOicsIGVycm9yKVxuICAgICAgICB1c2VyU3RhdHVzLnZhbHVlID0gbnVsbFxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGxvYWRQb3N0c0RhdGEgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJyAmJiBjaHJvbWUuc3RvcmFnZSkge1xuICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFsnbGF0ZXN0UG9zdHNEYXRhJ10sIChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUG9wdXA6IFJhdyBzdG9yYWdlIHJlc3VsdDonLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubGF0ZXN0UG9zdHNEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvc3RzRGF0YS52YWx1ZSA9IHJlc3VsdC5sYXRlc3RQb3N0c0RhdGE7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQb3B1cDogTG9hZGVkIHBvc3RzIGRhdGEgZnJvbSBzdG9yYWdlOicsIHJlc3VsdC5sYXRlc3RQb3N0c0RhdGEpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUG9wdXA6IHBvc3RzSW5mbzonLCByZXN1bHQubGF0ZXN0UG9zdHNEYXRhLnBvc3RzSW5mbyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQb3B1cDogcG9zdHNJbmZvLnBvc3RzOicsIHJlc3VsdC5sYXRlc3RQb3N0c0RhdGEucG9zdHNJbmZvPy5wb3N0cyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQb3B1cDogRm91bmQnLCByZXN1bHQubGF0ZXN0UG9zdHNEYXRhLnBvc3RzSW5mbz8ucG9zdHM/Lmxlbmd0aCB8fCAwLCAncG9zdHMnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1BvcHVwOiBwb3N0c0luZm8udG90YWw6JywgcmVzdWx0LmxhdGVzdFBvc3RzRGF0YS5wb3N0c0luZm8/LnRvdGFsKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUG9wdXA6IE5vIHBvc3RzIGRhdGEgZm91bmQgaW4gc3RvcmFnZScpO1xuICAgICAgICAgICAgICAgICAgICBwb3N0c0RhdGEudmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRm9ybWF0IHRpbWVzdGFtcCBmb3IgZGlzcGxheVxuICAgIGNvbnN0IGZvcm1hdFRpbWVzdGFtcCA9ICh0aW1lc3RhbXApID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh0aW1lc3RhbXApXG4gICAgICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKClcbiAgICAgICAgY29uc3QgZGlmZk1pbnV0ZXMgPSBNYXRoLmZsb29yKChub3cgLSBkYXRlKSAvICgxMDAwICogNjApKVxuXG4gICAgICAgIGlmIChkaWZmTWludXRlcyA8IDEpIHJldHVybiAnanVzdCBub3cnXG4gICAgICAgIGlmIChkaWZmTWludXRlcyA8IDYwKSByZXR1cm4gYCR7ZGlmZk1pbnV0ZXN9bSBhZ29gXG5cbiAgICAgICAgY29uc3QgZGlmZkhvdXJzID0gTWF0aC5mbG9vcihkaWZmTWludXRlcyAvIDYwKVxuICAgICAgICBpZiAoZGlmZkhvdXJzIDwgMjQpIHJldHVybiBgJHtkaWZmSG91cnN9aCBhZ29gXG5cbiAgICAgICAgY29uc3QgZGlmZkRheXMgPSBNYXRoLmZsb29yKGRpZmZIb3VycyAvIDI0KVxuICAgICAgICBpZiAoZGlmZkRheXMgPCA3KSByZXR1cm4gYCR7ZGlmZkRheXN9ZCBhZ29gXG5cbiAgICAgICAgcmV0dXJuIGRhdGUudG9Mb2NhbGVEYXRlU3RyaW5nKClcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiAndW5rbm93bidcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMb2FkIHVzZXJuYW1lIGFuZCB1c2VyIHN0YXR1cyBvbiBjb21wb25lbnQgbW91bnRcbiAgICBvbk1vdW50ZWQoKCkgPT4ge1xuICAgICAgbG9hZFN0b3JlZFVzZXJuYW1lKClcbiAgICAgIGxvYWRVc2VyU3RhdHVzKClcbiAgICAgIGxvYWRQb3N0c0RhdGEoKVxuICAgICAgbG9hZERlY2lzaW9uUmVwb3J0KClcbiAgICAgIGxvYWRFeGVjdXRpb25SZXN1bHQoKVxuXG4gICAgICAvLyBBZGQgYSBkZWxheSB0byBlbnN1cmUgd2UgZ2V0IHRoZSBsYXRlc3QgZXhlY3V0aW9uIHJlc3VsdFxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGxvYWRFeGVjdXRpb25SZXN1bHQoKVxuICAgICAgICBjb25zb2xlLmxvZygnUG9wdXA6IFJlbG9hZGVkIGV4ZWN1dGlvbiByZXN1bHQgYWZ0ZXIgZGVsYXknKVxuICAgICAgfSwgNTAwKVxuICAgIH0pXG5cbiAgICAvLyBMaXN0ZW4gZm9yIG1lc3NhZ2VzIGZyb20gY29udGVudCBzY3JpcHRcbiAgICBpZiAodHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY2hyb21lLnJ1bnRpbWUpIHtcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ1BPU1RTX1VQREFURUQnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1BvcHVwOiBSZWNlaXZlZCBQT1NUU19VUERBVEVEIG1lc3NhZ2UnLCBtZXNzYWdlLmRhdGEpO1xuICAgICAgICAgICAgICAgIHBvc3RzRGF0YS52YWx1ZSA9IG1lc3NhZ2UuZGF0YTtcbiAgICAgICAgICAgICAgICAvLyBBbHNvIHJlZnJlc2ggdXNlciBzdGF0dXMgaWYgbmVlZGVkLCBvciBtYXBwaW5nIGxvZ2ljIGhlcmVcbiAgICAgICAgICAgICAgICAvLyBGb3Igbm93IGp1c3QgZXh0ZW5kZWQgZGF0YVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHN0b3JhZ2UgY2hhbmdlcyB0byB1cGRhdGUgVUkgd2hlbiB1c2VybmFtZSBvciBzdGF0dXMgaXMgc3RvcmVkXG4gICAgaWYgKHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnICYmIGNocm9tZS5zdG9yYWdlKSB7XG4gICAgICBjaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIoKGNoYW5nZXMsIGFyZWEpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1BvcHVwOiBTdG9yYWdlIGNoYW5nZWQ6JywgT2JqZWN0LmtleXMoY2hhbmdlcyksICdBcmVhOicsIGFyZWEpO1xuXG4gICAgICAgIGlmIChjaGFuZ2VzLnJlZGRpdFVzZXIgJiYgY2hhbmdlcy5yZWRkaXRVc2VyLm5ld1ZhbHVlICYmIGNoYW5nZXMucmVkZGl0VXNlci5uZXdWYWx1ZS5zZXJlbl9uYW1lKSB7XG4gICAgICAgICAgc3RvcmVkVXNlcm5hbWUudmFsdWUgPSBjaGFuZ2VzLnJlZGRpdFVzZXIubmV3VmFsdWUuc2VyZW5fbmFtZVxuICAgICAgICAgIGNvbnNvbGUubG9nKCdQb3B1cDogVXNlcm5hbWUgdXBkYXRlZCB2aWEgc3RvcmFnZSBsaXN0ZW5lcjonLCBjaGFuZ2VzLnJlZGRpdFVzZXIubmV3VmFsdWUuc2VyZW5fbmFtZSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaGFuZ2VzLnVzZXJTdGF0dXMgJiYgY2hhbmdlcy51c2VyU3RhdHVzLm5ld1ZhbHVlKSB7XG4gICAgICAgICAgdXNlclN0YXR1cy52YWx1ZSA9IGNoYW5nZXMudXNlclN0YXR1cy5uZXdWYWx1ZVxuICAgICAgICAgIGNvbnNvbGUubG9nKCdQb3B1cDogVXNlciBzdGF0dXMgdXBkYXRlZCB2aWEgc3RvcmFnZSBsaXN0ZW5lcjonLCBjaGFuZ2VzLnVzZXJTdGF0dXMubmV3VmFsdWUpXG4gICAgICAgIH1cblxuICAgICAgICAvLyBMaXN0ZW4gZm9yIGxhdGVzdFBvc3RzRGF0YSBjaGFuZ2VzIGluIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgaWYgKGFyZWEgPT09ICdsb2NhbCcgJiYgY2hhbmdlcy5sYXRlc3RQb3N0c0RhdGEgJiYgY2hhbmdlcy5sYXRlc3RQb3N0c0RhdGEubmV3VmFsdWUpIHtcbiAgICAgICAgICBwb3N0c0RhdGEudmFsdWUgPSBjaGFuZ2VzLmxhdGVzdFBvc3RzRGF0YS5uZXdWYWx1ZTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnUG9wdXA6IFBvc3RzIGRhdGEgdXBkYXRlZCB2aWEgc3RvcmFnZSBsaXN0ZW5lcicpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdQb3B1cDogTmV3IHBvc3RzIGRhdGE6JywgY2hhbmdlcy5sYXRlc3RQb3N0c0RhdGEubmV3VmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTGlzdGVuIGZvciBkZWNpc2lvbiByZXBvcnQgY2hhbmdlcyBpbiBsb2NhbCBzdG9yYWdlXG4gICAgICAgIGlmIChhcmVhID09PSAnbG9jYWwnICYmIGNoYW5nZXMubGFzdERlY2lzaW9uUmVwb3J0ICYmIGNoYW5nZXMubGFzdERlY2lzaW9uUmVwb3J0Lm5ld1ZhbHVlKSB7XG4gICAgICAgICAgZGVjaXNpb25SZXBvcnQudmFsdWUgPSBjaGFuZ2VzLmxhc3REZWNpc2lvblJlcG9ydC5uZXdWYWx1ZTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnUG9wdXA6IERlY2lzaW9uIHJlcG9ydCB1cGRhdGVkIHZpYSBzdG9yYWdlIGxpc3RlbmVyJyk7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1BvcHVwOiBOZXcgZGVjaXNpb24gcmVwb3J0OicsIGNoYW5nZXMubGFzdERlY2lzaW9uUmVwb3J0Lm5ld1ZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExpc3RlbiBmb3IgZXhlY3V0aW9uIHJlc3VsdCBjaGFuZ2VzIGluIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgaWYgKGFyZWEgPT09ICdsb2NhbCcgJiYgY2hhbmdlcy5sYXN0RXhlY3V0aW9uUmVzdWx0ICYmIGNoYW5nZXMubGFzdEV4ZWN1dGlvblJlc3VsdC5uZXdWYWx1ZSkge1xuICAgICAgICAgIGV4ZWN1dGlvblJlc3VsdC52YWx1ZSA9IGNoYW5nZXMubGFzdEV4ZWN1dGlvblJlc3VsdC5uZXdWYWx1ZTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnUG9wdXA6IEV4ZWN1dGlvbiByZXN1bHQgdXBkYXRlZCB2aWEgc3RvcmFnZSBsaXN0ZW5lcicpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdQb3B1cDogTmV3IGV4ZWN1dGlvbiByZXN1bHQ6JywgY2hhbmdlcy5sYXN0RXhlY3V0aW9uUmVzdWx0Lm5ld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBNYW51YWwgcmVmcmVzaCBmdW5jdGlvbiBmb3IgZGVidWdnaW5nXG4gICAgY29uc3QgcmVmcmVzaFBvc3RzRGF0YSA9ICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1BvcHVwOiBNYW51YWwgcmVmcmVzaCB0cmlnZ2VyZWQnKTtcbiAgICAgICAgbG9hZFBvc3RzRGF0YSgpO1xuICAgICAgICAvLyBBbHNvIGRlYnVnIGFsbCBzdG9yYWdlIGNvbnRlbnRzXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChudWxsLCAoYWxsRGF0YSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1BvcHVwOiBBbGwgc3RvcmFnZSBjb250ZW50czonLCBhbGxEYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgY3JlYXRlUG9zdCA9IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdDcmVhdGluZyBuZXcgcG9zdC4uLicpXG5cbiAgICAgIC8vIEZpcnN0IGNoZWNrIGlmIHdlIGhhdmUgYSBzdG9yZWQgdXNlcm5hbWVcbiAgICAgIGlmICghc3RvcmVkVXNlcm5hbWUudmFsdWUpIHtcbiAgICAgICAgYXdhaXQgbG9hZFN0b3JlZFVzZXJuYW1lKClcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgd2UncmUgYWxyZWFkeSBvbiBSZWRkaXRcbiAgICAgICAgY29uc3QgY3VycmVudFRhYiA9IGF3YWl0IGdldEN1cnJlbnRUYWIoKVxuXG4gICAgICAgIGlmIChjdXJyZW50VGFiLnVybCAmJiBjdXJyZW50VGFiLnVybC5pbmNsdWRlcygncmVkZGl0LmNvbScpKSB7XG4gICAgICAgICAgLy8gQWxyZWFkeSBvbiBSZWRkaXQsIHVzZSBzdG9yZWQgdXNlcm5hbWUgaWYgYXZhaWxhYmxlIG9yIGV4dHJhY3QgZnJvbSBwYWdlXG4gICAgICAgICAgY29uc29sZS5sb2coJ0FscmVhZHkgb24gUmVkZGl0LCB1c2luZyBzdG9yZWQgdXNlcm5hbWUgb3IgZXh0cmFjdGluZyBmcm9tIHBhZ2UnKVxuICAgICAgICAgIGlmIChzdG9yZWRVc2VybmFtZS52YWx1ZSkge1xuICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIHN0b3JlZCB1c2VybmFtZSwgdXNlIGJhY2tncm91bmQgc2NyaXB0IHRvIGNyZWF0ZSBwcm9wZXIgc3VibWl0IHRhYlxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1VzaW5nIGJhY2tncm91bmQgc2NyaXB0IHRvIGNyZWF0ZSBzdWJtaXQgdGFiJylcbiAgICAgICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgdHlwZTogJ0NSRUFURV9QT1NUX0ZST01fUE9QVVAnLFxuICAgICAgICAgICAgICB1c2VyTmFtZTogc3RvcmVkVXNlcm5hbWUudmFsdWVcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCYWNrZ3JvdW5kIHNjcmlwdCBjcmVhdGVkIHBvc3QgdGFiIHN1Y2Nlc3NmdWxseTonLCByZXNwb25zZS50YWJJZClcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIHBvc3QgdGFiOicsIHJlc3BvbnNlLmVycm9yKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHJlcXVlc3RpbmcgcG9zdCB0YWIgY3JlYXRpb246JywgZXJyb3IpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBObyBzdG9yZWQgdXNlcm5hbWUsIGV4dHJhY3QgZnJvbSBwYWdlIGZpcnN0XG4gICAgICAgICAgICBhd2FpdCBpbml0aWF0ZVBvc3RDcmVhdGlvbk9uUmVkZGl0KGN1cnJlbnRUYWIuaWQpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE9wZW4gUmVkZGl0IGZpcnN0LCB0aGVuIGdldCB1c2VybmFtZSBmcm9tIHBhZ2VcbiAgICAgICAgICBjb25zb2xlLmxvZygnT3BlbmluZyBSZWRkaXQgdG8gZXh0cmFjdCB1c2VybmFtZScpXG4gICAgICAgICAgYXdhaXQgb3BlblJlZGRpdEFuZENyZWF0ZVBvc3QoKVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBjcmVhdGVQb3N0OicsIGVycm9yKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGdldEN1cnJlbnRUYWIgPSBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBbdGFiXSA9IGF3YWl0IGNocm9tZS50YWJzLnF1ZXJ5KHsgYWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlIH0pXG4gICAgICAgIHJldHVybiB0YWJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgY3VycmVudCB0YWI6JywgZXJyb3IpXG4gICAgICAgIHJldHVybiB7IHVybDogbnVsbCwgaWQ6IG51bGwgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IG9wZW5SZWRkaXRBbmRDcmVhdGVQb3N0ID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIC8vIFVzZSBjZW50cmFsaXplZCB0YWIgcmV1c2Ugc3lzdGVtIGluc3RlYWQgb2YgY3JlYXRpbmcgbmV3IHRhYlxuICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgdHlwZTogJ0NSRUFURV9QT1NUX1RBQicsXG4gICAgICAgICAgcG9zdERhdGE6IG51bGwgLy8gTGV0IGJhY2tncm91bmQgc2NyaXB0IGdlbmVyYXRlIHZpYSBBUElcbiAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQb3N0IHRhYiBjcmVhdGVkL3JldXNlZCBzdWNjZXNzZnVsbHk6JywgcmVzcG9uc2UudGFiSWQpXG4gICAgICAgICAgICByZXNvbHZlKClcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNyZWF0ZSBwb3N0IHRhYjonLCByZXNwb25zZS5lcnJvcilcbiAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIHBvc3QgdGFiOicsIGVycm9yKVxuICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBpbml0aWF0ZVBvc3RDcmVhdGlvbk9uUmVkZGl0ID0gYXN5bmMgKHRhYklkKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBTZW5kIG1lc3NhZ2UgdG8gY29udGVudCBzY3JpcHQgdG8gZXh0cmFjdCB1c2VybmFtZSBhbmQgc3RhcnQgcG9zdCBjcmVhdGlvblxuICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwge1xuICAgICAgICAgIHR5cGU6ICdFWFRSQUNUX1VTRVJOQU1FX0FORF9DUkVBVEVfUE9TVCdcbiAgICAgICAgfSlcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNvbW11bmljYXRpbmcgd2l0aCBjb250ZW50IHNjcmlwdDonLCBlcnJvcilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBkZWxldGVMYXN0UG9zdCA9IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdEZWxldGluZyBsYXN0IHBvc3QuLi4nKVxuXG4gICAgICBpZiAoIXN0b3JlZFVzZXJuYW1lLnZhbHVlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdObyB1c2VybmFtZSBzdG9yZWQsIGNhbm5vdCBkZWxldGUgbGFzdCBwb3N0JylcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEdldCBjdXJyZW50IHRhYiBhbmQgc2VuZCBkZWxldGUgbWVzc2FnZSBkaXJlY3RseVxuICAgICAgICBjb25zdCBjdXJyZW50VGFiID0gYXdhaXQgZ2V0Q3VycmVudFRhYigpXG5cbiAgICAgICAgaWYgKGN1cnJlbnRUYWIudXJsICYmIGN1cnJlbnRUYWIudXJsLmluY2x1ZGVzKCdyZWRkaXQuY29tJykpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnU2VuZGluZyBkZWxldGUgbWVzc2FnZSB0byBjdXJyZW50IHRhYjonLCBjdXJyZW50VGFiLmlkKVxuICAgICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKGN1cnJlbnRUYWIuaWQsIHtcbiAgICAgICAgICAgIHR5cGU6ICdERUxFVEVfTEFTVF9QT1NUJyxcbiAgICAgICAgICAgIHVzZXJOYW1lOiBzdG9yZWRVc2VybmFtZS52YWx1ZVxuICAgICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0RlbGV0ZSBtZXNzYWdlIHNlbnQgc3VjY2Vzc2Z1bGx5OicsIHJlc3BvbnNlKVxuICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNlbmRpbmcgZGVsZXRlIG1lc3NhZ2U6JywgZXJyb3IpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnQ3VycmVudCB0YWIgaXMgbm90IG9uIFJlZGRpdCwgY2Fubm90IGRlbGV0ZSBwb3N0JylcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZGVsZXRlTGFzdFBvc3Q6JywgZXJyb3IpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc2NoZWR1bGVQb3N0ID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ1NjaGVkdWxpbmcgcG9zdC4uLicpXG4gICAgICAvLyBUT0RPOiBPcGVuIHNjaGVkdWxlclxuICAgIH1cblxuICAgIGNvbnN0IG9wZW5TZXR0aW5ncyA9ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdPcGVuaW5nIHNldHRpbmdzLi4uJylcbiAgICAgIC8vIFRPRE86IE9wZW4gc2V0dGluZ3MgcGFnZVxuICAgIH1cblxuICAgIGNvbnN0IGRldGVjdFVzZXIgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygnTWFudWFsbHkgZGV0ZWN0aW5nIFJlZGRpdCB1c2VyLi4uJylcblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVXNlIGNlbnRyYWxpemVkIHRhYiByZXVzZSBzeXN0ZW0gZm9yIHVzZXJuYW1lIGV4dHJhY3Rpb25cbiAgICAgICAgY29uc29sZS5sb2coJ1VzaW5nIHRhYiByZXVzZSB0byBkZXRlY3QgdXNlci4uLicpXG4gICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICB0eXBlOiAnUkVVU0VfUkVERElUX1RBQicsXG4gICAgICAgICAgdXJsOiAnaHR0cHM6Ly93d3cucmVkZGl0LmNvbS8nLFxuICAgICAgICAgIGFjdGlvbjoge1xuICAgICAgICAgICAgdHlwZTogJ0VYVFJBQ1RfVVNFUk5BTUVfQU5EX0NSRUFURV9QT1NUJ1xuICAgICAgICAgIH1cbiAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUYWIgcmV1c2VkIGZvciB1c2VybmFtZSBkZXRlY3Rpb246JywgcmVzcG9uc2UudGFiSWQpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byByZXVzZSB0YWIgZm9yIHVzZXJuYW1lIGRldGVjdGlvbjonLCByZXNwb25zZS5lcnJvcilcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciByZXVzaW5nIHRhYiBmb3IgdXNlcm5hbWUgZGV0ZWN0aW9uOicsIGVycm9yKVxuICAgICAgICB9KVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gZGV0ZWN0VXNlcjonLCBlcnJvcilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBjaGVja1VzZXJTdGF0dXMgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygnQ2hlY2tpbmcgdXNlciBzdGF0dXMgYW5kIGxhc3QgcG9zdCBkYXRlLi4uJylcblxuICAgICAgaWYgKCFzdG9yZWRVc2VybmFtZS52YWx1ZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnTm8gdXNlcm5hbWUgc3RvcmVkLCBjYW5ub3QgY2hlY2sgdXNlciBzdGF0dXMnKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVXNlIGNlbnRyYWxpemVkIHRhYiByZXVzZSBzeXN0ZW0gZm9yIHN0YXR1cyBjaGVja1xuICAgICAgICBjb25zb2xlLmxvZygnVXNpbmcgdGFiIHJldXNlIHRvIGNoZWNrIHVzZXIgc3RhdHVzLi4uJylcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgIHR5cGU6ICdSRVVTRV9SRURESVRfVEFCJyxcbiAgICAgICAgICB1cmw6ICdodHRwczovL3d3dy5yZWRkaXQuY29tLycsXG4gICAgICAgICAgYWN0aW9uOiB7XG4gICAgICAgICAgICB0eXBlOiAnQ0hFQ0tfVVNFUl9TVEFUVVMnLFxuICAgICAgICAgICAgdXNlck5hbWU6IHN0b3JlZFVzZXJuYW1lLnZhbHVlXG4gICAgICAgICAgfVxuICAgICAgICB9KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1RhYiByZXVzZWQgZm9yIHN0YXR1cyBjaGVjazonLCByZXNwb25zZS50YWJJZClcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIHJldXNlIHRhYiBmb3Igc3RhdHVzIGNoZWNrOicsIHJlc3BvbnNlLmVycm9yKVxuICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHJldXNpbmcgdGFiIGZvciBzdGF0dXMgY2hlY2s6JywgZXJyb3IpXG4gICAgICAgIH0pXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbiBjaGVja1VzZXJTdGF0dXM6JywgZXJyb3IpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhcnRBdXRvRmxvdyA9IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdTdGFydGluZyBhdXRvIGZsb3cgbWFudWFsbHkuLi4nKVxuXG4gICAgICBpZiAoIXN0b3JlZFVzZXJuYW1lLnZhbHVlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdObyB1c2VybmFtZSBzdG9yZWQsIGNhbm5vdCBzdGFydCBhdXRvIGZsb3cnKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc29sZS5sb2coJ1RyaWdnZXJpbmcgYXV0byBmbG93IGF1dG9tYXRpb24uLi4nKVxuICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgICAgdHlwZTogJ0NIRUNLX1VTRVJfU1RBVFVTJyxcbiAgICAgICAgICB1c2VyTmFtZTogc3RvcmVkVXNlcm5hbWUudmFsdWVcbiAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBdXRvIGZsb3cgc3RhcnRlZCBzdWNjZXNzZnVsbHk6JywgcmVzcG9uc2UubWVzc2FnZSlcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUYWIgSUQ6JywgcmVzcG9uc2UudGFiSWQpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBzdGFydCBhdXRvIGZsb3c6JywgcmVzcG9uc2UuZXJyb3IpXG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igc3RhcnRpbmcgYXV0byBmbG93OicsIGVycm9yKVxuICAgICAgICB9KVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgaW4gc3RhcnRBdXRvRmxvdzonLCBlcnJvcilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBvcGVuSGVscCA9ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCdPcGVuaW5nIGhlbHAuLi4nKVxuICAgICAgLy8gVE9ETzogT3BlbiBoZWxwIGRvY3VtZW50YXRpb25cbiAgICB9XG5cbiAgICAvLyBUZXN0IGZ1bmN0aW9uIHRvIGNyZWF0ZSBtb2NrIGV4ZWN1dGlvbiByZXN1bHRcbiAgICBjb25zdCB0ZXN0RXhlY3V0aW9uUmVzdWx0ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgbW9ja1Jlc3VsdCA9IHtcbiAgICAgICAgc3RhdHVzOiAnY29tcGxldGVkJyxcbiAgICAgICAgcG9zdFJlc3VsdDogJ2NyZWF0ZWQnLFxuICAgICAgICBwb3N0SWQ6ICd0ZXN0MTIzNDUnLFxuICAgICAgICBlcnJvck1lc3NhZ2U6IG51bGwsXG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBsYXN0RXhlY3V0aW9uUmVzdWx0OiBtb2NrUmVzdWx0IH0pXG4gICAgICAgIGNvbnNvbGUubG9nKCdUZXN0IGV4ZWN1dGlvbiByZXN1bHQgc2F2ZWQ6JywgbW9ja1Jlc3VsdClcbiAgICAgICAgbG9hZEV4ZWN1dGlvblJlc3VsdCgpXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gc2F2ZSB0ZXN0IGV4ZWN1dGlvbiByZXN1bHQ6JywgZXJyb3IpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0b3JlZFVzZXJuYW1lLFxuICAgICAgdXNlclN0YXR1cyxcbiAgICAgIHBvc3RzRGF0YSxcbiAgICAgIGRlY2lzaW9uUmVwb3J0LFxuICAgICAgZXhlY3V0aW9uUmVzdWx0LFxuICAgICAgcG9zdHNDb3VudFRleHQsXG4gICAgICBzaG9ydExhc3RQb3N0VGV4dCxcbiAgICAgIGZvcm1hdExhc3RQb3N0VGV4dCxcbiAgICAgIGZvcm1hdFRpbWVzdGFtcCxcbiAgICAgIGZvcm1hdFN0YXR1cyxcbiAgICAgIGZvcm1hdERlY2lzaW9uLFxuICAgICAgZm9ybWF0UmVhc29uLFxuICAgICAgZm9ybWF0RXhlY3V0aW9uU3RhdHVzLFxuICAgICAgZm9ybWF0UG9zdFJlc3VsdCxcbiAgICAgIGdldERlY2lzaW9uQ2FyZENsYXNzLFxuICAgICAgZ2V0RGVjaXNpb25JY29uLFxuICAgICAgZ2V0U3RhdHVzQ2xhc3MsXG4gICAgICBnZXREZWNpc2lvbkNsYXNzLFxuICAgICAgZ2V0RXhlY3V0aW9uSWNvbixcbiAgICAgIGdldEV4ZWN1dGlvblN0YXR1c0NsYXNzLFxuICAgICAgZ2V0UG9zdFJlc3VsdENsYXNzLFxuICAgICAgY3JlYXRlUG9zdCxcbiAgICAgIGRldGVjdFVzZXIsXG4gICAgICBjaGVja1VzZXJTdGF0dXMsXG4gICAgICBzdGFydEF1dG9GbG93LFxuICAgICAgZGVsZXRlTGFzdFBvc3QsXG4gICAgICBzY2hlZHVsZVBvc3QsXG4gICAgICBvcGVuU2V0dGluZ3MsXG4gICAgICBvcGVuSGVscCxcbiAgICAgIHJlZnJlc2hQb3N0c0RhdGEsXG4gICAgICB0ZXN0RXhlY3V0aW9uUmVzdWx0XG4gICAgfVxuICB9XG59KVxuPC9zY3JpcHQ+XG5cbjxzdHlsZSBsYW5nPVwic2Nzc1wiIHNjb3BlZD5cbi5zdGF0dXMtY2FyZCB7XG5cdCAgYmFja2dyb3VuZDogI2Y1ZjVmNTtcblx0ICBjb2xvcjogIzMzMztcblx0ICBib3JkZXItcmFkaXVzOiA4cHg7XG5cdCAgYm9yZGVyOiAxcHggc29saWQgI2UwZTBlMDtcblx0ICBib3gtc2hhZG93OiBub25lO1xufVxuXG4uc3RhdHVzLXRpdGxlIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcblx0ICBjb2xvcjogIzMzMztcbn1cblxuLnN0YXR1cy1pdGVtIHtcblx0ICBtYXJnaW4tYm90dG9tOiAycHg7XG5cdCAgY29sb3I6ICMzMzM7XG5cdCAgZm9udC1zaXplOiAxMnB4O1xufVxuXG4uc3RhdHVzLXRpbWUge1xuXHQgIG1hcmdpbi10b3A6IDRweDtcblx0ICBjb2xvcjogIzc3Nztcblx0ICBmb250LXNpemU6IDEwcHg7XG59XG5cbi5kZWNpc2lvbi1jYXJkIHtcblx0ICBiYWNrZ3JvdW5kOiAjZjVmNWY1O1xuXHQgIGNvbG9yOiAjMzMzO1xuXHQgIGJvcmRlci1yYWRpdXM6IDhweDtcblx0ICBib3JkZXI6IDFweCBzb2xpZCAjZTBlMGUwO1xuXHQgIGJveC1zaGFkb3c6IG5vbmU7XG59XG5cbi5kZWNpc2lvbi10aXRsZSB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG5cdCAgY29sb3I6ICMzMzM7XG5cdCAgZm9udC1zaXplOiAxM3B4O1xufVxuXG4uZGVjaXNpb24taXRlbSB7XG5cdCAgbWFyZ2luLWJvdHRvbTogMnB4O1xuXHQgIGNvbG9yOiAjMzMzO1xuXHQgIGZvbnQtc2l6ZTogMTJweDtcbn1cblxuLmRlY2lzaW9uLXRpbWUge1xuXHQgIG1hcmdpbi10b3A6IDRweDtcblx0ICBjb2xvcjogIzc3Nztcblx0ICBmb250LXNpemU6IDEwcHg7XG59XG5cbi5leGVjdXRpb24tY2FyZCB7XG5cdCAgYmFja2dyb3VuZDogI2Y1ZjVmNTtcblx0ICBjb2xvcjogIzMzMztcblx0ICBib3JkZXItcmFkaXVzOiA4cHg7XG5cdCAgYm9yZGVyOiAxcHggc29saWQgI2UwZTBlMDtcblx0ICBib3gtc2hhZG93OiBub25lO1xufVxuXG4uZXhlY3V0aW9uLXRpdGxlIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcblx0ICBjb2xvcjogIzMzMztcblx0ICBmb250LXNpemU6IDEzcHg7XG59XG5cbi5leGVjdXRpb24taXRlbSB7XG5cdCAgbWFyZ2luLWJvdHRvbTogMnB4O1xuXHQgIGNvbG9yOiAjMzMzO1xuXHQgIGZvbnQtc2l6ZTogMTJweDtcbn1cblxuLmV4ZWN1dGlvbi10aW1lIHtcblx0ICBtYXJnaW4tdG9wOiA0cHg7XG5cdCAgY29sb3I6ICM3Nzc7XG5cdCAgZm9udC1zaXplOiAxMHB4O1xufVxuXG4vKiBOZXV0cmFsLCBzaW5nbGUtY29sb3Igc3R5bGluZyBmb3Igc3RhdHVzIHRleHQgKi9cbi50ZXh0LXBvc2l0aXZlLFxuLnRleHQtbmVnYXRpdmUsXG4udGV4dC13YXJuaW5nIHtcblx0ICBjb2xvcjogaW5oZXJpdCAhaW1wb3J0YW50O1xuXHQgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuXHQgIHBhZGRpbmc6IDA7XG5cdCAgYm9yZGVyLXJhZGl1czogMDtcblx0ICBmb250LXdlaWdodDogNTAwO1xuXHQgIGJvcmRlcjogbm9uZTtcbn1cblxuLyogTWFrZSB0aGUgY2FyZCBzZWN0aW9ucyB0aWdodGVyIGZvciBhIG1vcmUgY29tcGFjdCBsYXlvdXQgKi9cbi5kZWNpc2lvbi1jYXJkIC5xLWNhcmRfX3NlY3Rpb24sXG4uZXhlY3V0aW9uLWNhcmQgLnEtY2FyZF9fc2VjdGlvbiB7XG5cdCAgcGFkZGluZy10b3A6IDRweDtcblx0ICBwYWRkaW5nLWJvdHRvbTogNHB4O1xufVxuXG4vKiBNb25vY2hyb21lLCBjb21wYWN0IGJ1dHRvbnMgd2l0aCBncmFkaWVudCBiYWNrZ3JvdW5kICovXG4ubW9uby1idG4ge1xuXHQgIHRleHQtdHJhbnNmb3JtOiBub25lO1xuXHQgIGZvbnQtc2l6ZTogMTFweDtcblx0ICBwYWRkaW5nOiAwIDEwcHg7XG5cdCAgbWluLXdpZHRoOiAwO1xuXHQgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICNCMEUyRkYsICNDQUU4RkYpO1xuXHQgIGNvbG9yOiAjMTIzICFpbXBvcnRhbnQ7XG59XG48L3N0eWxlPlxuIl0sIm5hbWVzIjpbInVzZXJTdGF0dXMiLCJfY3JlYXRlQmxvY2siLCJRUGFnZSIsIl9jcmVhdGVDb21tZW50Vk5vZGUiLCJfY3JlYXRlRWxlbWVudFZOb2RlIiwiX2NyZWF0ZVZOb2RlIiwiUUJ0biIsIlFUb29sdGlwIiwiX2NyZWF0ZUVsZW1lbnRCbG9jayIsIl90b0Rpc3BsYXlTdHJpbmciLCJfRnJhZ21lbnQiLCJRSWNvbiIsIl9vcGVuQmxvY2siLCJfY3JlYXRlVGV4dFZOb2RlIiwiUVNlcGFyYXRvciIsIlFDYXJkIiwiUUNhcmRTZWN0aW9uIiwiX25vcm1hbGl6ZUNsYXNzIl0sIm1hcHBpbmdzIjoiOztBQXFLQSxNQUFLLFlBQWEsZ0JBQWE7QUFBQSxFQUM3QixNQUFNO0FBQUEsRUFDTixRQUFRO0FBQ04sVUFBTSxpQkFBaUIsSUFBSSxFQUFFO0FBQzdCLFVBQU0sYUFBYSxJQUFJLElBQUk7QUFDM0IsVUFBTSxZQUFZLElBQUksSUFBSTtBQUMxQixVQUFNLGlCQUFpQixJQUFJLElBQUk7QUFDL0IsVUFBTSxrQkFBa0IsSUFBSSxJQUFJO0FBRWhDLFVBQU0sZ0JBQWdCLE1BQU07QUFDMUIsWUFBTSxPQUFPLFVBQVU7QUFDdkIsWUFBTSxRQUFRLE1BQU0sU0FBUyxNQUFNLFdBQVc7QUFDOUMsYUFBTyxNQUFNLFFBQVEsS0FBSyxJQUFJLFFBQVEsQ0FBQztBQUFBLElBQ3pDO0FBRUEsVUFBTSxpQkFBaUIsU0FBUyxNQUFNO0FBQ3BDLFlBQU0sYUFBYSxXQUFXLE9BQU87QUFDckMsVUFBSSxPQUFPLGVBQWUsVUFBVTtBQUNsQyxnQkFBUSxJQUFJLDRDQUE0QyxVQUFVO0FBQ2xFLGVBQU87QUFBQSxNQUNUO0FBQ0EsWUFBTSxPQUFPLFVBQVU7QUFDdkIsWUFBTSxZQUFZLE1BQU07QUFDeEIsVUFBSSxPQUFPLGNBQWMs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
