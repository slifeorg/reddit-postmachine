/**
 * DOM script for Reddit Post Machine BEX
 * This script runs in the context of web pages to handle DOM manipulation
 */
import { bexDom } from 'quasar/wrappers'
import { domLogger } from './logger.js'

// Initialize DOM script
domLogger.log('Reddit Post Machine DOM script loaded');

// Patch beforeunload to prevent "Leave site?" alerts
;(() => {
	try {
		const originalAdd = window.addEventListener
		window.addEventListener = function (type, listener, options) {
			if (type === 'beforeunload') return
			return originalAdd.call(this, type, listener, options)
		}
		window.onbeforeunload = null
		window.addEventListener('beforeunload', (e) => {
			e.stopImmediatePropagation()
		}, true)
	} catch (e) {}
})()

const RedditDOMHelper = {
	// ========================================================================
	// UTILITIES
	// ========================================================================

	async sleep(ms) {
		return new Promise(r => setTimeout(r, ms))
	},

	// Helper to find elements inside Shadow DOM
	deepQuery(selector, root = document) {
		const el = root.querySelector(selector)
		if (el) return el
		for (const elem of root.querySelectorAll('*')) {
			if (elem.shadowRoot) {
				const found = this.deepQuery(selector, elem.shadowRoot)
				if (found) return found
			}
		}
		return null
	},

	// ✅ CRITICAL FIX: Find all posts across all Shadow Roots
	collectAllPostsRecursive(root = document, results = []) {
		// 1. Check current level
		const posts = root.querySelectorAll('shreddit-post, [data-testid="post-container"], .Post');
		posts.forEach(p => results.push(p));

		// 2. Dive into specific containers known to hold posts
		const feed = root.querySelector('shreddit-feed');
		if (feed && feed.shadowRoot) {
			this.collectAllPostsRecursive(feed.shadowRoot, results);
		}

		// 3. Brute force check all elements with shadowRoots (expensive but necessary for some layouts)
		const all = root.querySelectorAll('*');
		for (const el of all) {
			if (el.shadowRoot && el.tagName !== 'SHREDDIT-FEED') { // feed already checked
				this.collectAllPostsRecursive(el.shadowRoot, results);
			}
		}

		return results;
	},

	// ========================================================================
	// NAVIGATION & AUTH
	// ========================================================================

	async navigateToUserProfile(username) {
		domLogger.log(`Navigating to user profile: ${username}`);
		const cleanUser = username.replace('u/', '');

		// Direct URL navigation is most reliable for SPA
		if (!window.location.href.includes(`/user/${cleanUser}`)) {
			window.location.href = `https://www.reddit.com/user/${cleanUser}`;
			return true;
		}
		return true;
	},

	async navigateToPostsTab(username) {
		domLogger.log('Navigating to Posts tab...');

		// If already on submitted page
		if (window.location.href.includes('/submitted')) return true;

		// Try clicking the tab first
		const postsTab = this.deepQuery('a[href*="/submitted"]');
		if (postsTab) {
			postsTab.click();
			await this.sleep(2000);
			return true;
		}

		// Fallback to direct URL
		const cleanUser = username ? username.replace('u/', '') :
			window.location.pathname.match(/\/user\/([^\/]+)/)?.[1];

		if (cleanUser) {
			window.location.href = `https://www.reddit.com/user/${cleanUser}/submitted/`;
			await this.sleep(2000);
			return true;
		}
		return false;
	},

	// ========================================================================
	// POST COLLECTION (DATA EXTRACTION)
	// ========================================================================

	async checkUserPosts() {
		domLogger.log('[DOM] Checking user posts...');

		// Wait a bit for Shadow DOM to hydrate
		await this.sleep(2000);

		// ✅ Use the recursive collector
		let rawPosts = [];
		const uniqueIds = new Set();

		// Retry loop to wait for posts
		for(let i=0; i<5; i++) {
			const found = this.collectAllPostsRecursive(document);
			if(found.length > 0) {
				// Deduplicate
				found.forEach(p => {
					if(!uniqueIds.has(p.id)) {
						uniqueIds.add(p.id);
						rawPosts.push(p);
					}
				});
				break;
			}
			await this.sleep(1000);
		}

		domLogger.log(`[DOM] Found ${rawPosts.length} posts`);

		if (rawPosts.length === 0) {
			return { total: 0, lastPostDate: null, posts: [] };
		}

		// Extract metadata
		const postsWithMetadata = rawPosts.map(post => {
			const getAttr = (name) => post.getAttribute(name) || "";
			const timestamp = getAttr("created-timestamp") ||
				post.querySelector("time")?.getAttribute("datetime");

			// Determine status
			const isRemoved = post.textContent?.toLowerCase().includes("removed by") ||
				post.shadowRoot?.textContent?.toLowerCase().includes("removed by") ||
				getAttr("item-state") === "moderator_removed" ||
				!!post.querySelector('[icon-name="remove"]');

			return {
				id: post.id || "",
				title: getAttr("post-title") || post.querySelector("h3")?.textContent?.trim() || "",
				url: getAttr("permalink") || "",
				timestamp,
				author: getAttr("author") || "",
				score: parseInt(getAttr("score")) || 0,
				isRemoved: isRemoved,
				// We do NOT send the DOM element back to content-script/background
				// We keep it internally or find it again by ID for deletion
				_domId: post.id
			};
		}).filter(p => p.timestamp); // Filter invalid posts

		// Sort newest first
		postsWithMetadata.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

		return {
			total: postsWithMetadata.length,
			lastPostDate: postsWithMetadata.length > 0 ? postsWithMetadata[0].timestamp : null,
			posts: postsWithMetadata
		};
	},

	// ========================================================================
	// POST DELETION
	// ========================================================================

	async deleteLastPost(postData) {
		domLogger.log('[DOM] Attempting delete:', postData);

		// 1. Find the post element again
		let postElement = null;
		if (postData && postData.id) {
			// Try finding by ID
			const allPosts = this.collectAllPostsRecursive(document);
			postElement = allPosts.find(p => p.id === postData.id);
		}

		if (!postElement) {
			// Fallback: take the first post on the page
			const allPosts = this.collectAllPostsRecursive(document);
			if (allPosts.length > 0) postElement = allPosts[0];
		}

		if (!postElement) {
			domLogger.error('[DOM] Post element not found for deletion');
			return false;
		}

		try {
			// 2. Open Overflow Menu (Three dots)
			// It might be in Shadow DOM or Light DOM
			let menuBtn = postElement.querySelector('shreddit-overflow-menu button') ||
				this.deepQuery('button[aria-label="More options"]', postElement) ||
				this.deepQuery('[data-testid="post-menu-trigger"]', postElement);

			if (!menuBtn && postElement.shadowRoot) {
				menuBtn = this.deepQuery('button[aria-label="More options"]', postElement.shadowRoot);
			}

			if (!menuBtn) {
				domLogger.error('[DOM] Menu button not found');
				return false;
			}

			menuBtn.click();
			await this.sleep(1000);

			// 3. Find Delete Button
			// This is usually in a portal/overlay at the end of <body>
			const deleteBtn = this.findButtonByText('delete');

			if (!deleteBtn) {
				domLogger.error('[DOM] Delete option not found in menu');
				return false;
			}

			deleteBtn.click();
			await this.sleep(1000);

			// 4. Confirm Deletion
			const confirmBtn = this.findButtonByText('delete', true); // Search for "Delete" button in modals

			if (confirmBtn) {
				confirmBtn.click();
				domLogger.log('[DOM] Confirmed deletion');
				await this.sleep(2000);
				return true;
			}

			return false;

		} catch (e) {
			domLogger.error('[DOM] Delete failed', e);
			return false;
		}
	},

	// Helper to find button by text (case insensitive)
	findButtonByText(text, exact = false) {
		// We need to search specifically in portals/dialogs first
		const portals = document.querySelectorAll('faceplate-portal, [role="dialog"], [role="menu"]');

		// Helper to search a root
		const searchRoot = (root) => {
			const buttons = root.querySelectorAll('button, [role="menuitem"]');
			for (const btn of buttons) {
				const content = btn.textContent?.toLowerCase() || "";
				const label = btn.getAttribute('aria-label')?.toLowerCase() || "";
				if (content.includes(text.toLowerCase()) || label.includes(text.toLowerCase())) {
					return btn;
				}
			}
			return null;
		};

		// 1. Check portals
		for (const portal of portals) {
			const found = searchRoot(portal) || (portal.shadowRoot && searchRoot(portal.shadowRoot));
			if (found) return found;
		}

		// 2. Check body
		return searchRoot(document.body);
	},

	// ========================================================================
	// FORM FILLING (SUBMIT PAGE)
	// ========================================================================

	async fillPostForm(data) {
		domLogger.log('[DOM] Filling form...', data);

		const { title, post_type, url_to_share, body_text, subreddit_name } = data;

		// 1. Select Subreddit (if on general submit page)
		if (subreddit_name && !window.location.href.includes('/r/')) {
			const subInput = this.deepQuery('input[placeholder*="community"]');
			if(subInput) {
				subInput.value = subreddit_name;
				subInput.dispatchEvent(new Event('input', {bubbles:true}));
				await this.sleep(1000);
				// Click first result
				const firstOpt = this.deepQuery('[role="option"]');
				if(firstOpt) firstOpt.click();
			}
		}

		// 2. Select Tab
		const targetTab = (post_type === 'Link') ? 'LINK' : 'TEXT';
		await this.clickTab(targetTab);

		// 3. Fill Title
		await this.fillTitle(title);

		// 4. Fill Body/Url
		if (post_type === 'Link') {
			await this.fillUrl(url_to_share);
		} else {
			await this.clickBodyField();
			await this.fillBodyText(body_text);
		}
	},

	async clickTab(val) {
		const t = this.deepQuery(`[data-select-value="${val}"]`);
		if(t) { t.click(); await this.sleep(500); return true; }
		return false;
	},

	async fillTitle(val) {
		const el = this.deepQuery('faceplate-textarea-input[name="title"]');
		if(el?.shadowRoot) {
			const i = el.shadowRoot.querySelector('textarea');
			if(i) {
				i.focus();
				i.value = val;
				i.dispatchEvent(new Event('input', {bubbles:true}));
				return true;
			}
		}
		return false;
	},

	async fillUrl(val) {
		const el = this.deepQuery('faceplate-textarea-input[name="link"]');
		if(el?.shadowRoot) {
			const i = el.shadowRoot.querySelector('textarea');
			if(i) {
				i.focus();
				i.value = val;
				i.dispatchEvent(new Event('input', {bubbles:true}));
				return true;
			}
		}
		return false;
	},

	async clickBodyField() {
		const el = this.deepQuery('shreddit-composer');
		if(el) {
			const div = el.querySelector('div[contenteditable]');
			if(div) { div.focus(); return true; }
		}
		return false;
	},

	async fillBodyText(val) {
		const el = this.deepQuery('shreddit-composer');
		if(el) {
			const div = el.querySelector('div[contenteditable]');
			if(div) {
				div.focus();
				div.innerHTML = "<p><br></p>";
				if(document.execCommand) document.execCommand("insertText", false, val);
				div.dispatchEvent(new Event('input', {bubbles:true}));
				return true;
			}
		}
		return false;
	}
};

// ============================================================================
// BRIDGE & LISTENERS
// ============================================================================

window.addEventListener('message', async (event) => {
	const { type, payload } = event.data;

	// Only listen to REDDIT_POST_MACHINE commands
	if (!type || !type.startsWith('REDDIT_POST_MACHINE_')) return;
	// Ignore results (which we sent ourselves)
	if (type === 'REDDIT_POST_MACHINE_ACTION_RESULT') return;

	domLogger.log(`[DOM] Received message: ${type}`, payload);

	if (type === 'REDDIT_POST_MACHINE_GET_POSTS') {
		const result = await RedditDOMHelper.checkUserPosts();
		window.postMessage({
			type: 'REDDIT_POST_MACHINE_ACTION_RESULT',
			action: 'GET_POSTS',
			success: true,
			data: result
		}, '*');

	} else if (type === 'REDDIT_POST_MACHINE_DELETE_POST') {
		const success = await RedditDOMHelper.deleteLastPost(payload?.post);
		window.postMessage({
			type: 'REDDIT_POST_MACHINE_ACTION_RESULT',
			action: 'DELETE_POST',
			success: success
		}, '*');

	} else if (type === 'REDDIT_POST_MACHINE_NAVIGATE_PROFILE') {
		const success = await RedditDOMHelper.navigateToUserProfile(payload?.userName);
		window.postMessage({
			type: 'REDDIT_POST_MACHINE_ACTION_RESULT',
			action: 'NAVIGATE_PROFILE',
			success: success
		}, '*');

	} else if (type === 'REDDIT_POST_MACHINE_NAVIGATE_POSTS') {
		const success = await RedditDOMHelper.navigateToPostsTab(payload?.userName);
		window.postMessage({
			type: 'REDDIT_POST_MACHINE_ACTION_RESULT',
			action: 'NAVIGATE_POSTS',
			success: success
		}, '*');

	} else if (type === 'REDDIT_POST_MACHINE_FILL_FORM') {
		await RedditDOMHelper.fillPostForm(payload);
	}
});

// Export default
export default bexDom((bridge) => {
	domLogger.log('Reddit Post Machine DOM script initialized');
	window.bridge = bridge;
});
