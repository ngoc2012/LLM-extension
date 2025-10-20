import { pushActionLog } from "./pushLog";

/**
 * Run general Chrome tabs actions.
 * 
 * @param {Array<any>} actionArray - e.g. ['navigate', 'https://example.com', 123]
 */
export function tabsAction(actionArray, tabId = null) {
  return new Promise((resolve, reject) => {
    const [action, ...args] = actionArray;
    pushActionLog(`🧭 tabsAction(${action}): ${args.join(", ")}`);

    const actions = {
      navigate: (url, tabId) => {
        if (!tabId || typeof tabId !== "number") {
          const msg = `Invalid tab ID: ${tabId}`;
          pushActionLog(msg);
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
            title: t.title,
            url: t.url,
            active: t.active,
            windowId: t.windowId,
          }));
          pushActionLog(`Found ${summaries.length} open tabs`);
          resolve(summaries);
        });
      },

      getActive: () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0];
          pushActionLog(`Active tab: ${tab?.title ?? "none"}`);
          resolve(tab);
        });
      },

      create: (url) => {
        chrome.tabs.create({ url }, (tab) => {
          const msg = `Created new tab with URL: ${url}`;
          pushActionLog(msg);
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

/**
 * Run arbitrary DOM actions inside a tab’s main world.
 *
 * @param {Array<any>} actionArray - e.g. ['click', '#submit']
 * @param {number} tabId - ID of the tab
 */
export function domAction(actionArray, tabId) {
  return new Promise((resolve, reject) => {
    pushActionLog(`🧩 domAction(${actionArray.join(", ")}) in tab ${tabId}`);

    if (!tabId || typeof tabId !== "number") {
      const msg = `Invalid tab ID: ${tabId}`;
      pushActionLog(msg);
      return resolve(msg);
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
              el?.focus();
              return `Focused ${sel}`;
            },
            blur: (sel) => {
              const el = document.querySelector(sel);
              el?.blur();
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
            return await fn(...params);
          } catch (e) {
            return `Error executing ${actionName}: ${e.message}`;
          }
        },
        args: [actionArray],
      },
      (results) => {
        if (chrome.runtime.lastError) {
          const msg = `Action ${actionArray} failed: ${chrome.runtime.lastError.message}`;
          pushActionLog(msg);
          return reject(msg);
        }
        const result = results?.[0]?.result ?? "No result";
        const msg = `DOM action result: ${result}`;
        pushActionLog(msg);
        resolve(result);
      }
    );
  });
}

/**
 * General LLM Action Dispatcher.
 */
export async function llmAction(commandArray) {
  if (!Array.isArray(commandArray) || commandArray.length === 0) {
    const msg = `Invalid command: ${JSON.stringify(commandArray)}`;
    pushActionLog(msg);
    return msg;
  }

  const [category, ...args] = commandArray;
  pushActionLog(`🧠 LLM Action → ${category}: ${args.join(", ")}`);
  const tabIdString = args.length > 0 ? args.pop() : null;
  const tabId = tabIdString ? parseInt(tabIdString) : null;

  try {
    let message;
    switch (category) {
      case "tabs":
        message = await tabsAction(args, tabId);
        break;

      case "dom": {
        console.log("DOM action args:", args);
        message = await domAction(args, tabId);
        break;
      }

      default:
        message = `Unknown category: ${category}`;
        pushActionLog(message);
        return message;
    }

    pushActionLog(`✅ LLM ${category} action result: ${JSON.stringify(message)}`);
    return message;
  } catch (err) {
    const msg = `❌ LLM Action failed: ${err.message}`;
    pushActionLog(msg);
    return msg;
  }
}
