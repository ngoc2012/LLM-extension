import { pushActionLog } from "../../pushLog";

/**
 * Run arbitrary DOM actions inside a tab’s main world.
 *
 * @param {Array<any>} actionArray - e.g. ['click', '#submit']
 * @param {number} tabId - ID of the tab
 */
export function domAction(actionArray, tabId) {
  return new Promise((resolve, reject) => {
    pushActionLog(`domAction(${actionArray.join(", ")}) in tab ${tabId}`);

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
            querySelectorAll: (sel) => {
              const els = document.querySelectorAll(sel);
              return Array.from(els).map(e => ({
                tag: e.tagName.toLowerCase(),
                text: e.innerText.trim(),
                html: e.outerHTML,
              }));
            },
            extract: async (sel) => {
              const els = Array.from(document.querySelectorAll(sel));
              return els.map(e => e.innerText.trim()).filter(Boolean);
            },
            findKeyword: (keyword) => {
              if (!keyword) return "No keyword provided";
              const text = document.body.innerText || "";
              const count = (text.match(new RegExp(keyword, "gi")) || []).length;
              return count > 0
                ? `Found "${keyword}" ${count} time(s) in page body`
                : `Keyword "${keyword}" not found`;
            },
            getDOMSummary: (sel, max_depth) => {
              const el = document.querySelector(sel);
              if (!el) return `Element ${sel} not found`;

              function summarize(node, max_depth, depth = 0) {
                if (!node.tagName) return "";
                if (depth > max_depth) return ""; // avoid deep recursion
                
                const tag = node.tagName.toLowerCase();
                if (tag === "script" || tag === "iframe" || tag === "style") return ""; // skip scripts, iframes, styles

                const attrs = Array.from(node.attributes || [])
                  .map(a => `${a.name}="${a.value}"`)
                  .join(" ");

                const children = Array.from(node.children)
                  .map(c => summarize(c, max_depth, depth + 1))
                  .filter(Boolean)
                  .join("\n");

                return `${"  ".repeat(depth)}<${node.tagName.toLowerCase()}${attrs ? " " + attrs : ""}>${
                  children ? "\n" + children + "\n" + "  ".repeat(depth) : ""
                }</${node.tagName.toLowerCase()}>`;
              }

              return summarize(el, max_depth);
            },
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
        resolve(result);
      }
    );
  });
}