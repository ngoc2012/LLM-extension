import { pushLog } from "./pushLog";

import { pushLog } from "./pushLog";

/**
 * Run general Chrome tabs actions.
 * 
 * @param {Array<any>} actionArray - Array where the first item is the action name, rest are arguments.
 *   Examples:
 *     ['navigate', 'https://example.com', 123]
 *     ['getAll']
 *     ['activate', 123]
 *     ['create', 'https://openai.com']
 *     ['remove', 456]
 */
export function tabsAction(actionArray) {
  return new Promise((resolve, reject) => {
    const [action, ...args] = actionArray;

    const actions = {
      /**
       * Navigate an existing tab to a URL.
       * ['navigate', url, tabId]
       */
      navigate: (url, tabId) => {
        if (!tabId || typeof tabId !== 'number') {
          pushLog(`Invalid tab ID: ${tabId}`);
          return resolve();
        }
        chrome.tabs.update(tabId, { url }, (tab) => {
          if (chrome.runtime.lastError) {
            pushLog(`Navigation failed: ${chrome.runtime.lastError.message}`);
            reject(chrome.runtime.lastError);
          } else {
            pushLog(`Navigated tab ${tabId} to ${url}`);
            resolve(tab);
          }
        });
      },

      /**
       * Get list of all open tabs.
       * ['getAll']
       */
      getAll: () => {
        chrome.tabs.query({}, (tabs) => {
          const summaries = tabs.map((t) => ({
            id: t.id,
            title: t.title,
            url: t.url,
            active: t.active,
            windowId: t.windowId,
          }));
          resolve(summaries);
        });
      },

      /**
       * Get the currently active tab.
       * ['getActive']
       */
      getActive: () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          resolve(tabs[0]);
        });
      },

      /**
       * Create a new tab.
       * ['create', url]
       */
      create: (url) => {
        chrome.tabs.create({ url }, (tab) => {
          pushLog(`Created new tab with URL: ${url}`);
          resolve(tab);
        });
      },

      /**
       * Remove a tab.
       * ['remove', tabId]
       */
      remove: (tabId) => {
        if (!tabId || typeof tabId !== 'number') {
          pushLog(`Invalid tab ID: ${tabId}`);
          return resolve();
        }
        chrome.tabs.remove(tabId, () => {
          if (chrome.runtime.lastError) {
            pushLog(`Remove failed: ${chrome.runtime.lastError.message}`);
            reject(chrome.runtime.lastError);
          } else {
            pushLog(`Closed tab ${tabId}`);
            resolve();
          }
        });
      },

      /**
       * Activate a specific tab.
       * ['activate', tabId]
       */
      activate: (tabId) => {
        if (!tabId || typeof tabId !== 'number') {
          pushLog(`Invalid tab ID: ${tabId}`);
          return resolve();
        }
        chrome.tabs.update(tabId, { active: true }, (tab) => {
          pushLog(`Activated tab ${tabId}`);
          resolve(tab);
        });
      },

      /**
       * Reload a tab.
       * ['reload', tabId]
       */
      reload: (tabId) => {
        if (!tabId || typeof tabId !== 'number') {
          pushLog(`Invalid tab ID: ${tabId}`);
          return resolve();
        }
        chrome.tabs.reload(tabId, () => {
          pushLog(`Reloaded tab ${tabId}`);
          resolve();
        });
      },
    };

    // --- Execute ---
    const fn = actions[action];
    if (!fn) {
      const msg = `Unknown tabs action: ${action}`;
      pushLog(msg);
      return resolve(msg);
    }

    try {
      fn(...args);
    } catch (e) {
      const msg = `Error executing tabs action ${action}: ${e.message}`;
      pushLog(msg);
      reject(e);
    }
  });
}


/**
 * Run arbitrary DOM actions in the page context.
 *
 * @param {Array<any>} actionArray - Array where the first element is the action name, and the rest are arguments.
 *   Example: ['click', '#submit'] or ['inputText', '#email', 'john@example.com']
 * @param {number} tabId - ID of the tab to execute in
 */
export function domAction(actionArray, tabId) {
  return new Promise((resolve, reject) => {
    if (!tabId) {
      pushLog(`No tab ID available, cannot perform action ${actionArray}.`);
      return resolve();
    }
    if (typeof tabId !== "number") {
      pushLog(`Invalid tab ID: ${tabId}.`);
      return resolve();
    }

    chrome.scripting.executeScript(
      {
        target: { tabId },
        world: "MAIN",
        func: async (actionArgs) => {
          const actions = {
            click: (sel) => {
              const el = document.querySelector(sel);
              if (!el) return `Element ${sel} not found`;
              el.click();
              return `Clicked ${sel}`;
            },

            inputText: (sel, text) => {
              const el = document.querySelector(sel);
              if (!el) return `Element ${sel} not found`;
              el.value = text;
              el.dispatchEvent(new Event("input", { bubbles: true }));
              return `Set text on ${sel}`;
            },

            getText: (sel) => document.querySelector(sel)?.innerText ?? null,
            getHTML: (sel) => document.querySelector(sel)?.outerHTML ?? null,
            exists: (sel) => !!document.querySelector(sel),

            focus: (sel) => {
              const el = document.querySelector(sel);
              if (el) el.focus();
              return `Focused ${sel}`;
            },
            blur: (sel) => {
              const el = document.querySelector(sel);
              if (el) el.blur();
              return `Blurred ${sel}`;
            },

            scrollToTop: () => {
              window.scrollTo(0, 0);
              return "Scrolled to top";
            },
            scrollToBottom: () => {
              window.scrollTo(0, document.body.scrollHeight);
              return "Scrolled to bottom";
            },
            scrollBy: (x, y) => {
              window.scrollBy(x, y);
              return `Scrolled by (${x}, ${y})`;
            },

            wait: async (ms) => {
              await new Promise((r) => setTimeout(r, ms));
              return `Waited ${ms}ms`;
            },

            getTitle: () => document.title,
            getUrl: () => location.href,

            reload: () => {
              location.reload();
              return "Reloaded page";
            },

            highlight: (sel) => {
              const el = document.querySelector(sel);
              if (!el) return `Element ${sel} not found`;
              el.style.outline = "2px solid red";
              return `Highlighted ${sel}`;
            },

            queryAll: (sel) =>
              Array.from(document.querySelectorAll(sel))
                .map((e) => e.innerText.trim())
                .filter(Boolean),
          };

          const [actionName, ...params] = actionArgs;
          const fn = actions[actionName];
          if (!fn) return `Unknown action: ${actionName}`;

          try {
            const result = await fn(...params);
            return result;
          } catch (e) {
            return `Error executing ${actionName}: ${e.message}`;
          }
        },
        args: [actionArray],
      },
      (results) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          pushLog(`Action ${actionArray} failed: ${chrome.runtime.lastError.message}`);
        } else {
          const result = results?.[0]?.result;
          pushLog(`documentAction(${actionArray}): ${result}`);
          resolve(result);
        }
      }
    );
  });
}


/**
 * General LLM Action Dispatcher.
 * 
 * Allows unified control of browser (tabs, DOM, etc.)
 * 
 * @param {Array<any>} commandArray - First entry defines the domain ('tabs' or 'dom'),
 *                                   rest defines the specific action and args.
 * 
 * Examples:
 *   ['tabs', 'navigate', 'https://example.com', 123]
 *   ['tabs', 'getAll']
 *   ['dom', 'click', '#submit', 123]
 *   ['dom', 'inputText', '#email', 'test@example.com', 123]
 */
export async function llmAction(commandArray) {
  if (!Array.isArray(commandArray) || commandArray.length === 0) {
    pushLog(`Invalid command: ${JSON.stringify(commandArray)}`);
    return;
  }

  const [category, ...args] = commandArray;
  pushLog(`🧠 LLM Action → ${category}: ${args.join(", ")}`);

  try {
    switch (category) {
      case "tabs":
        return await tabsAction(args);

      case "dom":
        // args example: ['click', '#submit', 123]
        // The last argument may be tabId
        const maybeTabId = args[args.length - 1];
        const hasTabId = typeof maybeTabId === "number";

        const object = [args[0]]; // e.g. ['click']
        const domArgs = hasTabId ? args.slice(1, -1) : args.slice(1);
        const tabId = hasTabId ? maybeTabId : null;

        return await domAction(object, domArgs, tabId);

      default:
        pushLog(`Unknown action category: ${category}`);
        return `Unknown category: ${category}`;
    }
  } catch (err) {
    pushLog(`❌ LLM Action failed: ${err.message}`);
    throw err;
  }
}