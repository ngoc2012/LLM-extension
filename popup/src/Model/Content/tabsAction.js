import { pushActionLog } from "../../pushLog";

/**
 * Run general Chrome tabs actions.
 * 
 * @param {Array<any>} actionArray - e.g. ['navigate', 'https://example.com', 123]
 * @param {number} tabId - ID of the tab
 */
export function tabsAction(actionArray, tabId = null) {
  return new Promise((resolve, reject) => {
    const [action, ...args] = actionArray;
    pushActionLog(`tabsAction(${action}): ${args.join(", ")}`);
    if (tabId !== null) {
      args.push(tabId);
    }

    const actions = {
      navigate: (url, tabId) => {
        if (!tabId || typeof tabId !== "number") {
          const msg = `Invalid tab ID: ${tabId}`;
          return resolve(msg);
        }
        chrome.tabs.update(tabId, { url }, (tab) => {
          if (chrome.runtime.lastError) {
            const errMsg = `Navigation failed: ${chrome.runtime.lastError.message}`;
            pushActionLog(errMsg);
            reject(errMsg);
          } else {
            const msg = `Navigated tab ${tabId} to ${url}`;
            pushActionLog(msg);
            resolve(msg);
          }
        });
      },

      getAll: () => {
        chrome.tabs.query({}, (tabs) => {
          const summaries = tabs.map((t) => ({
            id: t.id,
            url: t.url,
          }));
          // pushActionLog(`Found ${summaries.length} open tabs`);
          resolve(summaries);
        });
      },

      getActive: () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0];
          resolve(`Active tab: ${tab?.title ?? "none"}`);
        });
      },

      create: (url) => {
        chrome.tabs.create({ url }, (tab) => {
          const msg = `Created new tab with URL: ${url}`;
          resolve(msg);
        });
      },

      remove: (tabId) => {
        if (!tabId || typeof tabId !== "number") {
          const msg = `Invalid tab ID: ${tabId}`;
          pushActionLog(msg);
          return resolve(msg);
        }
        chrome.tabs.remove(tabId, () => {
          if (chrome.runtime.lastError) {
            const errMsg = `Remove failed: ${chrome.runtime.lastError.message}`;
            pushActionLog(errMsg);
            reject(errMsg);
          } else {
            const msg = `Closed tab ${tabId}`;
            pushActionLog(msg);
            resolve(msg);
          }
        });
      },

      activate: (tabId) => {
        if (!tabId || typeof tabId !== "number") {
          const msg = `Invalid tab ID: ${tabId}`;
          pushActionLog(msg);
          return resolve(msg);
        }
        chrome.tabs.update(tabId, { active: true }, (tab) => {
          const msg = `Activated tab ${tabId}`;
          pushActionLog(msg);
          resolve(msg);
        });
      },

      reload: (tabId) => {
        if (!tabId || typeof tabId !== "number") {
          const msg = `Invalid tab ID: ${tabId}`;
          pushActionLog(msg);
          return resolve(msg);
        }
        chrome.tabs.reload(tabId, () => {
          const msg = `Reloaded tab ${tabId}`;
          pushActionLog(msg);
          resolve(msg);
        });
      },
    };

    const fn = actions[action];
    if (!fn) {
      const msg = `Unknown tabs action: ${action}`;
      pushActionLog(msg);
      return resolve(msg);
    }

    try {
      fn(...args);
    } catch (e) {
      const msg = `Error executing tabs action ${action}: ${e.message}`;
      pushActionLog(msg);
      reject(msg);
    }
  });
}