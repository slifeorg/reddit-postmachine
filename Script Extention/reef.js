const REDDIT_HOME_URL = 'https://www.reddit.com/?feed=home'

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const handlers = {
    'GET_SERVICE_STATUS': async (request) => {
       console.log(request)
    },
  }
    if (handlers[request.action]) {
    handleAsyncMessage(() => handlers[request.action](request), sendResponse, request.action)
    return true
  }

  return ['GET_SERVICE_STATUS'].includes(request.action)
})
const handleAsyncMessage = async (operation, sendResponse, logContext = '') => {
  try {
    const result = await operation()
    sendResponse(result)
  } catch (error) {
    logger(logContext || 'MessageListener', `Error: ${error.message}`, 'error', { error })
    sendResponse({ error: error.message })
  }
}
