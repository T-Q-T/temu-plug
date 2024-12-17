chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "saveFile") {
      const blob = new Blob([message.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
  
      chrome.downloads.download({
        url: url,
        filename: message.filename,
        saveAs: true
      });
  
      sendResponse({ status: "success" });
    }
  });
  