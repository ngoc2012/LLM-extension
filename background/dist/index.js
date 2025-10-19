// src/index.js
var popupWindowId = null;
var popupUrl = chrome.runtime.getURL("popup/dist/index.html");
console.log("Popup URL:", popupUrl);
createPopup();
function openPopup() {
  if (popupWindowId !== null) {
    chrome.windows.get(popupWindowId, (win) => {
      if (chrome.runtime.lastError || !win) {
        createPopup();
      } else {
        chrome.tabs.query({ windowId: popupWindowId }, (tabs) => {
          const popupTab = tabs.find((tab) => tab.url.startsWith(popupUrl));
          if (popupTab) {
            chrome.windows.update(popupWindowId, { focused: true });
          } else {
            createPopup();
          }
        });
      }
    });
  } else {
    chrome.tabs.query({}, (tabs) => {
      const existing = tabs.find((tab) => tab.url.startsWith(popupUrl));
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
    height: 850
  }, (win) => {
    if (win) popupWindowId = win.id;
  });
}
export {
  openPopup
};
