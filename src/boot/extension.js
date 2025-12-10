/**
 * Extension boot file
 * Initializes extension-specific functionality
 */

import { boot } from 'quasar/wrappers'

export default boot(({ app, router }) => {
  // Check if running in extension context
  const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id

  if (isExtension) {
    console.log('Running in extension context')
    
    // Add extension-specific global properties
    app.config.globalProperties.$isExtension = true
    app.config.globalProperties.$chrome = chrome
    
    // Extension-specific router navigation handling
    router.beforeEach((to, from, next) => {
      console.log('Extension navigation:', from.path, '->', to.path)
      next()
    })
    
    // Initialize extension storage helper
    app.config.globalProperties.$extensionStorage = {
      async get(key) {
        return new Promise((resolve) => {
          chrome.storage.sync.get([key], (result) => {
            resolve(result[key])
          })
        })
      },
      
      async set(key, value) {
        return new Promise((resolve) => {
          chrome.storage.sync.set({ [key]: value }, () => {
            resolve()
          })
        })
      },
      
      async remove(key) {
        return new Promise((resolve) => {
          chrome.storage.sync.remove([key], () => {
            resolve()
          })
        })
      }
    }
    
    // Initialize extension messaging
    app.config.globalProperties.$extensionMessage = {
      send(message) {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage(message, (response) => {
            resolve(response)
          })
        })
      },
      
      onMessage(callback) {
        chrome.runtime.onMessage.addListener(callback)
      }
    }
  } else {
    console.log('Running in regular web context')
    app.config.globalProperties.$isExtension = false
  }
})