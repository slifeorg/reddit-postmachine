/* eslint-disable */
/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 *
 * You are probably looking on adding startup/initialization code.
 * Use "quasar new boot <name>" and add it there.
 * One boot file per concern. Then reference the file(s) in quasar.config.js > boot:
 * boot: ['file', ...] // do not add ".js" extension to it.
 *
 * Boot files are your "main.js"
 **/


import { createApp } from 'vue'



import { uid } from 'quasar'
import BexBridge from './bex/bridge'





import '@quasar/extras/roboto-font/roboto-font.css'

import '@quasar/extras/material-icons/material-icons.css'




// We load Quasar stylesheet file
import 'quasar/dist/quasar.css'




import 'src/css/app.scss'


import createQuasarApp from './app.js'
import quasarUserOptions from './quasar-user-options.js'







const publicPath = ``

async function start ({
  app,
  router
  
}, bootFiles) {
  

  
  let hasRedirected = false
  const getRedirectUrl = url => {
    try { return router.resolve(url).href }
    catch (err) {}

    return Object(url) === url
      ? null
      : url
  }
  const redirect = url => {
    hasRedirected = true

    if (typeof url === 'string' && /^https?:\/\//.test(url)) {
      window.location.href = url
      return
    }

    const href = getRedirectUrl(url)

    // continue if we didn't fail to resolve the url
    if (href !== null) {
      window.location.href = href
      window.location.reload()
    }
  }

  const urlPath = window.location.href.replace(window.location.origin, '')

  for (let i = 0; hasRedirected === false && i < bootFiles.length; i++) {
    try {
      await bootFiles[i]({
        app,
        router,
        
        ssrContext: null,
        redirect,
        urlPath,
        publicPath
      })
    }
    catch (err) {
      if (err && err.url) {
        redirect(err.url)
        return
      }

      console.error('[Quasar] boot error:', err)
      return
    }
  }

  if (hasRedirected === true) {
    return
  }
  

  app.use(router)
  

  

    

    

    
      function connect () {
        const buildConnection = (id, cb) => {
          const port = chrome.runtime.connect({
            name: 'app:' + id
          })

          let disconnected = false
          port.onDisconnect.addListener(() => {
            disconnected = true
          })

          let bridge = new BexBridge({
            listen (fn) {
              port.onMessage.addListener(fn)
            },
            send (data) {
              if (!disconnected) {
                port.postMessage(data)
              }
            }
          })

          cb(bridge)
        }

        const fallbackConnection = cb => {
          // If we're not in a proper web browser tab, generate an id so we have a unique connection to whatever it is.
          // this could be the popup window or the options window (As they don't have tab ids)
          // If dev tools is available, it means we're on it. Use that for the id.
          const tabId = chrome.devtools ? chrome.devtools.inspectedWindow.tabId : uid()
          buildConnection(tabId, cb)
        }

        const shellConnect = cb => {
          if (chrome.tabs && !chrome.devtools) {
            // If we're on a web browser tab, use the current tab id to connect to the app.
            chrome.tabs.getCurrent(tab => {
              if (tab && tab.id) {
                buildConnection(tab.id, cb)
              }
              else {
                fallbackConnection(cb)
              }
            })
          }
          else {
            fallbackConnection(cb)
          }
        }

        shellConnect(bridge => {
          window.QBexBridge = bridge
          app.config.globalProperties.$q.bex = window.QBexBridge
          app.mount('#q-app')
        })
      }

      if (chrome.runtime.id) {
        // Chrome ~73 introduced a change which requires the background connection to be
        // active before the client this makes sure the connection has had time before progressing.
        // Could also implement a ping pattern and connect when a valid response is received
        // but this way seems less overhead.
        setTimeout(() => {
          connect()
        }, 300)
      }
    

  

}

createQuasarApp(createApp, quasarUserOptions)

  .then(app => {
    // eventually remove this when Cordova/Capacitor/Electron support becomes old
    const [ method, mapFn ] = Promise.allSettled !== void 0
      ? [
        'allSettled',
        bootFiles => bootFiles.map(result => {
          if (result.status === 'rejected') {
            console.error('[Quasar] boot error:', result.reason)
            return
          }
          return result.value.default
        })
      ]
      : [
        'all',
        bootFiles => bootFiles.map(entry => entry.default)
      ]

    return Promise[ method ]([
      
      import('boot/extension')
      
    ]).then(bootFiles => {
      const boot = mapFn(bootFiles).filter(entry => typeof entry === 'function')
      start(app, boot)
    })
  })

