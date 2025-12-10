const response = chrome.runtime.sendMessage({ action: 'GET_SERVICE_STATUS' });console.log(response)
