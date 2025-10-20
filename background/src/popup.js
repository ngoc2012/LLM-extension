let popupWindowId = null;
const popupUrl = chrome.runtime.getURL("popup/dist/index.html");


export default function openPopup() {
  if (popupWindowId !== null) {
    // Check if the popup window still exists
    chrome.windows.get(popupWindowId, (win) => {
      if (chrome.runtime.lastError || !win) {
        // Window no longer exists, create new one
        createPopup();
      } else {
        // Window exists → check if tab still there
        chrome.tabs.query({ windowId: popupWindowId }, (tabs) => {
          const popupTab = tabs.find(tab => tab.url.startsWith(popupUrl));
          if (popupTab) {
            // Tab exists → just focus
            chrome.windows.update(popupWindowId, { focused: true });
          } else {
            // Tab missing → create again
            createPopup();
          }
        });
      }
    });
  } else {
    // No popup tracked → check all tabs globally
    chrome.tabs.query({}, (tabs) => {
      const existing = tabs.find(tab => tab.url.startsWith(popupUrl));
      if (existing) {
        chrome.windows.update(existing.windowId, { focused: true });
      } else {
        createPopup();
      }
    });
  }
}

function createPopup() {
  chrome.windows.create({
    url: popupUrl,
    type: "popup",
    width: 800,
    height: 950,
  }, (win) => {
    if (win) popupWindowId = win.id;
  });
}