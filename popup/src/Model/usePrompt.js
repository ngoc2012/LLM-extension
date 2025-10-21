// usePrompt.js
import { useEffect } from 'react';
import { MAX_ACTION_LOG_LENGTH } from '../param.js';
import { promptModel$ } from '../streams.js';

// Reasoning: ${entry.reasoning || 'N/A'}
export default function usePrompt(step, promptHistory = [], prompt = '') {
  useEffect(() => {
    const historyText = promptHistory.length
      ? promptHistory.map((entry, index) =>
          `Step ${index + 1}:
Action: ${entry.action ? JSON.stringify(entry.action) : 'N/A'}
Logs: ${entry.actionLogs ? entry.actionLogs.slice(-MAX_ACTION_LOG_LENGTH).join('\n') : 'N/A'}`
        ).join('\n\n')
      : 'No actions taken yet.';

    promptModel$(
`You are a browser automation agent.

Your goal is to achieve the user’s objective step-by-step, one action at a time.
You are connected to a Chrome extension that can execute the following actions:

Example actions:
["tabs", "navigate", <url>, <tabId?>] — open a URL in the given tab.
["dom", "click", <cssSelector>, <tabId?>] — click on a DOM element.
["dom", "inputText", <cssSelector>, <text>, <tabId?>] — type text into an input field.
["dom", "extract", <cssSelector>, <tabId?>] — extract text content from the DOM.
["tabs", "getAll", 0] — list all open tabs.
["tabs", "create", <url>, 0] — create a new tab.
["dom", "getDOMSummary", <cssSelector>, <depth>, <tabId?>] — get a structured summary of the DOM subtree.
["dom", "placeholders", <cssSelector?>, <tabId?>] — get placeholder texts of input elements.

Available actions:
tabs: navigate, getAll, create, remove, activate, reload
dom: click, inputText, getText, getHTML, exists, focus, blur, scrollToTop, scrollToBottom,
scrollBy, wait, getTitle, getUrl, reload, highlight, queryAll, querySelectorAll, extract,
findKeyword, getDOMSummary, placeholders

Steps:
1- Always check tabs list before navigating.
2- When navigating, prefer existing tabs.
3- After navigation, before scrolling, search for input fields first (show placeholders with placeholders command).

To find a search input field, look for an <input> element that:
- has type="text" or type="search"
- or has id, name, or placeholder containing keywords: "search", "query", "find"
- or is inside a form intended for search
If multiple candidates exist, choose the first visible one.

4- Use DOM actions to interact with the page as needed.
5- Use getDOMSummary to understand complex page structures.
6- Limit DOM queries to specific selectors to avoid overload.
7- Always provide reasoning for each action.
8- If unsure about the next step, gather more information from the page.



Attention: Result logs limited to ${MAX_ACTION_LOG_LENGTH} characters.

Output constraints:
Output only the next action as a single JSON object, plain text.
Do not include markdown, code fences, explanations, reasoning, or speech.

Objective: "${prompt}"

Expected output format:
{
  "action": ["tabs", "navigate", "https://mail.google.com/", "<tabId>"],
  "reasoning": "To access the user's email as per the objective.",
  "speech": "Provide only after completing the objective or if unsure.",
  "result": "Final result after completing the objective."
}

History of actions taken so far:
${historyText}`
    );
  }, [step, prompt, promptHistory]);

}
