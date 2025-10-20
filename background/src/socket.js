// background/src/socket.js


// Socket connection between background and popup
export function init_socket() {
  chrome.runtime.onConnect.addListener(port => {
  if (port.name !== 'bg-popup') return;

  // Initial send of tabs info
  sendTabsInfo(port);

  // Listen for messages from popup
  port.onMessage.addListener(msg => {
    console.log('Received via port from popup:', msg);
  });

  port.onDisconnect.addListener(() => {
    console.log('Port disconnected:', port);
  });

  // Listen for tab changes
  chrome.tabs.onCreated.addListener(() => sendTabsInfo(port));
  chrome.tabs.onRemoved.addListener(() => sendTabsInfo(port));
  chrome.tabs.onUpdated.addListener(() => sendTabsInfo(port));
  chrome.tabs.onActivated.addListener(() => sendTabsInfo(port));
});
}

// Helper: send info about all open tabs
async function sendTabsInfo(port) {
  const tabs = await chrome.tabs.query({});

  try {
    port.postMessage({ type: 'TABS_UPDATE', tabs });
  } catch (err) {
    console.warn('Failed to send tabs update:', err);
  }
}