// usePrompt.js
import { useEffect } from 'react';
import { MAX_ACTION_LOG_LENGTH } from '../param.js';
import { promptModel$ } from '../streams.js';
import defaultPrompt from "../defaultPrompt.txt?raw";

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

    promptModel$(defaultPrompt + 
`Attention: Result logs limited to ${MAX_ACTION_LOG_LENGTH} characters.
Objective: "${prompt}"

History of actions taken so far:
${historyText}`
    );
  }, [step, prompt, promptHistory]);

}
