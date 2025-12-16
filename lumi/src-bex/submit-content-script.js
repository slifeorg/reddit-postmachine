import { submitLogger } from "./logger.js";// Submit Content Script - Handles post submission functionality
// Only runs on submit pages: *://reddit.com/*/submit*

function injectBeforeUnloadBlocker() {
  try {
    const script = document.createElement('script')
    script.textContent = `(() => {
      try {
        const originalAdd = window.addEventListener
        window.addEventListener = function(type, listener, options) {
          if (type === 'beforeunload') return
          return originalAdd.call(this, type, listener, options)
        }
        window.onbeforeunload = null
      } catch (e) {}
    })();`
    ;(document.documentElement || document.head || document.body).appendChild(script)
    script.remove()
  } catch (e) {
  }
}

injectBeforeUnloadBlocker()

// Remove beforeunload listeners to prevent "Leave site?" dialog
function removeBeforeUnloadListeners() {
  submitLogger.log('Removing Reddit\'s beforeunload event listeners to prevent "Leave site?" dialog')

  // Remove window onbeforeunload handler
  window.onbeforeunload = null

  // Intercept beforeunload in capture phase and stop any handlers from running.
  // Do not call preventDefault / set returnValue here, since that can itself trigger the prompt.
  window.addEventListener('beforeunload', (e) => {
    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation()
    if (typeof e.stopPropagation === 'function') e.stopPropagation()
  }, true)

  submitLogger.log('Beforeunload listeners disabled successfully')
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

function deepQuery(selector, root = document) {
  return root.querySelector(selector)
}

// Storage functions
async function getStoredUsername() {
  try {
    const result = await chrome.storage.sync.get(['redditUser'])
    return result.redditUser || null
  } catch (error) {
    submitLogger.warn('Failed to get stored username:', error)
    return null
  }
}

async function fetchPostDataForSubmission() {
  try {
    // Try to get post data from sessionStorage
    const storedData = sessionStorage.getItem('reddit-post-machine-postdata')
    if (storedData) {
      const postData = JSON.parse(storedData)
      submitLogger.log('Using stored post data for submission:', postData)
      return postData
    }

    // If no stored data, this means the script is running without proper initialization
    // This should not happen in normal flow since background script provides the data
    throw new Error('No post data found - script may be running incorrectly')
  } catch (error) {
    submitLogger.error('Failed to fetch post data:', error)
    throw error
  }
}

// Note: Post generation is now handled exclusively by background.js via API

// Submit page functions
async function ensureSubmitPageReady() {
  submitLogger.log('Ensuring submit page is ready...')

  // Wait for key elements to be available
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    const submitForm = qs('form') || qs('[data-testid*="post"]') || qs('shreddit-post-composer')
    if (submitForm) {
      submitLogger.log('Submit page is ready')
      return true
    }

    submitLogger.log(`Waiting for submit page... attempt ${attempts + 1}/${maxAttempts}`)
    await sleep(1000)
    attempts++
  }

  submitLogger.log('Submit page failed to load within timeout')
  return false
}

async function fillTitle(postData) {
  submitLogger.log('Filling title field...')

  // Helper function for shadow DOM queries
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

  try {
    // Fill title field using shadow DOM (from postm-page.js)
    const titleInputElement = deepQuery('faceplate-textarea-input[name="title"]')
    if (titleInputElement && postData.title) {
      const shadowRoot = titleInputElement.shadowRoot
      if (shadowRoot) {
        const titleInput = shadowRoot.querySelector('#innerTextArea')
        if (titleInput) {
          titleInput.focus()
          await sleep(500)
          titleInput.value = postData.title
          titleInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
          titleInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
          submitLogger.log('Title field filled:', postData.title)
          await sleep(1500)
          return true
        }
      }
    }
    submitLogger.log('Failed to fill title')
    return false
  } catch (error) {
    submitLogger.error('Error filling title:', error)
    return false
  }
}

async function fillUrl(postData) {
  submitLogger.log('Filling URL field...')

  // Remove beforeunload listeners before modifying form
  if (typeof removeBeforeUnloadListeners === 'function') {
    removeBeforeUnloadListeners()
  }

  // Helper function for shadow DOM queries
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

  try {
    // Fill URL field using shadow DOM (from postm-page.js)
    submitLogger.log('URL fill attempt - postData.url:', postData?.url)
    if (postData.url && postData.url.trim()) {
      submitLogger.log('Looking for URL input element...')
      const urlInputElement = deepQuery('faceplate-textarea-input[name="link"]')
      submitLogger.log('URL input element found:', !!urlInputElement)
      if (urlInputElement) {
        const shadowRoot = urlInputElement.shadowRoot
        submitLogger.log('ShadowRoot accessible:', !!shadowRoot)
        if (shadowRoot) {
          const urlInput = shadowRoot.querySelector('#innerTextArea')
          submitLogger.log('Inner textarea found:', !!urlInput)
          if (urlInput) {
            urlInput.focus()
            await sleep(500)
            urlInput.value = postData.url
            urlInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }))
            urlInput.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
            submitLogger.log('URL field filled:', postData.url)
            await sleep(1500)
            return true
          }
        }
      }
    }
    submitLogger.log('Failed to fill URL or no URL provided')
    return false
  } catch (error) {
    submitLogger.error('Error filling URL:', error)
    return false
  }
}

async function fillBody(postData) {
  submitLogger.log('Filling body text...')

  // Helper function for shadow DOM queries
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

  try {
    // Fill body field using multiple possible selectors
    if (postData.body) {
      submitLogger.log('Looking for body text field with updated selectors...')

      // Helper function to filter out title field
      function isTitleField(element) {
        if (!element) return false
        const parent = element.closest('faceplate-textarea-input[name="title"]')
        return !!parent
      }

      // Wait a bit for lazy-loaded body field after title is filled
      await sleep(1000)

      // Try multiple possible body field selectors
      let bodyComposer = null
      let bodyEditable = null

      // Method 1: Original selector (updated to match actual DOM)
      bodyComposer = deepQuery('shreddit-composer[name="body"]')
      if (bodyComposer) {
        bodyEditable = bodyComposer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]')
      }

      // Method 2: Try different composer selectors
      if (!bodyEditable) {
        const composerSelectors = [
          'shreddit-composer',
          'shreddit-rich-text-editor',
          '[data-testid="composer"]',
          '.public-DraftEditor-content'
        ]

        for (const selector of composerSelectors) {
          const composer = deepQuery(selector)
          if (composer) {
            const candidates = [
              composer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]'),
              composer.querySelector('[contenteditable="true"]'),
              composer.querySelector('.public-DraftEditor-content')
            ]

            for (const candidate of candidates) {
              if (candidate && !isTitleField(candidate)) {
                bodyEditable = candidate
                submitLogger.log(`Found body field with selector: ${selector}`)
                break
              }
            }
            if (bodyEditable) break
          }
        }
      }

      // Method 3: Look for any contenteditable div in the submit form
      if (!bodyEditable) {
        const submitForm = qs('form') || qs('[data-testid*="post"]') || qs('shreddit-post-composer')
        if (submitForm) {
          const candidates = [
            submitForm.querySelector('div[contenteditable="true"]'),
            submitForm.querySelector('[data-lexical-editor="true"]')
          ]

          for (const candidate of candidates) {
            if (candidate && !isTitleField(candidate)) {
              bodyEditable = candidate
              submitLogger.log('Found body field in submit form')
              break
            }
          }
        }
      }

      // If still not found, try polling for a few seconds
      if (!bodyEditable) {
        submitLogger.log('Body field not immediately available, polling for up to 5 seconds...')
        const maxPollAttempts = 10
        const pollInterval = 500

        for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
          await sleep(pollInterval)

          // Retry all methods
          const bodyComposer = deepQuery('shreddit-composer[name="body"]')
          if (bodyComposer) {
            bodyEditable = bodyComposer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]')
          }

          if (!bodyEditable) {
            const submitForm = qs('form') || qs('[data-testid*="post"]') || qs('shreddit-post-composer')
            if (submitForm) {
              const candidates = [
                submitForm.querySelector('div[contenteditable="true"]'),
                submitForm.querySelector('[data-lexical-editor="true"]')
              ]

              for (const candidate of candidates) {
                if (candidate && !isTitleField(candidate)) {
                  bodyEditable = candidate
                  submitLogger.log(`Found body field after polling (attempt ${attempt + 1})`)
                  break
                }
              }
            }
          }

          if (bodyEditable) break
        }
      }

      if (bodyEditable) {
        submitLogger.log('Found body text editor, setting text...')
        bodyEditable.focus()
        await sleep(500)

        // Clear and set body text character by character
        bodyEditable.innerHTML = '<p><br></p>'
        const text = postData.body

        for (let i = 0; i < text.length; i++) {
          const char = text[i]

          if (document.execCommand && document.execCommand('insertText', false, char)) {
          } else {
            const selection = window.getSelection()
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0)
              range.deleteContents()
              const textNode = document.createTextNode(char)
              range.insertNode(textNode)
              range.setStartAfter(textNode)
              range.setEndAfter(textNode)
              selection.removeAllRanges()
              selection.addRange(range)
            }
          }

          bodyEditable.dispatchEvent(new InputEvent('input', {
            inputType: 'insertText',
            data: char,
            bubbles: true,
            cancelable: true
          }))

          await sleep(10)
        }

        bodyEditable.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }))
        submitLogger.log('Body text set successfully')
        await sleep(1500)
        return true
      } else {
        submitLogger.log('Body text field not found with any selector')
        // Debug: log available elements
        submitLogger.log('Available elements in document:')
        submitLogger.log('Forms:', document.querySelectorAll('form').length)
        submitLogger.log('Contenteditable divs:', document.querySelectorAll('[contenteditable="true"]').length)
        submitLogger.log('Shreddit composers:', document.querySelectorAll('shreddit-composer').length)
      }
    }
    submitLogger.log('Failed to fill body or no body text provided')
    return false
  } catch (error) {
    submitLogger.error('Error filling body:', error)
    return false
  }
}

async function clickBodyField() {
  submitLogger.log('Clicking body text field to activate Post button...')

  // Helper function for shadow DOM queries
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

  try {
    // Helper function to filter out title field
    function isTitleField(element) {
      if (!element) return false
      const parent = element.closest('faceplate-textarea-input[name="title"]')
      return !!parent
    }

    // Wait a bit for lazy-loaded body field
    await sleep(1000)

    // Try multiple possible body field selectors (same as fillBody)
    let bodyEditable = null

    // Method 1: Original selector (updated to match actual DOM)
    const bodyComposer = deepQuery('shreddit-composer[name="body"]')
    if (bodyComposer) {
      bodyEditable = bodyComposer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]')
    }

    // Method 2: Try different composer selectors
    if (!bodyEditable) {
      const composerSelectors = [
        'shreddit-composer',
        'shreddit-rich-text-editor',
        '[data-testid="composer"]',
        '.public-DraftEditor-content'
      ]

      for (const selector of composerSelectors) {
        const composer = deepQuery(selector)
        if (composer) {
          const candidates = [
            composer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]'),
            composer.querySelector('[contenteditable="true"]'),
            composer.querySelector('.public-DraftEditor-content')
          ]

          for (const candidate of candidates) {
            if (candidate && !isTitleField(candidate)) {
              bodyEditable = candidate
              submitLogger.log(`Found body field with selector: ${selector}`)
              break
            }
          }
          if (bodyEditable) break
        }
      }
    }

    // Method 3: Look for any contenteditable div in the submit form
    if (!bodyEditable) {
      const submitForm = qs('form') || qs('[data-testid*="post"]') || qs('shreddit-post-composer')
      if (submitForm) {
        const candidates = [
          submitForm.querySelector('div[contenteditable="true"]'),
          submitForm.querySelector('[data-lexical-editor="true"]')
        ]

        for (const candidate of candidates) {
          if (candidate && !isTitleField(candidate)) {
            bodyEditable = candidate
            submitLogger.log('Found body field in submit form')
            break
          }
        }
      }
    }

    // If still not found, try polling for a few seconds
    if (!bodyEditable) {
      submitLogger.log('Body field not immediately available, polling for up to 5 seconds...')
      const maxPollAttempts = 10
      const pollInterval = 500

      for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
        await sleep(pollInterval)

        // Retry all methods
        const bodyComposer = deepQuery('shreddit-composer[name="body"]')
        if (bodyComposer) {
          bodyEditable = bodyComposer.querySelector('div[contenteditable="true"][data-lexical-editor="true"]')
        }

        if (!bodyEditable) {
          const submitForm = qs('form') || qs('[data-testid*="post"]') || qs('shreddit-post-composer')
          if (submitForm) {
            const candidates = [
              submitForm.querySelector('div[contenteditable="true"]'),
              submitForm.querySelector('[data-lexical-editor="true"]')
            ]

            for (const candidate of candidates) {
              if (candidate && !isTitleField(candidate)) {
                bodyEditable = candidate
                submitLogger.log(`Found body field after polling (attempt ${attempt + 1})`)
                break
              }
            }
          }
        }

        if (bodyEditable) break
      }
    }

    if (bodyEditable) {
      submitLogger.log('Found body text field, clicking to activate Post button...')

      bodyEditable.click()
      await sleep(100)
      bodyEditable.focus()
      await sleep(100)
      bodyEditable.click()

      bodyEditable.dispatchEvent(new Event('focus', { bubbles: true, cancelable: true }))
      bodyEditable.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }))

      await sleep(1000)
      return true
    } else {
      submitLogger.log('Body text field not found with any selector')
      // Debug: log available elements
      submitLogger.log('Available elements in document:')
      submitLogger.log('Forms:', document.querySelectorAll('form').length)
      submitLogger.log('Contenteditable divs:', document.querySelectorAll('[contenteditable="true"]').length)
      submitLogger.log('Shreddit composers:', document.querySelectorAll('shreddit-composer').length)
    }

    submitLogger.log('Body text field not found')
    return false
  } catch (error) {
    submitLogger.error('Error clicking body field:', error)
    return false
  }
}

async function clickTab(tabValue) {
  submitLogger.log(`Clicking tab with data-select-value="${tabValue}"`)

  // Helper function for shadow DOM queries
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

  // Helper function for shadow DOM queries
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

  try {
    // Poll for dialog for up to 10 seconds
    const maxAttempts = 20
    const pollInterval = 500
    let dialogFound = false

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await sleep(pollInterval)

      // Look for dialog with rule violation text
      const dialogSelectors = [
        '[role="dialog"]',
        '.modal',
        '.popup',
        '[data-testid="dialog"]',
        'shreddit-modal',
        '.rule-violation-dialog'
      ]

      let dialog = null
      for (const selector of dialogSelectors) {
        dialog = qs(selector) || deepQuery(selector)
        if (dialog) break
      }

      if (!dialog) {
        continue // Try next attempt
      }

      dialogFound = true

      // Check if dialog contains rule violation text
      const dialogText = dialog.textContent?.toLowerCase() || ''
      const ruleViolationIndicators = [
        'break these rules',
        'rule violation',
        'may break',
        'remember, ai can make mistakes',
        'submit without editing',
        'edit post'
      ]

      const isRuleViolationDialog = ruleViolationIndicators.some(indicator =>
        dialogText.includes(indicator.toLowerCase())
      )

      if (!isRuleViolationDialog) {
        submitLogger.log('Dialog found but not a rule violation dialog')
        continue // Keep looking for the right dialog
      }

      submitLogger.log('Rule violation dialog detected, looking for "Submit without editing" button...')

      // Look for "Submit without editing" button with comprehensive search
      let submitButton = null

      // Try text-based search first (most reliable)
      const allButtons = dialog.querySelectorAll('button')
      for (const button of allButtons) {
        const buttonText = button.textContent?.trim() || ''
        if (buttonText.toLowerCase().includes('submit without editing')) {
          submitButton = button
          break
        }
      }

      // Also search in shadow DOMs within the dialog
      if (!submitButton) {
        for (const elem of dialog.querySelectorAll('*')) {
          if (elem.shadowRoot) {
            const shadowButtons = elem.shadowRoot.querySelectorAll('button')
            for (const button of shadowButtons) {
              const buttonText = button.textContent?.trim() || ''
              if (buttonText.toLowerCase().includes('submit without editing')) {
                submitButton = button
                break
              }
            }
            if (submitButton) break
          }
        }
      }

      // If not found by text, try attribute-based selectors
      if (!submitButton) {
        const submitWithoutEditingSelectors = [
          '[data-click-id="submit-without-editing"]',
          '.submit-without-editing',
          'button[type="submit"]'
        ]

        for (const selector of submitWithoutEditingSelectors) {
          submitButton = dialog.querySelector(selector) || deepQuery(selector, dialog)
          if (submitButton) break
        }
      }

      if (submitButton) {
        submitLogger.log('Found "Submit without editing" button, clicking...')
        submitButton.click()

        // Wait for dialog to close and verify submission completion
        await sleep(2000)

        // Check if dialog is gone and we're no longer on submit page (indicates success)
        const dialogStillExists = qs(dialogSelectors[0]) || deepQuery(dialogSelectors[0])
        const stillOnSubmitPage = window.location.href.includes('/submit')

        if (!dialogStillExists && !stillOnSubmitPage) {
          submitLogger.log('Rule violation dialog handled successfully - submission completed')
          return true // Success
        } else if (dialogStillExists) {
          submitLogger.log('Dialog still exists after clicking, may need to try again')
          continue // Continue polling to try again
        } else {
          submitLogger.log('Dialog closed but still on submit page, checking submission status...')
          // Give it a bit more time to navigate
          await sleep(3000)
          if (!window.location.href.includes('/submit')) {
            submitLogger.log('Rule violation dialog handled successfully - submission completed')
            return true
          } else {
            submitLogger.log('Still on submit page after dialog handling, may have failed')
            continue // Continue to see if dialog reappears
          }
        }
      } else {
        submitLogger.log('Could not find "Submit without editing" button in dialog, continuing to poll...')
        // Don't return false immediately - continue polling as button might appear later
        continue
      }
    }

    if (dialogFound) {
      submitLogger.log('Rule violation dialog was found but could not be handled within timeout period')
    } else {
      submitLogger.log('No rule violation dialog found within timeout period')
    }
    return false // No dialog appeared or couldn't be handled

  } catch (error) {
    submitLogger.error('Error handling rule violation dialog:', error)
    return false
  }
}

async function submitPost() {
  submitLogger.log('Submitting post...')

  // Helper function for shadow DOM queries
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

  try {
    // Check if post button is active (from postm-page.js)
    const checkButtonActive = () => {
      const innerButton = deepQuery('#inner-post-submit-button')
      if (innerButton) {
        const isDisabled = innerButton.disabled || innerButton.getAttribute('aria-disabled') === 'true'
        submitLogger.log('Inner post button active:', !isDisabled)
        return !isDisabled
      }

      const postContainer = deepQuery('r-post-form-submit-button#submit-post-button')
      if (postContainer && postContainer.shadowRoot) {
        const shadowButton = postContainer.shadowRoot.querySelector('button')
        if (shadowButton) {
          const isShadowDisabled = shadowButton.disabled || shadowButton.getAttribute('aria-disabled') === 'true'
          submitLogger.log('Shadow post button active:', !isShadowDisabled)
          return !isShadowDisabled
        }
      }

      return false
    }

    // Wait for button to become active
    const startTime = Date.now()
    while (Date.now() - startTime < 10000) {
      if (checkButtonActive()) {
        break
      }
      await sleep(500)
    }

    // Try inner post button first (from postm-page.js)
    const innerPostButton = deepQuery('#inner-post-submit-button')
    if (innerPostButton && !innerPostButton.disabled) {
      submitLogger.log('Found active inner post button, clicking...')
      innerPostButton.click()
      // Check for rule violation dialog after clicking submit
      await handleRuleViolationDialog()
      return true
    }

    // Try shadow DOM button (from postm-page.js)
    const postContainer = deepQuery('r-post-form-submit-button#submit-post-button')
    if (postContainer) {
      submitLogger.log('Found post container')

      if (postContainer.shadowRoot) {
        const shadowButton = postContainer.shadowRoot.querySelector('button')
        if (shadowButton && !shadowButton.disabled) {
          submitLogger.log('Found active button in shadow DOM, clicking...')
          shadowButton.click()
          // Check for rule violation dialog after clicking submit
          await handleRuleViolationDialog()
          return true
        }
      }

      submitLogger.log('Clicking post container directly')
      postContainer.click()
      // Check for rule violation dialog after clicking submit
      await handleRuleViolationDialog()
      return true
    }

    // Fallback to generic selectors
    const submitButton = qs('button[data-click-id="submit"], button[type="submit"], [data-testid="post-submit"]')
    if (submitButton) {
      submitButton.click()
      submitLogger.log('Submit button clicked')
      // Check for rule violation dialog after clicking submit
      await handleRuleViolationDialog()
      return true
    } else {
      submitLogger.log('Submit button not found')
      return false
    }
  } catch (error) {
    submitLogger.error('Error submitting post:', error)
    return false
  }
}

// Main post submission script
async function runPostSubmissionScript(skipTabStateCheck = false) {
  submitLogger.log('=== POST SUBMISSION SCRIPT STARTED ===')

  // Remove beforeunload listeners to prevent "Leave site?" dialog
  removeBeforeUnloadListeners()

  try {
    // Check if this tab was created by background script to prevent duplicate execution
    if (!skipTabStateCheck) {
      const tabStateResponse = await chrome.runtime.sendMessage({
        type: 'GET_TAB_STATE'
      })

      if (tabStateResponse.success && tabStateResponse.isBackgroundPostTab) {
        submitLogger.log('Skipping auto-run post submission - this tab was created by background script')
        return
      }
    }

    // Ensure page is fully loaded and operable
    await ensureSubmitPageReady()

    // Fetch post data
    const postData = await fetchPostDataForSubmission()
    if (!postData) {
      submitLogger.log('Post submission script: No post data available')
      return
    }

    submitLogger.log('Post submission script: Got post data:', postData.title)

    // Determine post type and stay on appropriate tab
    const isLinkPost = postData.url && postData.url.trim()
    const targetTab = isLinkPost ? 'LINK' : 'TEXT'

    submitLogger.log(`=== Submitting as ${targetTab} post ===`)

    // === STEP 1: Go to target tab and fill title ===
    submitLogger.log(`=== STEP 1: ${targetTab} TAB - Filling title ===`)
    if (await clickTab(targetTab)) {
      await fillTitle(postData)
    } else {
      submitLogger.log(`Cannot proceed without ${targetTab} tab`)
      return
    }

    // === STEP 2: Fill URL if link post ===
    if (isLinkPost) {
      submitLogger.log('=== STEP 2: Filling URL ===')
      await fillUrl(postData)
    }

    // === STEP 3: Activating Post button by clicking body field ===
    submitLogger.log('=== STEP 3: Activating Post button by clicking body field ===')
    await clickBodyField()
    await sleep(2000)

    // === STEP 4: Fill body text ===
    submitLogger.log('=== STEP 4: Fill body text ===')
    await fillBody(postData)

    // === STEP 5: Final activation click on body field ===
    submitLogger.log('=== STEP 5: Final activation click on body field ===')
    await clickBodyField()
    await sleep(2000)

    // === STEP 6: Clicking Post button ===
    submitLogger.log('=== STEP 6: Clicking Post button ===')
    const submitSuccess = await submitPost()

    if (submitSuccess) {
      submitLogger.log('Post submitted successfully, waiting 10 seconds...')
      await sleep(10000)

      // After redirect, capture the final URL as the Reddit post URL
      const redditUrl = window.location.href
      let redditPostId = null

      try {
        // Extract Reddit post ID from the submitted post URL
        // Reddit's URL formats can vary:
        // - https://reddit.com/r/subreddit/comments/abc123/title/
        // - https://www.reddit.com/r/subreddit/comments/abc123/title/
        // - https://old.reddit.com/r/subreddit/comments/abc123/title/
        // - The page might also have a data attribute with the post ID
        
        submitLogger.log('Extracting Reddit post ID from URL:', redditUrl)
        
        // Method 1: Extract from URL patterns
        const urlPatterns = [
          /\/comments\/([a-z0-9]{6,7})/i,  // Standard Reddit post ID format (6-7 chars)
          /\/r\/[^\/]+\/comments\/([a-z0-9]{6,7})/i,
          /reddit\.com\/.*\/([a-z0-9]{6,7})\//i,
          /^t3_([a-z0-9]{6,7})$/i
        ]
        
        for (const pattern of urlPatterns) {
          const match = redditUrl && redditUrl.match(pattern)
          if (match && match[1]) {
            redditPostId = match[1]
            submitLogger.log(`Extracted post ID using URL pattern: ${redditPostId}`)
            break
          }
        }
        
        // Method 2: Try to get from page data if URL extraction failed
        if (!redditPostId) {
          // Check for post ID in page data or meta tags
          const pageData = window.__r || {}
          const postIdFromData = pageData?.post?.id || 
                               document.querySelector('[data-post-id]')?.getAttribute('data-post-id') ||
                               document.querySelector('shreddit-post')?.getAttribute('id')
          
          if (postIdFromData) {
            // Extract just the ID part if it's in t3_ format
            const idMatch = postIdFromData.match(/t3_([a-z0-9]{6,7})/i) || 
                           postIdFromData.match(/([a-z0-9]{6,7})/i)
            if (idMatch && idMatch[1]) {
              redditPostId = idMatch[1]
              submitLogger.log(`Extracted post ID from page data: ${redditPostId}`)
            }
          }
        }
        
        // Method 3: Try to get from current page's post element
        if (!redditPostId && window.location.pathname.includes('/comments/')) {
          const postElement = document.querySelector('shreddit-post')
          if (postElement && postElement.id) {
            const idMatch = postElement.id.match(/t3_([a-z0-9]{6,7})/i)
            if (idMatch && idMatch[1]) {
              redditPostId = idMatch[1]
              submitLogger.log(`Extracted post ID from post element: ${redditPostId}`)
            }
          }
        }
        
        if (!redditPostId) {
          submitLogger.warn('Could not extract Reddit post ID. URL:', redditUrl)
        } else {
          submitLogger.log(`Successfully extracted Reddit post ID: ${redditPostId}`)
        }
      } catch (e) {
        submitLogger.warn('Failed to extract Reddit post ID:', e)
      }

      submitLogger.log('Captured Reddit post URL/ID after submission:', { redditUrl, redditPostId })

      // Clear post data to prevent reuse
      sessionStorage.removeItem('reddit-post-machine-postdata')

      // Notify background script of completion and pass Reddit URL/ID for Frappe sync
      chrome.runtime.sendMessage({
        type: 'ACTION_COMPLETED',
        action: 'POST_CREATION_COMPLETED',
        success: true,
        data: {
          redditUrl,
          redditPostId
        }
      }).catch(() => {})
    } else {
      submitLogger.log('Post submission failed')
      // Notify background script of failure
      chrome.runtime.sendMessage({
        type: 'ACTION_COMPLETED',
        action: 'POST_CREATION_COMPLETED',
        success: false,
        error: 'Post submission failed'
      }).catch(() => {})
      // Clear post data even on failure to prevent retry loops
      sessionStorage.removeItem('reddit-post-machine-postdata')
    }

    submitLogger.log('=== POST SUBMISSION SCRIPT COMPLETED ===')

  } catch (error) {
    submitLogger.error('Post submission script error:', error)
    // Notify background script of error
    chrome.runtime.sendMessage({
      type: 'ACTION_COMPLETED',
      action: 'POST_CREATION_COMPLETED',
      success: false,
      error: error.message
    }).catch(() => {})
  }
}

// Handle manual script trigger from background/popup
async function handleManualScriptTrigger(scriptType, mode) {
  submitLogger.log(`=== MANUAL TRIGGER: ${scriptType} (mode: ${mode}) ===`)

  try {
    if (scriptType === 'post') {
      // Clear any existing script stage for manual execution
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

  // Check if already on submit page - if so, don't create new tab
  if (window.location.href.includes('/submit')) {
    submitLogger.log('Already on submit page, storing post data and triggering submission')
    if (postData) {
      sessionStorage.setItem('reddit-post-machine-postdata', JSON.stringify(postData));
    }
    // Trigger submission immediately
    runPostSubmissionScript(true)
    return
  }

  if (postData) {
      sessionStorage.setItem('reddit-post-machine-postdata', JSON.stringify(postData));
  }

  // Check if user is logged in first
  submitLogger.log('Checking if user is logged in using proven method...')

  // Look for the avatar button that would indicate logged in state
  const avatarButton = qs('rpl-dropdown div, [data-testid="user-avatar"], button[aria-label*="user"], #expand-user-drawer-button')

  if (avatarButton) {
    submitLogger.log('Found user avatar button - user is logged in')
  } else {
    submitLogger.log('User avatar button not found - user may not be logged in')
    return
  }

  // Request background script to create new tab instead of navigating
  submitLogger.log('Requesting background script to create new post tab')
  chrome.runtime.sendMessage({
    type: 'CREATE_POST_TAB',
    postData: postData // Only use data provided by background script
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
  submitLogger.log('Submit script received message:', message)

  switch (message.type) {
    case 'START_POST_CREATION':
      handleStartPostCreation(message.userName, message.postData)
      break

    case 'MANUAL_TRIGGER_SCRIPT':
      handleManualScriptTrigger(message.scriptType, message.mode)
      break

    case 'DELETE_LAST_POST':
      // Submit script delegates delete operations to main content script
      submitLogger.log('Submit script: DELETE_LAST_POST not supported on submit page, delegating...')
      chrome.runtime.sendMessage({
        type: 'ACTION_COMPLETED',
        action: 'DELETE_LAST_POST',
        success: false,
        error: 'Delete operations must be performed on user profile pages'
      }).catch(() => {})
      break

    default:
      // Silently ignore messages not intended for submit script
      return
  }
})

// Initialize submit script
submitLogger.log('🟢 SUBMIT content script loaded on URL:', window.location.href)
submitLogger.log('🟢 SUBMIT script: All loaded scripts check:', document.querySelectorAll('script').length)

// Note: Auto-run disabled to prevent automatic tab creation
// Auto-run would be triggered here if needed

// Export default function for Quasar bridge compatibility
export default function (bridge) {
  // This function is called by Quasar's BEX bridge system
  submitLogger.log('Submit script bridge initialized', bridge)
}
