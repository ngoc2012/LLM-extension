// App.jsx
import { useState } from 'react';
import { prompt$ } from './streams.js';
import { actionLogs$ } from './streams.js'; // make sure you import this if needed
import { useEffect } from 'react';
import anthropic from './anthropic.js';
import { llmAction} from './content';
import { MAX_LOG_LENGTH } from './const.js';


function PromptStep() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(prompt$());
  const [promptStep, setPromptStep] = useState();
  const [promptResponse, setPromptResponse] = useState('');
  const [actionLogs, setActionLogs] = useState([]);
  const [lastAction, setLastAction] = useState(null);
  const [result, setResult] = useState('');

  useEffect(() => {
    const promptSubscription = prompt$.map((prompt) => {
      setStep(0); // Reset step to 0 when prompt changes
      setCurrentPrompt(prompt);
    });
    const actionLogsSubscription = actionLogs$.map((logs) => {
      setActionLogs(logs);
    });
    return () => {
      promptSubscription.end(true);
      actionLogsSubscription.end(true);
    };
  }, []);

  const nextHandler = () => {
    setStep(step + 1);
    setLoading(true);
    anthropic(promptStep).then(async (response) => {
      setLoading(false);
      if (!response) {
        setPromptResponse('No response');
        return;
      }

      // Remove any markdown backticks and trim
      const cleanResponse = response.replace(/```json|```/g, '').trim();

      setPromptResponse(cleanResponse);

      try {
        const action = JSON.parse(cleanResponse).action;
        actionLogs$([]); // Clear action logs for the next step
        await llmAction(action);
        setLastAction(action);
        const resultText = JSON.parse(cleanResponse).result || '';
        if (resultText) {
          setResult(resultText);
        }
      } catch (err) {
        console.error('Failed to parse JSON:', err, cleanResponse);
      }
    });
  };

  useEffect(() => {

    setPromptStep(

`You are a browser automation agent.

Your goal is to achieve the user’s objective step-by-step, one action at a time.
You are connected to a Chrome extension that can execute the following actions:

Example actions:
["tabs", "navigate", <url>, <tabId?>] — open a URL in the given tab.
["dom", "click", <cssSelector>, <tabId?>] — click on a DOM element.
["dom", "inputText", <cssSelector>, <text>, <tabId?>] — type text into an input field.
["dom", "extract", <cssSelector>, <tabId?>] — extract text content from the DOM.
["tabs", "getAll", 0] — list all open tabs. (TabId not required)
["tabs", "create", <url>, 0] — create a new tab with the given URL. (TabId not required)
["dom", "getDOMSummary", <cssSelector>, <depth>, <tabId?>] — get a structured summary of the DOM subtree.


List of available actions you can use:
tabs: navigate, getAll, create, remove, activate, reload
dom: click, inputText, getText, getHTML, exists, focus, blur, scrollToTop, scrollToBottom, scrollBy, wait, getTitle, getUrl, reload, highlight, queryAll, querySelectorAll, extract, findKeyword, getDOMSummary

Steps: Need to check the dom structure (getDOMSummary) by navigating to the appropriate element and go deeper.

Attention: Result logs limited to ${MAX_LOG_LENGTH} entries.

Output constraints:
Output **only the next action**.
Output only a single JSON object as plain text.
Do not include markdown, code fences, explanations, reasoning, or speech. 
Do not output anything else.


Objective: "${currentPrompt}"

Expected output format:
{
  "action": ["tabs", "navigate", "https://mail.google.com/", "<tabId>"],
  "reasoning": "To access the user's email as per the objective.",
  "speech": "Provide only after completing the objective or if unsure.",
  "result": "Final result after completing the objective."
}

${actionLogs.length ? `Last action: ${lastAction ? JSON.stringify(lastAction) : 'None'}
\nLast action logs at step ${step}:\n${actionLogs.slice(-MAX_LOG_LENGTH).join('\n')}` : ''}  
`

    );
  }, [step, currentPrompt, actionLogs]);

  return (
    <div>
      <h3>Prompt Step</h3>
      <pre className="prompt-test">{promptStep}</pre>
      <h3>Prompt Response</h3>
      <div className="prompt-response">{promptResponse}</div>
      <button onClick={nextHandler}  disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
      <button onClick={() => {setStep(0); setPromptResponse(''); setActionLogs([]);}}>Reset</button>
      <h3>Result</h3>
      <div className='result'>{result}</div>
    </div>
  );
}

export default PromptStep;
