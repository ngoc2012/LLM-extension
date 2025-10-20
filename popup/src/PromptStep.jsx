// App.jsx
import { useState } from 'react';
import { prompt$ } from './streams.js';
import { actionLogs$ } from './streams.js'; // make sure you import this if needed
import { useEffect } from 'react';
import anthropic from './anthropic.js';
import { llmAction} from './content';


function PromptStep() {
  const [step, setStep] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState(prompt$());
  const [promptStep, setPromptStep] = useState();
  const [promptResponse, setPromptResponse] = useState('');
  const [actionLogs, setActionLogs] = useState([]);

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
    anthropic(promptStep).then((response) => {
      setPromptResponse(response || 'No response');
      if (response) {
        const action = JSON.parse(response).action;
        actionLogs$([]); // Clear action logs for the next step
        llmAction(action);
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
["tabs", "getAll", ""] — list all open tabs. (TabId not required)

You will output only the next action to execute, based on what’s currently on the page.
After each action is executed, you will receive the DOM (HTML) or a success message before proposing the next action.

Follow this strict protocol:
1. Think step by step.
2. Propose only the next action.
3. Use valid JSON array syntax, no explanations.
4. Do not jump ahead — each step must be confirmed manually before continuing.

Objective: "${currentPrompt}"

Current action logs at step ${step}:
${actionLogs.length ? actionLogs.join('\n') : 'No action logs yet.'}

Expected output format (JSON):
{
  "action": ["tabs", "navigate", "https://mail.google.com/", "<tabId>"],
  "reasoning": "To access the user's email as per the objective.",
  "speech": "Provide only after completing the objective or if unsure."
}`

    );
  }, [step, currentPrompt, actionLogs]);

  return (
    <div>
      <h3>Prompt Step</h3>
      <pre className="prompt-test">{promptStep}</pre>
      <h3>Prompt Response</h3>
      <div className="prompt-response">{promptResponse}</div>
      <button onClick={nextHandler}>Next</button>
      <button onClick={() => {setStep(0); setPromptResponse(''); setActionLogs([]);}}>Reset</button>
    </div>
  );
}

export default PromptStep;
