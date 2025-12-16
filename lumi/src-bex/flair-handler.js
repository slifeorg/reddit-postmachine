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

// Get the flair button from shadow DOM
async function getFlairButton() {
  try {
    const flairModal = getFlairModal()
    if (!flairModal) {
      submitLogger.log('Flair modal not found')
      return null
    }
    
    if (!flairModal.shadowRoot) {
      submitLogger.log('Flair modal shadow root not accessible')
      return null
    }
    
    // Access button inside shadow root
    const tracker = flairModal.shadowRoot.querySelector('faceplate-tracker')
    if (!tracker) {
      submitLogger.log('Faceplate tracker not found in shadow root')
      return null
    }
    
    const button = tracker.querySelector('button#reddit-post-flair-button')
    if (!button) {
      submitLogger.log('Flair button not found in tracker')
      return null
    }
    
    submitLogger.log('Found flair button successfully')
    return button
  } catch (error) {
    submitLogger.error('Error getting flair button:', error)
    return null
  }
}

// Open the flair selector modal
async function openFlairSelector() {
  try {
    const button = await getFlairButton()
    if (!button) {
      submitLogger.log('Cannot open flair selector - button not found')
      return false
    }
    
    // Check if button is disabled
    const isDisabled = button.disabled || button.getAttribute('aria-disabled') === 'true'
    if (isDisabled) {
      submitLogger.log('Flair button is disabled')
      return false
    }
    
    submitLogger.log('Clicking flair button to open selector...')
    button.click()
    await sleep(1000) // Wait for modal to open
    
    submitLogger.log('Flair selector opened')
    return true
  } catch (error) {
    submitLogger.error('Error opening flair selector:', error)
    return false
  }
}

// Select a flair by name
async function selectFlairByName(flairName) {
  try {
    if (!flairName || typeof flairName !== 'string') {
      submitLogger.log('Invalid flair name provided')
      return false
    }
    
    // Check if flairs are available first
    if (!await areFlairsAvailable()) {
      submitLogger.log('Flairs not available, skipping flair selection')
      return false
    }
    
    // Open the flair selector
    if (!await openFlairSelector()) {
      submitLogger.log('Failed to open flair selector')
      return false
    }
    
    // Wait for flair options to appear
    await sleep(500)
    
    // Find and click flair option by text content
    const flairOptions = document.querySelectorAll('[role="option"], [data-flair], button[aria-label*="flair"]')
    submitLogger.log(`Found ${flairOptions.length} potential flair options`)
    
    for (const option of flairOptions) {
      const optionText = option.textContent?.trim().toLowerCase() || ''
      const targetText = flairName.toLowerCase()
      
      if (optionText === targetText || optionText.includes(targetText)) {
        submitLogger.log(`Found matching flair: "${flairName}", selecting...`)
        option.click()
        await sleep(500)
        
        submitLogger.log(`Flair "${flairName}" selected successfully`)
        return true
      }
    }
    
    submitLogger.log(`Flair "${flairName}" not found in available options`)
    submitLogger.log('Available flair options:', Array.from(flairOptions).map(o => o.textContent?.trim()))
    return false
  } catch (error) {
    submitLogger.error('Error selecting flair:', error)
    return false
  }
}

// Main function to handle flair selection in submission flow
async function handleFlairSelection(postData) {
  try {
    if (!postData.flair) {
      submitLogger.log('No flair specified in post data')
      return true // Not an error, just skip
    }
    
    submitLogger.log(`Attempting to select flair: "${postData.flair}"`)
    const success = await selectFlairByName(postData.flair)
    
    if (success) {
      submitLogger.log('Flair selection completed successfully')
      return true
    } else {
      submitLogger.log('Flair selection failed or flair not available')
      return false // Return false so caller can decide whether to continue
    }
  } catch (error) {
    submitLogger.error('Error in handleFlairSelection:', error)
    return false
  }
}

export {
  areFlairsAvailable,
  getFlairButton,
  openFlairSelector,
  selectFlairByName,
  handleFlairSelection
}

