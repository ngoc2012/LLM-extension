import { pushLog } from "./pushLog";


// Injects a script file into the specified tab.
function injectScript(file, tabId) {
  const scriptName = file.split('/').pop().split('.').shift();
  return new Promise((resolve, reject) => {
    if (!tabId) {
      pushLog(`No tab ID available, cannot inject ${scriptName.toLowerCase()}.`);
      return resolve(); // resolve early so caller doesn't hang
    }
    chrome.scripting.executeScript(
      { target: { tabId }, files: [file] },
      () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          pushLog(`${scriptName} injection failed: ${chrome.runtime.lastError.message}`);
        } else {
          pushLog(`${scriptName} injected to ${tabId}.`);
          resolve();
        }
      }
    );
  });
}

export function navigateToUrl(url, tabId) {
  return new Promise((resolve, reject) => {
    if (!tabId) {
      pushLog(`No tab ID available, cannot navigate to ${url}.`);
      return resolve(); // resolve early so caller doesn't hang
    }
    if (typeof tabId !== 'number') {
      pushLog(`Invalid tab ID: ${tabId}.`);
      return resolve(); // resolve early so caller doesn't hang
    }
    chrome.tabs.update(tabId, { url }, (tab) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        pushLog(`Navigation to ${url} failed: ${chrome.runtime.lastError.message}`);
      } else {
        pushLog(`Navigated tab ${tabId} to ${url}.`);
        resolve();
      }
    });
  });
}

export const actions = [ navigateToUrl ];