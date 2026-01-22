// Flair/Tag Selection Handler for Reddit Post Submission
// Handles programmatic selection of flairs in the Reddit post submission form

import { submitLogger } from "./logger.js"

// Helper function to sleep
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

// Deep query through shadow DOM
function deepQueryShadow(selector, root = document) {
	const el = root.querySelector(selector)
	if (el) return el

	for (const elem of root.querySelectorAll('*')) {
		if (elem.shadowRoot) {
			const found = deepQueryShadow(selector, elem.shadowRoot)
			if (found) return found
		}
	}
	return null
}

// Deep query all elements through shadow DOM
function deepQueryAllShadow(selector, root = document) {
	const elements = Array.from(root.querySelectorAll(selector))

	for (const elem of root.querySelectorAll('*')) {
		if (elem.shadowRoot) {
			const shadowElements = deepQueryAllShadow(selector, elem.shadowRoot)
			elements.push(...shadowElements)
		}
	}
	return elements
}

// Find element by text content including shadow DOM
function findElementByText(text, root = document, tag = '*') {
	if (!root) return null

	const searchText = text.toLowerCase()
	const elements = Array.from(root.querySelectorAll(tag))

	// First search in direct children
	for (const el of elements) {
		const elText = el.textContent?.trim().toLowerCase() || ''
		if (elText === searchText || elText.includes(searchText)) {
			return el
		}
	}

	// Then search in shadow DOMs
	for (const elem of root.querySelectorAll('*')) {
		if (elem.shadowRoot) {
			const found = findElementByText(text, elem.shadowRoot, tag)
			if (found) return found
		}
	}

	return null
}

// Find all elements by text content including shadow DOM
function findAllElementsByText(text, root = document, tag = '*') {
	const results = []
	if (!root) return results

	const searchText = text.toLowerCase()
	const elements = Array.from(root.querySelectorAll(tag))

	for (const el of elements) {
		const elText = el.textContent?.trim().toLowerCase() || ''
		if (elText === searchText || elText.includes(searchText)) {
			results.push(el)
		}
	}

	for (const elem of root.querySelectorAll('*')) {
		if (elem.shadowRoot) {
			const shadowResults = findAllElementsByText(text, elem.shadowRoot, tag)
			results.push(...shadowResults)
		}
	}

	return results
}

// Get the flair modal element
function getFlairModal() {
	return document.querySelector('r-post-flairs-modal')
}

// Check if flairs are available for the community
async function areFlairsAvailable() {
	try {
		const flairModal = getFlairModal()
		if (!flairModal) {
			submitLogger.log('Flair modal not found in DOM')
			return false
		}

		// Check if flairs-allowed attribute is empty (disabled)
		const flairsAllowed = flairModal.getAttribute('flairs-allowed')
		if (flairsAllowed === '') {
			submitLogger.log('Flairs not allowed for this community (flairs-allowed="")')
			return false
		}

		submitLogger.log('Flairs are available for this community')
		return true
	} catch (error) {
		submitLogger.error('Error checking flair availability:', error)
		return false
	}
}

// Find the "Add flair" button on the submission form (before modal opens)
// IMPORTANT: This button must be found even if flair is not mandatory (no asterisk)
async function findAddFlairButtonOnForm() {
	try {
		submitLogger.log('Searching for "Add flair" button on form (mandatory or optional)...')

		// Wait a bit for form to stabilize after title is filled
		await sleep(1000)

		// Method 1: Try to find button by ID in r-post-flairs-modal shadow DOM
		const flairModal = getFlairModal()
		if (flairModal && flairModal.shadowRoot) {
			const buttonById = flairModal.shadowRoot.querySelector('button#reddit-post-flair-button')
			if (buttonById) {
				const buttonText = buttonById.textContent?.trim().toLowerCase() || ''
				if (buttonText.includes('add flair') || buttonText.includes('flair')) {
					submitLogger.log('Found "Add flair" button by ID in modal shadow root')
					return buttonById
				}
			}

			// Also try finding button in faceplate-tracker inside shadow root
			const tracker = flairModal.shadowRoot.querySelector('faceplate-tracker')
			if (tracker) {
				const buttonInTracker = tracker.querySelector('button#reddit-post-flair-button') ||
					tracker.querySelector('button')
				if (buttonInTracker) {
					const buttonText = buttonInTracker.textContent?.trim().toLowerCase() || ''
					if (buttonText.includes('add flair') || buttonText.includes('flair')) {
						submitLogger.log('Found "Add flair" button in faceplate-tracker')
						return buttonInTracker
					}
				}
			}
		}

		// Method 2: Try multiple selectors for the "Add flair" button
		const buttonSelectors = [
			'button#reddit-post-flair-button',
			'button[aria-label*="Add flair"]',
			'button[aria-label*="add flair"]',
			'button[aria-label*="flair"]',
			'[data-testid*="flair"] button',
			'r-post-flairs-modal button',
			'faceplate-tracker button',
			'button[class*="flair"]'
		]

		for (const selector of buttonSelectors) {
			const button = deepQueryShadow(selector)
			if (button) {
				const buttonText = button.textContent?.trim().toLowerCase() || ''
				const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || ''
				if ((buttonText.includes('flair') || ariaLabel.includes('flair') || buttonText.includes('add flair'))
					&& !buttonText.includes('no flair')
					&& buttonText !== 'add'
					&& buttonText !== 'cancel') {
					submitLogger.log(`Found "Add flair" button with selector: ${selector}`)
					return button
				}
			}
		}

		// Method 3: Search all buttons on page for text content
		const allButtons = deepQueryAllShadow('button')
		for (const button of allButtons) {
			const buttonText = button.textContent?.trim().toLowerCase() || ''
			const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || ''
			if ((buttonText.includes('add flair') || buttonText === 'add flair' ||
					buttonText.includes('add flair  *') || buttonText.includes('add flair *') ||
					ariaLabel.includes('add flair'))
				&& !buttonText.includes('no flair')
				&& buttonText !== 'add'
				&& buttonText !== 'cancel') {
				submitLogger.log('Found "Add flair" button by searching all buttons')
				return button
			}
		}

		// Method 4: Try text-based search for "Add flair" and "Add tags"
		const addFlairButton = findElementByText('Add flair', document, 'button')
		if (addFlairButton) {
			submitLogger.log('Found "Add flair" button by text search')
			return addFlairButton
		}

		const addTagsButton = findElementByText('Add tags', document, 'button')
		if (addTagsButton) {
			submitLogger.log('Found "Add tags" button by text search (alternative to "Add flair")')
			return addTagsButton
		}

		// Method 5: Search all buttons for "tags" text
		for (const button of allButtons) {
			const buttonText = button.textContent?.trim().toLowerCase() || ''
			if ((buttonText.includes('add tags') || buttonText.includes('tags'))
				&& !buttonText.includes('no tags')
				&& buttonText !== 'add'
				&& buttonText !== 'cancel') {
				submitLogger.log('Found "Add tags" button by searching all buttons')
				return button
			}
		}

		// Method 6: Try finding r-post-flairs-modal and its trigger button
		if (flairModal) {
			const formButtons = document.querySelectorAll('button')
			for (const btn of formButtons) {
				const btnText = btn.textContent?.trim().toLowerCase() || ''
				const btnAria = btn.getAttribute('aria-label')?.toLowerCase() || ''
				if ((btnText.includes('flair') || btnAria.includes('flair'))
					&& !btnText.includes('no flair')
					&& btnText !== 'add'
					&& btnText !== 'cancel') {
					submitLogger.log('Found flair button near modal element')
					return btn
				}
			}
		}

		submitLogger.log('"Add flair" button not found on form')
		return null
	} catch (error) {
		submitLogger.error('Error finding "Add flair" button:', error)
		return null
	}
}

function isFlairMandatory(addFlairButton) {
	try {
		if (!addFlairButton) return false

		const textMatchesRequired = (text) => {
			if (!text) return false
			const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim()
			if (normalized.includes('required')) return true
			if (normalized.includes('flair') && normalized.includes('*')) return true
			if (normalized.includes('flair') && normalized.includes('•')) return true
			return false
		}

		const candidates = [
			addFlairButton.textContent,
			addFlairButton.getAttribute('aria-label'),
			addFlairButton.getAttribute('title')
		]
		if (candidates.some(textMatchesRequired)) return true

		const container = addFlairButton.closest('fieldset, section, form, div') || addFlairButton.parentElement
		if (!container) return false

		const labeledRequired = Array.from(container.querySelectorAll('label, span, div, p'))
			.map((el) => el.textContent)
			.some(textMatchesRequired)
		if (labeledRequired) return true

		const requiredAttr = container.querySelector('[aria-required="true"], [required]')
		if (requiredAttr) return true

		return false
	} catch (error) {
		submitLogger.warn('Error checking if flair is mandatory:', error)
		return false
	}
}

// Get the flair button from shadow DOM (legacy function for modal)
async function getFlairButton() {
	try {
		const flairModal = getFlairModal()
		if (!flairModal) return null
		if (!flairModal.shadowRoot) return null

		const tracker = flairModal.shadowRoot.querySelector('faceplate-tracker')
		if (!tracker) return null

		const button = tracker.querySelector('button#reddit-post-flair-button')
		return button
	} catch (error) {
		submitLogger.error('Error getting flair button:', error)
		return null
	}
}

// Open the flair selector modal from form button
async function openFlairSelectorFromForm() {
	try {
		submitLogger.log('Opening flair selector from form button...')
		const formButton = await findAddFlairButtonOnForm()
		if (formButton) {
			submitLogger.log('Found form button, clicking to open modal...')
			formButton.click()
			await sleep(1500)
			const modal = getFlairModal()
			if (modal) {
				submitLogger.log('Flair selector modal opened successfully')
				return true
			}
		}

		const button = await getFlairButton()
		if (button) {
			const isDisabled = button.disabled || button.getAttribute('aria-disabled') === 'true'
			if (!isDisabled) {
				submitLogger.log('Using legacy method to open flair selector...')
				button.click()
				await sleep(1500)
				return true
			}
		}
		submitLogger.log('Cannot open flair selector - button not found or disabled')
		return false
	} catch (error) {
		submitLogger.error('Error opening flair selector:', error)
		return false
	}
}

async function openFlairSelector() {
	return await openFlairSelectorFromForm()
}

// Priority list for flair selection (only typical allowed variants)
const FLAIR_PRIORITY_LIST = [
	'F4M', 'F 4 M', 'f4m', 'w4m', 'W 4 M', 'Baltimore', 'Female', 'Female 4 Male',
	'female', 'Female',
	'pic', 'Pic',
	'[ ]'
]

// Helper function to normalize flair text for comparison
function normalizeFlairText(text) {
	if (!text) return ''
	return text.toLowerCase().replace(/\s+/g, '')
}

function isAllowedFlairText(text) {
	const normalized = normalizeFlairText(text)
	if (!normalized) return false

	return (
		normalized.startsWith('f4') ||
		normalized.startsWith('female') ||
		normalized.startsWith('pic') ||
		normalized.startsWith('[')
	)
}

// Find and select flair from priority list
async function selectFlairFromPriorityList() {
	try {
		submitLogger.log('Searching for available flair options...')
		await sleep(1000)

		const modal = getFlairModal()
		let searchRoot = modal || document
		if (modal && modal.shadowRoot) {
			searchRoot = modal.shadowRoot
		}

		// Click "View all flairs" if available
		if (modal && modal.shadowRoot) {
			const allButtons = Array.from(modal.shadowRoot.querySelectorAll('button'))
			let viewAllButton = null
			for (const btn of allButtons) {
				const buttonText = btn.textContent?.trim().toLowerCase() || ''
				if (buttonText.includes('view all')) {
					viewAllButton = btn
					break
				}
			}
			if (viewAllButton) {
				viewAllButton.click()
				await sleep(2000)
			}
		}

		const flairOptions = [
			...(modal?.shadowRoot ? Array.from(modal.shadowRoot.querySelectorAll('faceplate-radio-input')) : []),
			...deepQueryAllShadow('faceplate-radio-input', searchRoot),
			...(modal?.shadowRoot ? Array.from(modal.shadowRoot.querySelectorAll('input[type="radio"]')) : []),
			...deepQueryAllShadow('input[type="radio"]', searchRoot),
			...deepQueryAllShadow('[role="option"]', searchRoot),
			...deepQueryAllShadow('[role="radio"]', searchRoot),
			...deepQueryAllShadow('label', searchRoot),
			...deepQueryAllShadow('button', searchRoot),
			...deepQueryAllShadow('div[class*="flair"]', searchRoot),
			...deepQueryAllShadow('li', searchRoot)
		]

		const uniqueOptions = Array.from(new Set(flairOptions))
		const validOptions = []
		const processedElements = new Set()

		for (const option of uniqueOptions) {
			if (processedElements.has(option)) continue

			let optionText = option.textContent?.trim() || ''
			const ariaLabel = option.getAttribute('aria-label') || ''
			const value = option.getAttribute('value') || ''

			if (!optionText && option.tagName === 'INPUT') {
				const label = document.querySelector(`label[for="${option.id}"]`) || option.closest('label')
				if (label) optionText = label.textContent?.trim() || ''
			}
			if (!optionText) optionText = ariaLabel || value

			const optionTextLower = optionText.toLowerCase()
			if (optionTextLower.includes('no flair') || optionTextLower === 'no flair') {
				processedElements.add(option)
				continue
			}

			// --- EXCLUSION LOGIC ---
			if (
				optionTextLower.startsWith('male 4') ||
				optionTextLower.startsWith('male4') ||
				optionTextLower.includes('male for female') ||
				optionTextLower.includes('m 4 f') ||
				optionTextLower === 'm4f' ||
				optionTextLower.includes('[m4f]') ||
				optionTextLower.includes('(m4f)')
			) {
				submitLogger.log(`Skipping excluded flair: "${optionText}"`)
				processedElements.add(option)
				continue
			}

			// Identify editable empty flair
			if (!optionText && !['INPUT', 'RADIO'].includes(option.tagName)) {
				const container = option.closest('div, li, button, label, [role="option"]') || option.parentElement
				const hasEditIcon = container?.querySelector('[icon-name*="edit"], svg') || option.querySelector('svg')
				if (hasEditIcon || optionTextLower === '[]') {
					submitLogger.log('Found editable empty flair []')
					validOptions.push({
						element: option,
						text: '',
						isEmpty: true,
						isEditable: true,
						container: container
					})
					processedElements.add(option)
				}
				continue
			}

			if (optionText || option.tagName === 'INPUT' || option.tagName === 'LABEL') {
				if (!isAllowedFlairText(optionText)) {
					submitLogger.log(`Skipping non-allowed flair: "${optionText}"`)
					processedElements.add(option)
					continue
				}
				validOptions.push({ element: option, text: optionText, isEmpty: false, isEditable: false })
				processedElements.add(option)
			}
		}

		// Fallback for [ ] search via text
		if (validOptions.length === 0 && modal && modal.shadowRoot) {
			const allElements = deepQueryAllShadow('*', modal)
			for (const el of allElements) {
				const text = el.textContent?.trim() || ''
				if (text === '' || text === '[]' || text === '[ ]') {
					const hasEditIcon = el.querySelector('svg') || el.closest('button')?.querySelector('svg')
					if (hasEditIcon) {
						validOptions.push({
							element: el,
							text: '',
							isEmpty: true,
							isEditable: true,
							container: el.closest('div, li')
						})
						break
					}
				}
			}
		}

		// Try to find priority flair
		for (const priorityFlair of FLAIR_PRIORITY_LIST) {
			for (const option of validOptions) {
				if (option.isEmpty) continue
				const normalizedOption = normalizeFlairText(option.text)
				const normalizedPriority = normalizeFlairText(priorityFlair)

				if (normalizedOption.includes(normalizedPriority)) {
					submitLogger.log(`Found priority flair: "${priorityFlair}", selecting...`)
					let clickableElement = option.element

					// Logic to click
					clickableElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
					await sleep(300)
					clickableElement.click()

					// Ensure radio is checked
					if (clickableElement.tagName !== 'INPUT') {
						const radio = clickableElement.querySelector('input[type="radio"]') ||
							clickableElement.shadowRoot?.querySelector('input[type="radio"]')
						if (radio) radio.click()
					}

					return { success: true, selectedFlair: option.text }
				}
			}
		}

		// EDITABLE FLAIR LOGIC
		const editableEmptyFlair = validOptions.find(opt => opt.isEmpty && opt.isEditable)
		if (editableEmptyFlair) {
			submitLogger.log('Found editable empty flair [], attempting to edit...')

			// !!! CALLING CORRECTED EDIT FUNCTION
			const editResult = await editEmptyFlair(editableEmptyFlair, 'F4M')

			if (editResult) {
				return { success: true, needsConfirm: true, editedFlair: '[F4M]' }
			}
			return { success: false, needsEdit: true, element: editableEmptyFlair.element }
		}

		return { success: false, availableOptions: validOptions.map(o => o.text) }
	} catch (error) {
		submitLogger.error('Error selecting flair from priority list:', error)
		return { success: false, error: error.message }
	}
}

// --------------------------------------------------------------------------------------
// CORRECTED FUNCTION: editEmptyFlair (updated & simplified)
// --------------------------------------------------------------------------------------
async function editEmptyFlair(flairOptionOrElement, flairText = 'F4M') {
	try {
		const flairEl = flairOptionOrElement?.element || flairOptionOrElement
		const container =
			flairOptionOrElement?.container ||
			flairEl?.closest('div, li, button, label, [role="option"], [role="radio"]') ||
			flairEl?.parentElement

		if (!flairEl) {
			submitLogger.error('❌ editEmptyFlair: flair element is missing')
			return false
		}

		submitLogger.log(`Attempting to edit empty flair, target text: "${flairText}"`)
		submitLogger.log('Searching for pencil icon (олівець) to open edit modal...')

		const isVisible = (el) => {
			if (!el) return false
			const st = window.getComputedStyle(el)
			return st.display !== 'none' && st.visibility !== 'hidden' && st.opacity !== '0'
		}

		const getTopVisibleDialog = () => {
			const dialogs = Array.from(document.querySelectorAll('[role="dialog"]')).filter(isVisible)
			return dialogs.length ? dialogs[dialogs.length - 1] : null
		}

		const findApplyButton = (root) => {
			const byText = Array.from(root.querySelectorAll('button'))
				.find(b => (b.textContent || '').trim().toLowerCase() === 'apply')
			if (byText) return byText

			return Array.from(root.querySelectorAll('button')).find(b => {
				const aria = (b.getAttribute('aria-label') || '').toLowerCase()
				const title = (b.getAttribute('title') || '').toLowerCase()
				return aria === 'apply' || title === 'apply'
			}) || null
		}

		// STEP 1: open edit dialog
		let editIcon = null
		let editButton = null

		const editSelectors = [
			'button[aria-label*="edit"]',
			'button[title*="edit"]',
			'[data-testid*="edit"]',
			'[icon-name*="edit"]',
			'[icon-name*="pencil"]',
			'svg[aria-label*="edit"]',
			'svg[aria-label*="pencil"]'
		]

		for (const sel of editSelectors) {
			editButton = container?.querySelector(sel) || flairEl.querySelector(sel)
			if (editButton && editButton.tagName === 'BUTTON') break
			editButton = null

			editIcon = container?.querySelector(sel) || flairEl.querySelector(sel)
			if (editIcon) break
		}

		if (!editButton && !editIcon) {
			const clickable = flairEl.closest('button') || (flairEl.tagName === 'BUTTON' ? flairEl : null)
			if (!clickable) {
				submitLogger.error('❌ Could not find edit trigger and flair is not clickable')
				return false
			}
			submitLogger.log('No edit icon found, trying to click flair element directly...')
			clickable.scrollIntoView({ behavior: 'smooth', block: 'center' })
			await sleep(300)
			clickable.click()
			await sleep(700)

			const dialog = getTopVisibleDialog()
			if (!dialog) {
				submitLogger.error('❌ Clicking flair did not open edit dialog')
				return false
			}
			submitLogger.log('Edit dialog opened by clicking flair element directly')
		} else {
			const clickTarget = editButton || editIcon?.closest('button') || editIcon
			if (!clickTarget) {
				submitLogger.error('❌ Edit trigger resolved to null')
				return false
			}
			submitLogger.log(`Found edit trigger (${clickTarget.tagName}), clicking to open edit modal...`)
			clickTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })
			await sleep(300)
			clickTarget.click()
			await sleep(700)
		}

		// STEP 2: locate dialog + input + apply
		const dialog = getTopVisibleDialog()
		if (!dialog) {
			submitLogger.error('❌ Edit dialog not found (after open)')
			return false
		}

		submitLogger.log('Searching for input and "Apply" inside the edit dialog...')

		const applyButton = findApplyButton(dialog)
		if (!applyButton) {
			submitLogger.error('❌ Could not find "Apply" button inside edit dialog')
			return false
		}

		let inputField =
			dialog.querySelector('input[type="text"]') ||
			dialog.querySelector('textarea') ||
			dialog.querySelector('[contenteditable="true"]')

		if (!inputField) {
			const candidates = Array.from(dialog.querySelectorAll('input[type="text"], textarea, [contenteditable="true"]'))
			inputField = candidates.find(inp => {
				const id = (inp.id || '').toLowerCase()
				const ph = (inp.getAttribute('placeholder') || '').toLowerCase()
				const aria = (inp.getAttribute('aria-label') || '').toLowerCase()

				const isSearch = id.includes('search') || ph.includes('search') || aria.includes('search')
				const isTitle = id.includes('title') || ph.includes('title') || aria.includes('title')
				const isBody = id.includes('body') || ph.includes('body') || aria.includes('body')
				return !isSearch && !isTitle && !isBody
			}) || null
		}

		if (!inputField) {
			submitLogger.error('❌ Input field for editing flair not found inside edit dialog')
			return false
		}

		// STEP 3: set text
		const finalString = `[${flairText}]`
		submitLogger.log(`Entering text "${finalString}" into flair edit field...`)

		inputField.scrollIntoView({ behavior: 'smooth', block: 'center' })
		await sleep(200)
		inputField.focus()
		await sleep(200)

		if (inputField.tagName === 'INPUT' || inputField.tagName === 'TEXTAREA') {
			inputField.value = finalString
		} else if (inputField.getAttribute('contenteditable') === 'true' || inputField.contentEditable === 'true') {
			inputField.textContent = finalString
		}

		inputField.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
		inputField.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
		await sleep(200)

		// STEP 4: apply
		submitLogger.log('Clicking "Apply" button to confirm flair edit...')
		applyButton.click()
		await sleep(900)

		submitLogger.log('✅ Flair edit confirmed by clicking "Apply".')
		return true
	} catch (error) {
		submitLogger.error('Critical Error in editEmptyFlair:', error)
		return false
	}
}

// Confirm flair selection by clicking "Add" button
async function confirmFlairSelection() {
	submitLogger.log('Looking for "Add" button to confirm flair selection...');

	// First, try to select any available flair if none is selected
	// This is important because "Add" button might be disabled until a flair is selected
	const modal = document.querySelector('r-post-flairs-modal');
	if (modal && modal.shadowRoot) {
		// Check if any flair is already selected
		const selectedFlairs = modal.shadowRoot.querySelectorAll('faceplate-radio-input[checked], input[type="radio"]:checked, [aria-checked="true"]');
		if (selectedFlairs.length === 0) {
			submitLogger.log('No flair selected yet, attempting to select empty flair [] first...');
			// Try to find and click empty flair option
			const emptyFlairOptions = [
				...Array.from(modal.shadowRoot.querySelectorAll('faceplate-radio-input')),
				...Array.from(modal.shadowRoot.querySelectorAll('input[type="radio"]')),
				...Array.from(modal.shadowRoot.querySelectorAll('[role="radio"]'))
			];

			for (const option of emptyFlairOptions) {
				const optionText = option.textContent?.trim() || '';
				const optionValue = option.getAttribute('value') || '';
				// Look for empty flair options
				if (optionText === '' || optionText === '[]' || optionText === '[ ]' || optionValue === '') {
					submitLogger.log('Found empty flair option, selecting it...');
					try {
						option.click();
						await sleep(500);
						// Also try to check radio if it's an input
						if (option.tagName === 'INPUT' && option.type === 'radio') {
							option.checked = true;
							option.dispatchEvent(new Event('change', { bubbles: true }));
						}
						break;
					} catch (e) {
						submitLogger.log('Failed to select empty flair option:', e);
					}
				}
			}
			await sleep(500);
		}
	}

	// Retry configuration
	const maxAttempts = 5; // Reduced attempts - if it doesn't work after 5 tries, try other methods
	let attempt = 0;

	while (attempt < maxAttempts) {
		attempt++;
		submitLogger.log(`Confirmation attempt ${attempt}/${maxAttempts}...`);

		const checkModal = document.querySelector('r-post-flairs-modal');

		// If modal is gone or hidden, we are done
		if (!checkModal) {
			submitLogger.log('✅ Modal element not found - already closed.');
			return true;
		}

		const modalStyle = window.getComputedStyle(checkModal);
		if (modalStyle.display === 'none' || modalStyle.visibility === 'hidden' || modalStyle.opacity === '0') {
			submitLogger.log('✅ Modal is closed/hidden. Flair confirmed.');
			return true;
		}

		let addButton = null;

		// SEARCH STRATEGY 1: Deep Shadow DOM search for exact "Add" button
		if (modal.shadowRoot) {
			const buttons = Array.from(modal.shadowRoot.querySelectorAll('button'));
			addButton = buttons.find(b => {
				const text = b.textContent?.trim().toLowerCase();
				const ariaLabel = b.getAttribute('aria-label')?.toLowerCase() || '';
				return text === 'add' || text === 'apply' || ariaLabel === 'add' || ariaLabel === 'apply';
			});
		}

		// SEARCH STRATEGY 2: Fallback to recursive search if not found directly
		if (!addButton && modal.shadowRoot) {
			// Helper to crawl shadow doms
			function findButtonInShadow(root) {
				const els = Array.from(root.querySelectorAll('*'));
				for (const el of els) {
					if (el.tagName === 'BUTTON') {
						const text = el.textContent?.trim().toLowerCase();
						const ariaLabel = el.getAttribute('aria-label')?.toLowerCase() || '';
						if (text === 'add' || text === 'apply' || ariaLabel === 'add' || ariaLabel === 'apply') {
							return el;
						}
					}
					if (el.shadowRoot) {
						const found = findButtonInShadow(el.shadowRoot);
						if (found) return found;
					}
				}
				return null;
			}
			addButton = findButtonInShadow(modal.shadowRoot);
		}

		// SEARCH STRATEGY 3: Search in document for buttons near modal
		if (!addButton) {
			const allButtons = deepQueryAllShadow('button');
			for (const btn of allButtons) {
				const text = btn.textContent?.trim().toLowerCase();
				const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
				if (
					(text === 'add' || text === 'apply' || ariaLabel === 'add' || ariaLabel === 'apply') &&
					(modal.contains(btn) || btn.closest('r-post-flairs-modal'))
				) {
					addButton = btn;
					break;
				}
			}
		}

		if (!addButton) {
			submitLogger.warn('⚠️ "Add" button not found. Trying alternative methods...');
			// Try pressing Enter key as alternative
			const enterEvent = new KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'Enter',
				code: 'Enter',
				keyCode: 13
			});
			document.activeElement?.dispatchEvent(enterEvent);
			await sleep(1000);
			continue;
		}

		// Verify button enabled state
		if (addButton.disabled || addButton.getAttribute('aria-disabled') === 'true') {
			submitLogger.log('"Add" button is disabled. Attempting to select a flair first...');
			// Try to select first available flair option
			if (modal && modal.shadowRoot) {
				const firstFlairOption = modal.shadowRoot.querySelector('faceplate-radio-input, input[type="radio"]');
				if (firstFlairOption) {
					submitLogger.log('Selecting first available flair option...');
					firstFlairOption.click();
					await sleep(1000);
					// Re-check button state
					const recheckButton = modal.shadowRoot.querySelector('button');
					if (recheckButton && (!recheckButton.disabled && recheckButton.getAttribute('aria-disabled') !== 'true')) {
						addButton = recheckButton;
						submitLogger.log('Button enabled after selecting flair');
					} else {
						submitLogger.log('Button still disabled after selecting flair, continuing anyway...');
					}
				}
			}
			// Continue anyway - sometimes button works even when disabled
		}

		submitLogger.log(`Found "Add" button, performing aggressive click...`);

		// CLICK STRATEGY: Try everything to force the click
		try {
			// 1. Scroll
			addButton.scrollIntoView({ behavior: 'auto', block: 'center' });
			await sleep(100);

			// 2. Focus first
			addButton.focus();
			await sleep(100);

			// 3. Direct Click
			addButton.click();

			// 4. Mouse Events (React often needs these)
			const eventOptions = { bubbles: true, cancelable: true, view: window };
			addButton.dispatchEvent(new MouseEvent('mousedown', eventOptions));
			addButton.dispatchEvent(new MouseEvent('mouseup', eventOptions));
			addButton.dispatchEvent(new MouseEvent('click', eventOptions));

			// 5. Try keyboard Enter as well
			addButton.dispatchEvent(new KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
				key: 'Enter',
				code: 'Enter',
				keyCode: 13
			}));

			submitLogger.log('Click events dispatched.');
		} catch (e) {
			submitLogger.error('Error clicking Add button:', e);
		}

		// Wait to see if it worked
		await sleep(2000);

		// Check if modal closed
		const verifyModal = document.querySelector('r-post-flairs-modal');
		if (!verifyModal) {
			submitLogger.log('✅ Modal successfully closed after click.');
			return true;
		}

		const verifyStyle = window.getComputedStyle(verifyModal);
		if (verifyStyle.display === 'none' || verifyStyle.visibility === 'hidden' || verifyStyle.opacity === '0') {
			submitLogger.log('✅ Modal successfully closed after click.');
			return true;
		} else {
			submitLogger.warn(`❌ Modal still open after click (attempt ${attempt}/${maxAttempts}). Retrying...`);
		}
	}

	submitLogger.warn('Failed to confirm flair selection after maximum attempts. Will try Escape key...');
	// After all attempts failed, try Escape immediately
	return false;
}

// Select a flair by name (legacy function)
async function selectFlairByName(flairName) {
	try {
		if (!flairName) return false
		if (!await areFlairsAvailable()) return false
		if (!await openFlairSelector()) return false
		await sleep(500)

		const flairOptions = document.querySelectorAll('[role="option"], [data-flair], button[aria-label*="flair"]')
		for (const option of flairOptions) {
			const optionText = option.textContent?.trim().toLowerCase() || ''
			if (optionText.includes(flairName.toLowerCase())) {
				option.click()
				await sleep(500)
				return true
			}
		}
		return false
	} catch (error) {
		submitLogger.error('Error selecting flair:', error)
		return false
	}
}

// Main function to handle automatic flair selection after title is filled
async function handleAutomaticFlairSelection() {
	try {
		submitLogger.log('=== Starting automatic flair selection ===')

		// Step 1: Check if "Add flair" button exists on form
		const addFlairButton = await findAddFlairButtonOnForm()
		if (!addFlairButton) {
			submitLogger.log('"Add flair" button not found on form - flairs may not be required or available')
			return { success: true, skipped: true, reason: 'Button not found' }
		}

		const isMandatory = isFlairMandatory(addFlairButton)
		if (!isMandatory) {
			submitLogger.log('"Add flair" button found but flair is optional - skipping flair selection')
			return { success: true, skipped: true, reason: 'Flair not required' }
		}

		submitLogger.log('"Add flair" button found and marked required - opening modal...')

		// Step 2: Open flair selector modal
		if (!await openFlairSelectorFromForm()) {
			submitLogger.log('Failed to open flair selector modal')
			return { success: false, error: 'Failed to open modal' }
		}

		// Step 3: Wait for modal to fully load
		submitLogger.log('Waiting for modal to fully load...')
		await sleep(1500)

		// Step 4: Try to select flair from priority list
		const selectionResult = await selectFlairFromPriorityList()

		// Step 5: Handle selection result
		if (selectionResult.success) {
			submitLogger.log(`Flair selected successfully: "${selectionResult.selectedFlair}"`)
		} else {
			submitLogger.warn(`No specific flair selected (Reason: ${selectionResult.error || 'No match'}).`)
			submitLogger.log('Will attempt to close modal anyway by clicking "Add"...')
		}

		// Step 6: ALWAYS try to confirm/close the modal, regardless of selection success
		// This fixes the issue where the window stays open if no flair matches
		const confirmSuccess = await confirmFlairSelection()

		if (confirmSuccess) {
			submitLogger.log('=== Automatic flair selection/closing completed successfully ===')
			// Double-check modal is actually closed
			await sleep(500)
			const checkModal = getFlairModal()
			if (checkModal) {
				const checkStyle = window.getComputedStyle(checkModal)
				if (checkStyle.display !== 'none' && checkStyle.visibility !== 'hidden' && checkStyle.opacity !== '0') {
					submitLogger.warn('Modal still appears open after confirmation, forcing close...')
					const escapeEvent = new KeyboardEvent('keydown', {
						bubbles: true, cancelable: true, key: 'Escape', code: 'Escape', keyCode: 27
					})
					document.dispatchEvent(escapeEvent)
					await sleep(1000)
				}
			}
			return {
				success: true,
				selectedFlair: selectionResult.success ? selectionResult.selectedFlair : 'None/Tags Only'
			}
		} else {
			// If "Add" failed, try multiple aggressive methods to close modal
			submitLogger.warn('"Add" button click failed. Trying aggressive methods to close modal...')

			// Method 1: Escape key (multiple attempts)
			const escapeEvent = new KeyboardEvent('keydown', {
				bubbles: true, cancelable: true, key: 'Escape', code: 'Escape', keyCode: 27
			});

			for (let i = 0; i < 5; i++) {
				document.dispatchEvent(escapeEvent);
				await sleep(500);

				const modal = getFlairModal();
				if (!modal) {
					submitLogger.log('✅ Modal closed via Escape');
					return { success: true, note: 'Modal closed via Escape' };
				}
				const modalStyle = window.getComputedStyle(modal);
				if (modalStyle.display === 'none' || modalStyle.visibility === 'hidden' || modalStyle.opacity === '0') {
					submitLogger.log('✅ Modal closed via Escape');
					return { success: true, note: 'Modal closed via Escape' };
				}
			}

			// Method 2: Try clicking backdrop/overlay
			submitLogger.log('Trying to click modal backdrop/overlay...');
			const backdrop = document.querySelector('[role="dialog"]') || document.querySelector('.modal-backdrop') ||
				document.querySelector('[class*="backdrop"]') || document.querySelector('[class*="overlay"]');
			if (backdrop) {
				backdrop.click();
				await sleep(1000);
				const checkModal = getFlairModal();
				if (!checkModal || window.getComputedStyle(checkModal).display === 'none') {
					submitLogger.log('✅ Modal closed via backdrop click');
					return { success: true, note: 'Modal closed via backdrop' };
				}
			}

			// Method 3: Try to find and click Cancel/Close button
			submitLogger.log('Trying to find Cancel/Close button...');
			const currentModal = getFlairModal();
			if (currentModal) {
				const cancelButtons = deepQueryAllShadow('button');
				for (const btn of cancelButtons) {
					const text = btn.textContent?.trim().toLowerCase() || '';
					const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || '';
					if ((text === 'cancel' || text === 'close' || ariaLabel === 'cancel' || ariaLabel === 'close') &&
						(currentModal.contains(btn) || btn.closest('r-post-flairs-modal'))) {
						submitLogger.log('Found Cancel/Close button, clicking...');
						btn.click();
						await sleep(1000);
						const checkModal = getFlairModal();
						if (!checkModal || window.getComputedStyle(checkModal).display === 'none') {
							submitLogger.log('✅ Modal closed via Cancel button');
							return { success: true, note: 'Modal closed via Cancel' };
						}
						break;
					}
				}
			}

			submitLogger.error('❌ Failed to close modal after all aggressive methods');
			return { success: false, error: 'Failed to close modal after multiple attempts' }
		}

	} catch (error) {
		submitLogger.error('Error in handleAutomaticFlairSelection:', error)
		// Try emergency close
		try {
			const escapeEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape', keyCode: 27 });
			document.dispatchEvent(escapeEvent);
		} catch (e) {}
		return { success: false, error: error.message }
	}
}
async function handleFlairSelection(postData) {
	try {
		if (!postData.flair) return true
		return await selectFlairByName(postData.flair)
	} catch (error) {
		submitLogger.error('Error in handleFlairSelection:', error)
		return false
	}
}

export {
	areFlairsAvailable,
	getFlairButton,
	openFlairSelector,
	openFlairSelectorFromForm,
	selectFlairByName,
	selectFlairFromPriorityList,
	editEmptyFlair,
	confirmFlairSelection,
	handleFlairSelection,
	handleAutomaticFlairSelection,
	findAddFlairButtonOnForm
}
