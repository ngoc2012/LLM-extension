// usePrompt.js
import { useEffect, useState } from 'react';
import { MAX_LOG_LENGTH } from '../param.js';

export default function usePrompt(step, promptHistory = [], prompt = '') {
  const [promptModel, setPromptModel] = useState('');

  useEffect(() => {
    const historyText = promptHistory.length
      ? promptHistory.map((entry, index) =>
          `Step ${index + 1}:
Action: ${entry.action ? JSON.stringify(entry.action) : 'N/A'}
Reasoning: ${entry.reasoning || 'N/A'}
Logs: ${entry.actionLogs ? entry.actionLogs.slice(-MAX_LOG_LENGTH).join('\n') : 'N/A'}`
        ).join('\n\n')
      : 'No actions taken yet.';

    setPromptModel(
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

Available actions:
tabs: navigate, getAll, create, remove, activate, reload
dom: click, inputText, getText, getHTML, exists, focus, blur, scrollToTop, scrollToBottom, scrollBy, wait, getTitle, getUrl, reload, highlight, queryAll, querySelectorAll, extract, findKeyword, getDOMSummary

Steps: Check the DOM structure (getDOMSummary) and navigate appropriately.

Attention: Result logs limited to ${MAX_LOG_LENGTH} entries.

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

  return promptModel;
}
