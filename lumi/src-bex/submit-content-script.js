import { submitLogger } from "./logger.js"
import { handleFlairSelection, handleAutomaticFlairSelection } from "./flair-handler.js"

if (window.__rpm_submit_script_running) {
	submitLogger.warn('[Submit Script] Already running on this tab, stopping duplicate.');
	// Ми не перериваємо файл повністю, щоб не зламати Quasar bridge,
	// але основну логіку нижче обгорнемо.
}
window.__rpm_submit_script_running = true;
// IMPORTANT: You cannot programmatically click the native browser "Leave site?" dialog.
// The correct approach is to prevent it from appearing by neutralizing beforeunload early.
function installBeforeUnloadBlocker() {
	try {
		if (window.__rpm_beforeunload_blocker_installed) return true
		window.__rpm_beforeunload_blocker_installed = true

		submitLogger.log('Installing robust beforeunload blocker')

		// 1. Neutralize existing handlers
		window.onbeforeunload = null
		document.onbeforeunload = null

		// 2. Prevent re-assignment of onbeforeunload
		try {
			Object.defineProperty(window, 'onbeforeunload', {
				get: () => null,
				set: () => { },
				configurable: false
			})
		} catch (e) {
			submitLogger.warn('Could not defineProperty onbeforeunload:', e)
		}

		// 3. Patch addEventListener to ignore beforeunload
		const originalAddEventListener = window.addEventListener
		window.addEventListener = function (type, listener, options) {
			if (type === 'beforeunload') {
				submitLogger.log('Blocked addEventListener for beforeunload')
				return
			}
			return originalAddEventListener.apply(this, arguments)
		}

		// 4. Add a capturing listener that stops everything
		const stopper = (e) => {
			e.stopImmediatePropagation()
			e.stopPropagation()
			delete e.returnValue
			return undefined
		}
		originalAddEventListener.call(window, 'beforeunload', stopper, true)

		submitLogger.log('Beforeunload blocker installed successfully')
		return true
	} catch (error) {
		submitLogger.warn('Failed to install beforeunload blocker:', error)
		return false
	}
}

// Run immediately on module load
installBeforeUnloadBlocker()

// ============================================================================
// AUTO-RUN BOOTSTRAP (Auto Flow)
// - Script can load on /user/.../submitted/ but submission logic must run on /submit.
// - If sessionStorage contains postdata, force-run even for background-created tabs.
// ============================================================================

; (function rpmAutoRunBootstrap() {
	try {
		if (window.__rpm_submit_autorun_bootstrap__) return
		window.__rpm_submit_autorun_bootstrap__ = true

		const url = window.location.href
		const path = window.location.pathname || ""
		const isSubmit = (
			path === '/submit' ||
			path.startsWith('/submit/') ||
			/^\/r\/[^\/]+\/submit(?:\/|$)/.test(path)
		)
		const hasPostData = !!sessionStorage.getItem("reddit-post-machine-postdata")

		submitLogger.log("[Submit Script] Auto-run bootstrap check", { url, path, isSubmit, hasPostData })

		// Only auto-run the submit workflow on /submit pages.
		if (!isSubmit) return

		// Give Reddit time to mount composer/shadow DOM.
		setTimeout(() => {
			try {
				// If we have postData, force-run even if the tab is marked as background-created.
				runPostSubmissionScript(hasPostData /* skipTabStateCheck */)
					.catch((e) => submitLogger.error("[Submit Script] Auto-run failed:", e))
			} catch (e) {
				submitLogger.error("[Submit Script] Auto-run threw:", e)
			}
		}, 600)
	} catch (e) {
		submitLogger.warn("[Submit Script] Auto-run bootstrap failed:", e)
	}
})()
function removeBeforeUnloadListeners() {
	installBeforeUnloadBlocker()
	submitLogger.log('Removing Reddit\'s beforeunload event listeners')
	window.onbeforeunload = null
}

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

// Глобальне визначення deepQuery (видалені всі дублі)
function deepQuery(selector, root = document) {
	const el = root.querySelector(selector)
	if (el) return el
	for (const elem of root.querySelectorAll('*')) {
		if (elem.shadowRoot) {
			const found = deepQuery(selector, elem.shadowRoot)
			if (found) return found
		}
	}
	return null
}

// 1. Рекурсивний пошук постів у Shadow DOM (вирішує проблему "0 posts")
function getAllPostsFromShadowDom() {
	const posts = [];
	function searchShadow(root) {
		if (!root) return;
		const found = root.querySelectorAll('shreddit-post, [data-testid="post-container"], article.Post');
		found.forEach(el => { if (!posts.includes(el)) posts.push(el); });
		const allElements = root.querySelectorAll('*');
		for (const el of allElements) {
			if (el.shadowRoot) searchShadow(el.shadowRoot);
		}
	}
	searchShadow(document);
	return posts;
}

// 2. Функція збору даних про пости
async function checkUserPosts() {
	submitLogger.log("Deep searching for user posts in Shadow DOM...");
	const postElements = getAllPostsFromShadowDom();
	const posts = [];
	for (const el of postElements) {
		try {
			const id = el.getAttribute('id') || '';
			const title = el.getAttribute('post-title') ||
				el.querySelector('[slot="title"]')?.textContent ||
				el.querySelector('h3')?.textContent || "";
			if (id) {
				posts.push({ id, title: title.trim(), url: el.getAttribute('permalink') || "", _domElement: el });
			}
		} catch (e) { submitLogger.warn("Error parsing post element:", e); }
	}
	submitLogger.log(`Found ${posts.length} posts`);
	return { total: posts.length, posts, lastPostDate: posts.length > 0 ? new Date().toISOString() : null };
}

// 3. Надійний перехід на сторінку постів (з редиректом)
async function switchToPostsTab() {
	submitLogger.log("Navigating to user posts...");
	const postsTabSelectors = ['a[href*="/submitted"]', 'button[data-tab="posts"]', '[data-testid="posts-tab"]'];
	for (const selector of postsTabSelectors) {
		const element = deepQuery(selector);
		if (element) {
			element.click();
			await sleep(2000);
			if (window.location.href.includes('/submitted')) return true;
		}
	}
	const username = await getStoredUsername();
	if (username) {
		const cleanName = username.replace("u/", "");
		window.location.href = `https://www.reddit.com/user/${cleanName}/submitted/`;
		return true;
	}
	return false;
}
// --- NEW LOGIC HELPERS ---

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
let cachedUsername = null
let cacheTimestamp = 0

// Helper to clean username string (remove "Promoted", newlines, etc.)
function cleanUsername(text) {
	if (!text) return null
	const match = text.match(/(u\/[A-Za-z0-9_-]+)/)
	return match ? match[1] : null
}

function sanitizeExtractedUsername(raw) {
	return (raw || '').toString().replace(/^u\//i, '').trim();
}

/**
 * Strips all URLs from a given string.
 * @param {string} text
 * @returns {string}
 */
function stripUrls(text) {
	if (!text) return '';
	// Simple regex for URLs (http, https, www)
	const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
	return text.replace(urlRegex, '').replace(/\s+/g, ' ').trim();
}

function detectAutoRetryMessage() {
	try {
		const bodyText = (document.body?.innerText || '').toLowerCase();
		const messages = [
			'post is awaiting moderator approval',
			'awaiting moderator approval',
			'you\'ve been banned from contributing to this community',
			'you have been banned from contributing to this community'
		];
		for (const msg of messages) {
			if (bodyText.includes(msg)) {
				return msg;
			}
		}
	} catch (_) {
	}
	return null;
}

/**
 * Extracts hashtags from text (unique, preserves original case/order).
 * @param {string} text
 * @returns {string[]}
 */
function extractHashtags(text) {
	try {
		const s = (text || '').toString();
		// Unicode-aware hashtag matcher (letters/numbers/underscore)
		const matches = s.match(/#[\p{L}\p{N}_]+/gu) || [];
		const seen = new Set();
		const out = [];
		for (const tag of matches) {
			const key = tag.toLowerCase();
			if (seen.has(key)) continue;
			seen.add(key);
			out.push(tag);
		}
		return out;
	} catch (_) {
		// Fallback (ASCII only) in case \p{} isn't supported for any reason.
		const s = (text || '').toString();
		const matches = s.match(/#[A-Za-z0-9_]+/g) || [];
		const seen = new Set();
		const out = [];
		for (const tag of matches) {
			const key = tag.toLowerCase();
			if (seen.has(key)) continue;
			seen.add(key);
			out.push(tag);
		}
		return out;
	}
}

// Strict helper to find username via "View Profile" text
// This is the most reliable method as it targets the specific logged-in user UI component
function findUsernameViaViewProfile() {
	try {
		// Use deepQuery capabilities via document.querySelectorAll for simplicity or custom walker if needed
		// The original code used document.querySelectorAll('span') which is fine for flat checking,
		// but let's check if we need to pierce shadow DOM.
		// For now, mirroring my-content-script exactly.
		const viewProfileSpans = Array.from(document.querySelectorAll('span')).filter(el => el.textContent === 'View Profile');
		for (const span of viewProfileSpans) {
			// Look for sibling with username
			// Structure: parent > [span(View Profile), span(u/username)]
			const parent = span.parentElement;
			if (parent) {
				const usernameSpan = parent.querySelector('span:nth-child(2)') ||
					parent.querySelector('.text-secondary-weak');

				if (usernameSpan) {
					const text = cleanUsername(usernameSpan.textContent);
					if (text) {
						// Double check against parent anchor href if possible
						const anchor = span.closest('a');
						if (anchor && anchor.href.includes(text.replace('u/', ''))) {
							submitLogger.log(`Found verified username via View Profile: ${text}`);
							return text;
						}

						// If no anchor check possible, still return if it looks like a username
						submitLogger.log(`Found username via View Profile text: ${text}`);
						return text;
					}
				}
			}
		}
	} catch (e) {
		submitLogger.warn('Error in View Profile extraction:', e);
	}
	return null;
}

async function waitForElements(selector, timeout = 5000) {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		const elements = document.querySelectorAll(selector);
		if (elements.length > 0) return Array.from(elements);
		const shadowEl = deepQuery(selector);
		if (shadowEl) return [shadowEl];
		await sleep(250);
	}
	return [];
}
// --------------------------
// Fallback: fetch newest posts from user's submitted feed and match by title/subreddit.
async function fetchLatestSubmittedPost({ username, title, subreddit }) {
	try {
		const u = (username || '').toString().replace(/^u\//i, '').trim();
		if (!u) return { postId: null, redditUrl: null };

		const expectedTitle = (title || '').toString().trim();
		const expectedSub = (subreddit || '').toString().replace(/^r\//i, '').trim().toLowerCase();

		// Poll a few times because the post may take a moment to appear.
		for (let attempt = 1; attempt <= 8; attempt++) {
			try {
				const url = `https://www.reddit.com/user/${encodeURIComponent(u)}/submitted.json?limit=25&sort=new&t=day&_=${Date.now()}`;
				submitLogger.log(`[fetchLatestSubmittedPost] Attempt ${attempt}/8:`, url);

				const res = await fetch(url, {
					method: 'GET',
					credentials: 'include',
					headers: {
						'accept': 'application/json, text/plain, */*'
					}
				});

				const resClone = res.clone();
				const json = await resClone.json().catch(() => null);

				//const json = await res.json();
				const children = json?.data?.children || [];
				if (!Array.isArray(children) || children.length === 0) {
					submitLogger.warn('[fetchLatestSubmittedPost] Empty children list');
					await sleep(1200);
					continue;
				}

				// Prefer exact title match; otherwise allow same subreddit + very recent.
				const nowSec = Math.floor(Date.now() / 1000);
				let best = null;

				for (const c of children) {
					const d = c?.data;
					if (!d) continue;
					const t = (d.title || '').toString().trim();
					const sub = (d.subreddit || '').toString().trim().toLowerCase();
					const id = (d.id || '').toString().trim();
					const permalink = (d.permalink || '').toString().trim();
					const created = Number(d.created_utc || 0);

					if (!id || !permalink) continue;

					if (expectedTitle && t === expectedTitle) {
						best = { id, permalink };
						break;
					}

					// Fallback match: same subreddit and posted within last 10 minutes
					if (!best && expectedSub && sub === expectedSub && created > 0 && (nowSec - created) < 600) {
						best = { id, permalink };
					}
				}

				if (best?.id && best?.permalink) {
					const postId = `t3_${best.id}`;
					const redditUrl = best.permalink.startsWith('http') ? best.permalink : `https://www.reddit.com${best.permalink}`;
					submitLogger.log('[fetchLatestSubmittedPost] Matched post:', { postId, redditUrl });
					return { postId, redditUrl };
				}

				submitLogger.warn('[fetchLatestSubmittedPost] No match yet (title/subreddit).');
				await sleep(1200);
			} catch (e) {
				submitLogger.warn('[fetchLatestSubmittedPost] Attempt failed:', e);
				await sleep(1200);
			}
		}

		return { postId: null, redditUrl: null };
	} catch (e) {
		submitLogger.warn('[fetchLatestSubmittedPost] Fatal error:', e);
		return { postId: null, redditUrl: null };
	}
}
// --- OLD LOGIC: CLICK & EXTRACT ---

async function openUserDropdown() {
	submitLogger.log('Opening user dropdown...');
	const selectors = [
		'rpl-dropdown div',
		'[data-testid="user-avatar"]',
		'button[aria-label*="user"]',
		'#expand-user-drawer-button',
		'button[data-testid="user-menu-trigger"]',
		'[data-click-id="profile"]',
		'button[id*="user-dropdown"]',
		'button[aria-haspopup="true"]',
		'.header-user-dropdown',
		'button[aria-label*="User"]',
		'button[title*="profile"]'
	]

	for (const selector of selectors) {
		const avatarButton = qs(selector)
		if (avatarButton) {
			avatarButton.click();
			await sleep(2000);
			return true;
		}
	}
	return false;
}

async function getAuthenticatedUsername() {
	// Check cache first
	if (cachedUsername && Date.now() - cacheTimestamp < CACHE_DURATION) {
		submitLogger.log(`Using cached authenticated username: ${cachedUsername}`)
		return cachedUsername
	}

	// Priority 1: STRICT "View Profile" check (Based on user provided HTML)
	const viewProfileUser = findUsernameViaViewProfile();
	if (viewProfileUser) {
		cachedUsername = viewProfileUser;
		cacheTimestamp = Date.now();
		return viewProfileUser;
	}

	// Secondary check: constrained header selectors (only if View Profile fails/is hidden)
	const authSelectors = [
		// Header/Dropdown specific
		'button[id*="user-dropdown"] [class*="text-12"]',
		'[data-testid="user-menu-trigger"] span[class*="text-12"]',
		'.header-user-dropdown [class*="text-12"]',
		'button[aria-label*="User"] span[class*="text-12"]',

		// Right Sidebar "View Profile" Card (Trusted)
		// Look for the View Profile section in the sidebar
		'div:has(> a[href*="/user/"]) span[class*="text-"]', // Modern layout
		'div:has(> a[href*="/u/"]) span[class*="text-"]',
		'aside a[href^="/u/"]',
		'aside a[href^="/user/"]',
		// Fallback for sidebar
		'div[class*="sidebar"] a[href^="/u/"]'
	]

	for (const selector of authSelectors) {
		const element = qs(selector)
		if (element) {
			const text = cleanUsername(element.textContent)
			if (text) {
				// Update cache
				cachedUsername = text
				cacheTimestamp = Date.now()
				return text
			}
		}
	}

	// If not found, try opening dropdown and getting username
	submitLogger.log('Username not found in header/sidebar, attempting to open dropdown...');
	if (await openUserDropdown()) {
		// Wait longer for dropdown to fully load and use waitForElement
		await sleep(2000)

		// AFTER opening dropdown, check STRICT "View Profile" again using the helper
		// This ensures we find the user-provided structure inside the menu
		const dropdownUser = findUsernameViaViewProfile();
		if (dropdownUser) {
			// Close dropdown by clicking outside
			document.body.click();
			await sleep(500);

			// Update cache
			cachedUsername = dropdownUser;
			cacheTimestamp = Date.now();
			return dropdownUser;
		}

		submitLogger.log('Could not find View Profile element in dropdown');
	}

	return null
}

async function handleExtractUsernameAndCreatePost() {
	submitLogger.log('[Submit Script] Triggering UI extraction...');
	try {
		// 1. Спроба через API для швидкості
		let raw = null;
		try {
			const res = await fetch('https://www.reddit.com/api/v1/me', { credentials: 'include' });
			const j = await res.json();
			raw = j?.name ? `u/${j.name}` : null;
		} catch (_) { }

		// 2. Якщо API не дало результат - КЛІКАЄМО (Стара логіка)
		if (!raw) {
			raw = await getAuthenticatedUsername();
		}

		if (raw) {
			const cleaned = sanitizeExtractedUsername(raw);
			const userName = cleaned.startsWith('u/') ? cleaned : `u/${cleaned}`;

			// Збереження
			const data = { seren_name: userName, timestamp: Date.now(), pageUrl: window.location.href };
			await chrome.storage.sync.set({ redditUser: data });
			await chrome.storage.local.set({ redditUser: data });
			sessionStorage.setItem("reddit-post-machine-username", userName);

			chrome.runtime.sendMessage({ type: "USERNAME_STORED", username: userName });
			chrome.runtime.sendMessage({
				type: "ACTION_COMPLETED",
				action: "EXTRACT_USERNAME_AND_CREATE_POST",
				success: true,
				data: { userName }
			});
		}
	} catch (e) {
		submitLogger.error("Extraction failed:", e);
	}
}
// ------------------------------------
// Storage functions
async function getStoredUsername() {
	try {
		// Prefer sync, fallback to local
		const syncRes = await chrome.storage.sync.get(['redditUser'])
		let v = syncRes?.redditUser
		if (!v) {
			const localRes = await chrome.storage.local.get(['redditUser'])
			v = localRes?.redditUser
		}

		if (!v) return null

		// Backward/alternate shapes
		if (typeof v === 'string') return v.trim() || null

		if (typeof v === 'object' && v) {
			if (typeof v.seren_name === 'string' && v.seren_name.trim()) return v.seren_name.trim()
			if (typeof v.username === 'string' && v.username.trim()) return v.username.trim()
			if (typeof v.redditUser === 'string' && v.redditUser.trim()) return v.redditUser.trim()
			if (typeof v.redditUser === 'object' && v.redditUser) {
				if (typeof v.redditUser.seren_name === 'string' && v.redditUser.seren_name.trim()) return v.redditUser.seren_name.trim()
				if (typeof v.redditUser.username === 'string' && v.redditUser.username.trim()) return v.redditUser.username.trim()
			}
		}

		return null
	} catch (error) {
		submitLogger.warn('Failed to get stored username:', error)
		return null
	}
}

async function fetchPostDataForSubmission() {
	try {
		const storedData = sessionStorage.getItem('reddit-post-machine-postdata')
		if (!storedData) return null

		const postData = JSON.parse(storedData)

		// Backfill username (required for submitted.json fallback and DOM author match)
		if (!postData.userName && !postData.username) {
			const cached = sessionStorage.getItem('reddit-post-machine-username')
			if (cached) {
				postData.userName = cached
				postData.username = cached
			}
		}

		if (!postData.userName && !postData.username) {
			const storedUsername = await getStoredUsername()
			if (storedUsername) {
				postData.userName = storedUsername
				postData.username = storedUsername
			}
		}

		submitLogger.log('Using stored post data for submission:', postData)
		return postData
	} catch (error) {
		submitLogger.error('Failed to fetch post data:', error)
		return null
	}
}

// Submit page functions
async function ensureSubmitPageReady() {
	submitLogger.log('Ensuring submit page is ready...')

	let attempts = 0
	const maxAttempts = 15

	while (attempts < maxAttempts) {
		const submitForm = qs('form') || qs('[data-testid*="post"]') || qs('shreddit-post-composer')
		if (submitForm) {
			submitLogger.log('Submit page is ready')
			return true
		}
		await sleep(1000)
		attempts++
	}

	submitLogger.log('Submit page failed to load within timeout')
	return false
}

async function fillTitle(postData) {
	submitLogger.log('Filling title field...')

	try {
		const titleInputElement = deepQuery('faceplate-textarea-input[name="title"]')
		if (titleInputElement && postData.title) {
			const shadowRoot = titleInputElement.shadowRoot
			if (shadowRoot) {
				const titleInput = shadowRoot.querySelector('#innerTextArea')
				if (titleInput) {
					titleInput.focus()
					await sleep(500)

					const titleText = String(postData.title || '').trim()
					if (!titleText) return false

					submitLogger.log('Setting title text:', titleText)

					titleInput.select()
					titleInput.value = ''

					titleInput.value = titleText
					titleInput.dispatchEvent(new InputEvent('input', {
						inputType: 'insertText',
						data: titleText,
						bubbles: true
					}))
					titleInput.dispatchEvent(new Event('change', { bubbles: true }))

					await sleep(500)
					return true
				}
			}
		}
		return false
	} catch (error) {
		submitLogger.error('Error filling title:', error)
		return false
	}
}

async function fillUrl(postData) {
	submitLogger.log('Filling URL field...')
	removeBeforeUnloadListeners()

	try {
		if (postData.url && postData.url.trim()) {
			const urlInputElement = deepQuery('faceplate-textarea-input[name="link"]')
			if (urlInputElement) {
				const shadowRoot = urlInputElement.shadowRoot
				if (shadowRoot) {
					const urlInput = shadowRoot.querySelector('#innerTextArea')
					if (urlInput) {
						urlInput.focus()
						await sleep(500)
						urlInput.value = postData.url
						urlInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
						urlInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
						urlInput.blur()
						await sleep(500)
						return true
					}
				}
			}
		}
		return false
	} catch (error) {
		submitLogger.error('Error filling URL:', error)
		return false
	}
}

// === FILL BODY З ІМІТАЦІЄЮ МАНУАЛЬНОГО ВВЕДЕННЯ ===
async function fillBody(postData) {
	submitLogger.log('Filling body text using character simulation (Lexical)...');
	try {
		await clickBodyField();
		await sleep(1000);

		// Шукаємо редактор
		const bodyComposer = deepQuery('shreddit-composer[name="body"]') || deepQuery('shreddit-composer[name="optionalBody"]');
		const bodyEditable = bodyComposer?.querySelector('div[contenteditable="true"]') ||
			document.querySelector('div[contenteditable="true"]');  // Fallback на загальний пошук

		if (!bodyEditable) {
			submitLogger.error('Body editor not found');
			return false;
		}

		bodyEditable.focus();
		bodyEditable.innerHTML = '<p><br></p>';  // Очищення для Lexical
		const text = (postData.body || "").trim();
		if (!text) return false;

		// Цикл імітації натискання клавіш
		for (const char of text) {
			const opts = { key: char, bubbles: true };
			bodyEditable.dispatchEvent(new KeyboardEvent("keydown", opts));
			document.execCommand('insertText', false, char);
			bodyEditable.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: char, bubbles: true }));
			bodyEditable.dispatchEvent(new KeyboardEvent("keyup", opts));
			await sleep(10);  // Невелика затримка для імітації реального вводу (опціонально, щоб уникнути блоків Reddit)
		}
		bodyEditable.dispatchEvent(new Event('change', { bubbles: true }));
		bodyEditable.blur();  // Зняти фокус для збереження
		submitLogger.log('Body text filled successfully with manual simulation');
		return true;
	} catch (error) {
		submitLogger.error('Error filling body:', error);
		return false;
	}
}

async function clickBodyField() {
	try {
		await sleep(500)
		const bodyComposer = deepQuery('shreddit-composer[name="body"]')
		let bodyEditable = null

		if (bodyComposer) {
			bodyEditable = bodyComposer.querySelector('div[contenteditable="true"]')
		}

		if (!bodyEditable) {
			const submitForm = qs('form') || qs('shreddit-post-composer')
			if (submitForm) {
				bodyEditable = submitForm.querySelector('div[contenteditable="true"]')
			}
		}

		if (bodyEditable) {
			bodyEditable.scrollIntoView({ block: "center", behavior: "instant" });
			bodyEditable.click()
			await sleep(100)
			bodyEditable.focus()
			return true
		}
		return false
	} catch (error) {
		return false
	}
}

async function clickTab(tabValue) {
	submitLogger.log(`Clicking tab with data-select-value="${tabValue}"`)

	const tab = deepQuery(`[data-select-value="${tabValue}"]`)
	if (tab) {
		tab.click()
		await sleep(2000)
		return true
	}
	submitLogger.log(`Tab with data-select-value="${tabValue}" not found`)
	return false
}

async function handleRuleViolationDialog() {
	submitLogger.log('Checking for rule violation dialog after submit...')

	try {
		const maxAttempts = 10
		const pollInterval = 500

		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			await sleep(pollInterval)

			const dialog = qs('[role="dialog"]') || deepQuery('shreddit-modal')
			if (!dialog) continue

			const text = dialog.textContent?.toLowerCase() || ''
			if (text.includes('rule') || text.includes('warning') || text.includes('review')) {
				submitLogger.log('Rule violation dialog detected')

				const buttons = dialog.querySelectorAll('button')
				for (const btn of buttons) {
					if (btn.textContent.toLowerCase().includes('submit') ||
						btn.textContent.toLowerCase().includes('post')) {
						btn.click()
						return true
					}
				}
			}
		}
		return false
	} catch (error) {
		return false
	}
}

async function clickPostButton() {
	const getBtn = () => {
		// Шукаємо кнопку всередині Shadow DOM компонента Reddit
		const shredditBtn = document.querySelector('shreddit-composer')?.shadowRoot
			?.querySelector('r-post-form-submit-button')?.shadowRoot
			?.querySelector('button');

		const innerButton = deepQuery('#inner-post-submit-button');
		const btn = shredditBtn || innerButton;

		if (btn) {
			// Перевірка, чи Reddit не заблокував кнопку (aria-disabled)
			const isBlocked = btn.disabled || btn.getAttribute('aria-disabled') === 'true';
			return isBlocked ? null : btn;
		}
		return null;
	}

	let btn = null;
	for (let i = 0; i < 20; i++) { // Чекаємо активації кнопки до 10 сек
		btn = getBtn();
		if (btn) break;
		await sleep(500);
	}

	if (btn) {
		btn.scrollIntoView({ block: "center", behavior: "instant" });
		await sleep(200);
		btn.click();
		submitLogger.log('✅ Post button clicked!');
		return true;
	}
	return false;
}

async function submitPost() {
	submitLogger.log('Submitting post...');
	installBeforeUnloadBlocker();

	try {
		// --- ЗАКОМЕНТОВАНО: Ядерне очищення перед кліком (не виконується) ---
		/*
		const blockers = document.querySelectorAll('r-post-flairs-modal, faceplate-modal, .modal-backdrop, [role="dialog"]');
		blockers.forEach(el => {
			if (el.textContent.toLowerCase().includes('flair') || el.textContent.toLowerCase().includes('tag')) {
				submitLogger.log('Force removing blocking flair element before final submit');
				el.remove();
			}
		});
		await sleep(500);
		*/
		// -----------------------------------------------

		const checkButtonActive = () => {
			// Перевірка кнопки в Shadow DOM (новий дизайн)
			const shadowBtn = deepQuery('r-post-form-submit-button')?.shadowRoot?.querySelector('button');
			if (shadowBtn && !shadowBtn.disabled) return shadowBtn;

			const innerButton = deepQuery('#inner-post-submit-button');
			if (innerButton && !innerButton.disabled && innerButton.getAttribute('aria-disabled') !== 'true') return innerButton;

			return null;  // Виправлено з false на null для узгодженості
		};

		const startTime = Date.now();
		let btnToClick = null;
		while (Date.now() - startTime < 10000) {
			btnToClick = checkButtonActive();
			if (btnToClick) break;
			await sleep(500);
		}

		if (btnToClick) {
			submitLogger.log('Found active Post button, clicking...');
			btnToClick.scrollIntoView({ block: "center", behavior: "instant" });
			await sleep(200);
			btnToClick.click();
			await handleRuleViolationDialog();
			return true;
		}

		// Fallback для старих сторінок
		const fallbackBtn = qs('button[data-click-id="submit"]') ||
			Array.from(document.querySelectorAll('button')).find(b => b.textContent.toLowerCase().includes('post'));
		if (fallbackBtn) {
			fallbackBtn.click();
			return true;
		}

		return false;
	} catch (error) {
		submitLogger.error('Error submitting post:', error);
		return false;
	}
}

async function notifyWorkflowNextStep({ success, postData, redditUrl, redditPostId, error }) {
	try {
		const username = postData?.userName || postData?.username || await getStoredUsername()
		const subreddit = postData?.subreddit || null

		await chrome.runtime.sendMessage({
			type: 'WORKFLOW_NEXT_STEP',
			step: 'AFTER_SUBMIT',
			success,
			data: {
				username,
				subreddit,
				redditUrl,
				redditPostId
			},
			error: error || null
		})
	} catch (_) {
		// do nothing
	}
}

// Main post submission script
async function runPostSubmissionScript(skipTabStateCheck = false) {
	submitLogger.log('=== POST SUBMISSION SCRIPT STARTED ===')
	removeBeforeUnloadListeners()
	submitLogger.log('[Submit Script] Context', {
		url: window.location.href,
		path: window.location.pathname,
		skipTabStateCheck,
		hasPostData: !!sessionStorage.getItem('reddit-post-machine-postdata')
	})

	try {
		if (!skipTabStateCheck) {
			const tabStateResponse = await chrome.runtime.sendMessage({ type: 'GET_TAB_STATE' })
			submitLogger.log('[Submit Script] GET_TAB_STATE response', tabStateResponse)
			if (tabStateResponse?.success && tabStateResponse?.isBackgroundPostTab) {
				submitLogger.log('Skipping auto-run post submission - this tab was created by background script')
				return
			}
		} else {
			submitLogger.log('[Submit Script] skipTabStateCheck=true (forced run)')
		}

		await ensureSubmitPageReady()

		const postData = await fetchPostDataForSubmission()
		if (!postData) {
			submitLogger.log('Post submission script: No post data available')
			return
		}

		submitLogger.log('Post submission script: Got post data:', postData.title)

		// === TYPE DETERMINATION & URL HANDLING LOGIC ===
		let isLinkPost = false
		const requestedType = postData.post_type ? postData.post_type.toLowerCase() : '';

		if (requestedType === 'text') {
			isLinkPost = false;
			submitLogger.log('Post type is explicitly TEXT. Ignoring URL field for type determination.');
		} else if (requestedType === 'link' || requestedType === 'url') {
			isLinkPost = true;
			submitLogger.log('Post type is explicitly LINK.');
		}
		else if (postData.url && postData.url.trim()) {
			const url = postData.url.trim()
			const isRedditUrl = url.includes('reddit.com/r/');

			if (!isRedditUrl) {
				isLinkPost = true
				submitLogger.log(`Detected link post from external URL: ${url}`)
			} else {
				isLinkPost = false
				submitLogger.log(`URL is Reddit internal (${url}), treating as TEXT post.`)
			}
		}

		if (isLinkPost) {
			submitLogger.log('=== SKIPPING LINK POST ===')
			return
		}

		const targetTab = 'TEXT'
		submitLogger.log(`=== Submitting as ${targetTab} post ===`)

		// Step 1: Title
		if (await clickTab(targetTab)) {
			await fillTitle(postData)
		} else {
			return
		}

		// Step 2: Flair
		let selectedFlair = null;
		try {
			const flairResult = await handleAutomaticFlairSelection();
			if (flairResult?.selectedFlair) selectedFlair = flairResult.selectedFlair;
			if (!flairResult.success) {
				submitLogger.warn(`Flair selection warning: ${flairResult.error}`);
			}
		} catch (e) {
			submitLogger.error('Flair selection crashed, trying to bypass...');
		}

		// --- ДОДАЙТЕ ЦЕ (Гарантоване закриття модалки) ---
		await sleep(1000);
		const lingeringModal = document.querySelector('r-post-flairs-modal') || deepQuery('shreddit-modal');
		if (lingeringModal) {
			submitLogger.log('Closing flair modal via Escape/Removal');
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
			await sleep(500);
			// Якщо все ще тут - видаляємо з корінням
			if (document.contains(lingeringModal)) lingeringModal.remove();
		}
		// -----------------------------------------------

		// Step 3: Body
		await clickBodyField()
		await sleep(500)

		// Determine body text ONLY.
		// IMPORTANT: Never append any URL into the body text. `postData.url` is a separate parameter.
		let bodyTextRaw = (
			postData.body ??
			postData.bodyText ??
			postData.content ??
			postData.text ??
			postData.description ??
			postData.message ??
			''
		).toString();

		let bodyText = stripUrls(bodyTextRaw);

		const hashtagsArr = extractHashtags(bodyText);
		const hashtags = hashtagsArr.length ? hashtagsArr.join(' ') : null;

		// Guard: do NOT publish without body text
		if (!bodyText || !bodyText.trim()) {
			submitLogger.error('[Submit Script] EMPTY_BODY_REFUSED: postData has no body text. Aborting submit.', {
				url: window.location.href,
				subreddit: postData?.subreddit || null,
				title: postData?.title || null,
				post_type: postData?.post_type || postData?.postType || null,
				availableKeys: Object.keys(postData || {})
			});

			chrome.runtime.sendMessage({
				type: 'ACTION_COMPLETED',
				action: 'POST_CREATION_COMPLETED',
				success: false,
				skipped: true,
				error: 'SKIPPED_EMPTY_BODY',
				errorCode: 'SKIPPED_EMPTY_BODY',
				frappePostName: postData?.name || postData?.id,
				submittedData: {
					title: postData?.title || null,
					body: null,
					subreddit: postData?.subreddit || null,
					url: postData?.url || null,
					postType: (postData?.post_type || 'text'),
					hashtags,
					flair: selectedFlair
				},
				data: {
					subreddit: postData?.subreddit || null,
					username: postData?.userName || postData?.username || null,
					hashtags,
					flair: selectedFlair
				}
			}).catch(() => { });

			await notifyWorkflowNextStep({
				success: false,
				postData,
				error: 'SKIPPED_EMPTY_BODY'
			});

			// Clear stored postdata to let workflow proceed to next item
			try { sessionStorage.removeItem('reddit-post-machine-postdata') } catch (_) { }
			try { sessionStorage.removeItem('reddit-post-machine-script-stage') } catch (_) { }

			return;
		}

		// URL appending logic removed as per user request to never include URLs in body text.

		const postDataWithBody = { ...postData, body: bodyText };
		const bodyOk = await fillBody(postDataWithBody);

		if (!bodyOk) {
			submitLogger.error('[Submit Script] BODY_FILL_FAILED: body editor did not accept text. Aborting submit.');

			chrome.runtime.sendMessage({
				type: 'ACTION_COMPLETED',
				action: 'POST_CREATION_COMPLETED',
				success: false,
				error: 'BODY_FILL_FAILED',
				errorCode: 'BODY_FILL_FAILED',
				frappePostName: postData?.name || postData?.id,
				submittedData: {
					title: postData?.title || null,
					body: bodyText,
					subreddit: postData?.subreddit || null,
					url: postData?.url || null,
					postType: (postData?.post_type || 'text'),
					hashtags,
					flair: selectedFlair
				},
				data: {
					subreddit: postData?.subreddit || null,
					username: postData?.userName || postData?.username || null,
					hashtags,
					flair: selectedFlair
				}
			}).catch(() => { });

			await notifyWorkflowNextStep({
				success: false,
				postData,
				error: 'BODY_FILL_FAILED'
			});

			try { sessionStorage.removeItem('reddit-post-machine-postdata') } catch (_) { }
			try { sessionStorage.removeItem('reddit-post-machine-script-stage') } catch (_) { }

			return;
		}

		await clickBodyField()
		await sleep(1000)

		// Step 4: Submit and Verify
		const submitSuccess = await submitPost()

		if (submitSuccess) {
			submitLogger.log('Post submitted, waiting for redirect...')

			const startTime = Date.now()
			const timeout = 20000

			let successDetected = false;
			let redditUrl = null;
			let redditPostId = null;

			while (Date.now() - startTime < timeout) {
				await sleep(500)

				const retryReason = detectAutoRetryMessage();
				if (retryReason) {
					submitLogger.warn(`[Submit Script] Auto-retry condition detected: ${retryReason}`);

					await notifyWorkflowNextStep({
						success: false,
						postData,
						error: 'POST_REQUIRES_NEW'
					});

					chrome.runtime.sendMessage({
						type: 'ACTION_COMPLETED',
						action: 'POST_CREATION_COMPLETED',
						success: false,
						error: 'POST_REQUIRES_NEW',
						errorCode: 'POST_REQUIRES_NEW',
						frappePostName: postData?.name || postData?.id,
						submittedData: {
							title: postData?.title || null,
							body: bodyText || postData?.body || null,
							subreddit: postData?.subreddit || null,
							url: postData?.url || null,
							postType: (postData?.post_type || 'text'),
							hashtags,
							flair: selectedFlair
						},
						data: {
							username: postData?.userName || postData?.username || null,
							subreddit: postData?.subreddit || null,
							reason: retryReason
						}
					}).catch(() => { });

					try { sessionStorage.removeItem('reddit-post-machine-postdata') } catch (_) { }
					try { sessionStorage.removeItem('reddit-post-machine-script-stage') } catch (_) { }
					return;
				}

				// FAST CHECK: Look for "Post submitted" toast or similar indicators
				const toast = document.querySelector('faceplate-toast');
				if (toast && (toast.textContent.includes('submitted') || toast.textContent.includes('published'))) {
					successDetected = true;
					submitLogger.log('SUCCESS: Detected toast notification!');
					break;
				}

				// OPTIMIZATION: If we clicked the button and it's now disabled/loading, assumes success after short delay
				// But real confirmation is better. Let's rely on URL change or Toast.

				if (!window.location.href.includes('/submit')) {
					successDetected = true;
					redditUrl = window.location.href;
					// Extract ID if possible, otherwise rely on background fallback
					const idMatch = redditUrl.match(/\/comments\/([a-z0-9]{5,10})(?:\/|\?|#|$)/i);
					if (idMatch?.[1]) {
						redditPostId = `t3_${idMatch[1]}`;
					}
					break;
				}

				// Check for "View post" link appearing on the same page (new reddit behavior)
				try {
					const anchors = Array.from(document.querySelectorAll('a[href*="/comments/"]'));
					const viewPostLink = anchors.find((a) => {
						const t = (a.textContent || '').toLowerCase();
						return t.includes('view') || t.includes('post') || t.includes('comments');
					});
					if (viewPostLink?.href) {
						successDetected = true;
						redditUrl = viewPostLink.href;
						const idMatch = redditUrl.match(/\/comments\/([a-z0-9]{5,10})(?:\/|\?|#|$)/i);
						if (idMatch?.[1]) redditPostId = `t3_${idMatch[1]}`;
						submitLogger.log('SUCCESS: Detected created post link on /submit:', redditUrl);
						break;
					}
				} catch (_) { }

				// Check for error messages to fail early
				const errorTexts = Array.from(document.querySelectorAll('[role="alert"], .error-message')).map(e => e.textContent.toLowerCase());
				if (errorTexts.some(t => t.includes('url is required') || t.includes('link is required'))) {
					// ... error handling logic ...
					submitLogger.error('FAILED: Subreddit requires a Link post (Url field). Skipping.');
					// (Retaining original error reporting logic from your code block for safety)
					chrome.runtime.sendMessage({
						type: 'ACTION_COMPLETED',
						action: 'POST_CREATION_COMPLETED',
						success: false,
						error: 'SKIPPED_URL_REQUIRED',
						errorCode: 'SKIPPED_URL_REQUIRED',
						frappePostName: postData?.name || postData?.id,
						submittedData: {
							title: postData?.title || null,
							body: bodyText || postData?.body || null,
							subreddit: postData?.subreddit || null,
							url: postData?.url || null,
							postType: (postData?.post_type || 'text'),
							hashtags,
							flair: selectedFlair
						},
						data: {
							username: postData?.userName || postData?.username || null,
							subreddit: postData?.subreddit || null,
							hashtags,
							flair: selectedFlair
						}
					}).catch(() => { })

					await notifyWorkflowNextStep({
						success: false,
						postData,
						error: 'SKIPPED_URL_REQUIRED'
					});

					return;
				}
			}

			if (successDetected) {
				if (!redditPostId) {
					submitLogger.warn('SUCCESS detected but redditPostId is null. Trying submitted.json fallback before notifying background...');
					const fetched = await fetchLatestSubmittedPost({
						username: postData.userName,
						title: postData.title,
						subreddit: postData.subreddit
					});
					if (fetched?.postId) {
						redditPostId = fetched.postId;
						if (fetched.redditUrl) redditUrl = fetched.redditUrl;
					}
				}
				submitLogger.log('SUCCESS: Post created!', { redditUrl, redditPostId })

				chrome.runtime.sendMessage({
					type: 'ACTION_COMPLETED',
					action: 'POST_CREATION_COMPLETED',
					success: true,
					postId: redditPostId || null,
					permalink: redditUrl ? (() => { try { return new URL(redditUrl).pathname; } catch (_) { return null; } })() : null,
					finalUrl: redditUrl || window.location.href,
					frappePostName: postData?.name || postData?.id,
					submittedData: {
						title: postData?.title || null,
						body: bodyText || postData?.body || null,
						subreddit: postData?.subreddit || null,
						url: postData?.url || null,
						postType: (postData?.post_type || 'text'),
						hashtags,
						flair: selectedFlair
					},
					data: {
						redditUrl,
						redditPostId,
						postId: redditPostId, // Ensure postId is available in data object
						subreddit: postData.subreddit,
						username: postData.userName,
						submittedData: {
							title: postData?.title || null,
							body: bodyText || postData?.body || null,
							subreddit: postData?.subreddit || null,
							url: postData?.url || null,
							postType: (postData?.post_type || 'text'),
							hashtags,
							flair: selectedFlair
						},
						frappePostName: postData?.name || postData?.id,
						hashtags,
						flair: selectedFlair
					}
				}).catch(() => { });

				await notifyWorkflowNextStep({
					success: true,
					postData,
					redditUrl,
					redditPostId
				});

				sessionStorage.removeItem('reddit-post-machine-postdata')
				await sleep(2000);
				submitLogger.log('Post submitted successfully. Keeping tab open per user request.');
				// chrome.runtime.sendMessage({ type: 'CLOSE_CURRENT_TAB' }).catch(() => { });

			} else {
				submitLogger.error('Timeout waiting for redirect.')

				await notifyWorkflowNextStep({
					success: false,
					postData,
					error: 'Timeout waiting for post redirect'
				});

				chrome.runtime.sendMessage({
					type: 'ACTION_COMPLETED',
					action: 'POST_CREATION_COMPLETED',
					success: false,
					error: 'Timeout waiting for post redirect',
					frappePostName: postData?.name || postData?.id,
					submittedData: {
						title: postData?.title || null,
						body: bodyText || postData?.body || null,
						subreddit: postData?.subreddit || null,
						url: postData?.url || null,
						postType: (postData?.post_type || 'text'),
						hashtags,
						flair: selectedFlair
					}
				}).catch(() => { })
			}

		} else {
			submitLogger.log('Post submission failed (button click issues)')

			await notifyWorkflowNextStep({
				success: false,
				postData,
				error: 'Failed to click submit button'
			});

			chrome.runtime.sendMessage({
				type: 'ACTION_COMPLETED',
				action: 'POST_CREATION_COMPLETED',
				success: false,
				error: 'Failed to click submit button',
				frappePostName: postData?.name || postData?.id,
				submittedData: {
					title: postData?.title || null,
					body: bodyText || postData?.body || null,
					subreddit: postData?.subreddit || null,
					url: postData?.url || null,
					postType: (postData?.post_type || 'text'),
					hashtags,
					flair: selectedFlair
				}
			}).catch(() => { })
		}

		submitLogger.log('=== POST SUBMISSION SCRIPT COMPLETED ===')

	} catch (error) {
		submitLogger.error('Post submission script error:', error)

		await notifyWorkflowNextStep({
			success: false,
			postData: null,
			error: error.message
		})

		chrome.runtime.sendMessage({
			type: 'ACTION_COMPLETED',
			action: 'POST_CREATION_COMPLETED',
			success: false,
			error: error.message
		}).catch(() => { })
	}
}

// Handle manual script trigger from background/popup
async function handleManualScriptTrigger(scriptType, mode) {
	submitLogger.log(`=== MANUAL TRIGGER: ${scriptType} (mode: ${mode}) ===`)

	try {
		if (scriptType === 'post') {
			sessionStorage.removeItem('reddit-post-machine-script-stage')
			submitLogger.log('Manually triggering post submission script')
			await runPostSubmissionScript()
		} else {
			submitLogger.log(`Manual trigger for ${scriptType} not handled by submit script`)
		}
	} catch (error) {
		submitLogger.error('Manual script trigger error:', error)
	}
}

// Handle start post creation from background script
function handleStartPostCreation(userName, postData) {
	submitLogger.log(`Starting post creation for user: ${userName}`, postData)

	if (window.location.href.includes('/submit')) {
		submitLogger.log('Already on submit page, storing post data and triggering submission')
		if (postData) {
			sessionStorage.setItem('reddit-post-machine-postdata', JSON.stringify(postData));
		}
		runPostSubmissionScript(true)
		return
	}

	if (postData) {
		sessionStorage.setItem('reddit-post-machine-postdata', JSON.stringify(postData));
	}

	submitLogger.log('Checking if user is logged in using proven method...')
	const avatarButton = qs('rpl-dropdown div, [data-testid="user-avatar"], button[aria-label*="user"], #expand-user-drawer-button')

	if (avatarButton) {
		submitLogger.log('Found user avatar button - user is logged in')
	} else {
		submitLogger.log('User avatar button not found - user may not be logged in')
		return
	}

	submitLogger.log('Requesting background script to create new post tab')
	chrome.runtime.sendMessage({
		type: 'CREATE_POST_TAB',
		postData: postData
	}).then(response => {
		if (response.success) {
			submitLogger.log('Background script created post tab successfully:', response.tabId)
		} else {
			submitLogger.error('Failed to create post tab:', response.error)
		}
	}).catch(error => {
		submitLogger.error('Error requesting post tab creation:', error)
	})
}

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	// Avoid console spam from background heartbeat
	if (message?.type === 'PING') {
		sendResponse?.({ pong: true, url: window.location.href })
		return true
	}

	submitLogger.log('Submit script received message:', message)

	switch (message.type) {
		case 'EXTRACT_USERNAME_AND_CREATE_POST':
			handleExtractUsernameAndCreatePost();
			sendResponse({ started: true });
			break;

		case 'START_POST_CREATION':
			handleStartPostCreation(message.userName, message.postData)
			break

		case 'MANUAL_TRIGGER_SCRIPT':
			handleManualScriptTrigger(message.scriptType, message.mode)
			break

		case 'DELETE_LAST_POST':
			submitLogger.log('Submit script: DELETE_LAST_POST not supported on submit page, delegating...')
			chrome.runtime.sendMessage({
				type: 'ACTION_COMPLETED',
				action: 'DELETE_LAST_POST',
				success: false,
				error: 'Delete operations must be performed on user profile pages'
			}).catch(() => { })
			break

		default:
			return
	}
})

// Initialize submit script
submitLogger.log('🟢 SUBMIT content script loaded on URL:', window.location.href)
submitLogger.log('🟢 SUBMIT script: All loaded scripts check:', document.querySelectorAll('script').length)
export default function (bridge) {
	submitLogger.log('Submit script bridge initialized', bridge)
}
