// Listen for messages from popup
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Message received in content script");
    
    if (request.action === 'getPageContent') {
      // Get main content from the page
      const content = {
        title: document.title,
        text: document.body.innerText,
        url: window.location.href
      };
      
      // Send response back to popup
      sendResponse({ content: content });
    }
    // Return true to indicate we will send response asynchronously
    return true;
  }
); 