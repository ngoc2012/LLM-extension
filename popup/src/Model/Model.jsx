// Model.jsx
import { useState } from 'react';
import { prompt$, logs$, actionLogs$ } from '../streams.js';
import anthropic from './anthropic.js';
import { llmAction} from './Content/llmAction.js';
import { useFlyd } from '../useFlyd.js';
import usePrompt from './usePrompt.js';
import Toggle from '../Components/Toggle.jsx';


function Model() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [promptHistory, setPromptHistory] = useState([]);
  const [result, setResult] = useState('');
  const prompt = useFlyd(prompt$, () => setStep(0));
  const logs = useFlyd(logs$);

  const promptModel = usePrompt(step, promptHistory, prompt);

  const nextHandler = () => {
    setStep(step + 1);
    setLoading(true);
    anthropic(promptModel).then(async (response) => {
      setLoading(false);
      if (!response) {
        return;
      }

      // Remove any markdown backticks and trim
      const cleanResponse = response.replace(/```json|```/g, '').trim();

      try {
        const action = JSON.parse(cleanResponse).action;
        actionLogs$([]); // Clear action logs for the next step
        await llmAction(action);
        setPromptHistory((prev) => [
          ...prev,
          {...cleanResponse, actionLogs: actionLogs$()}
        ]);
        const resultText = JSON.parse(cleanResponse).result || '';
        if (resultText) {
          setResult(resultText);
        }
      } catch (err) {
        console.error('Failed to parse JSON:', err, cleanResponse);
      }
    });
  };

  function resetHandler() {
    setStep(0);
    setResult('');
    actionLogs$([]);
    logs$([]);
    setPromptHistory([]);
  }

  return (
    <>
      <h3>Model</h3>
      <button onClick={nextHandler}  disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
      <button onClick={resetHandler}>Reset</button>
      {result && <div className='result'>
        <h3>Result</h3>
        <pre>{result}</pre>
        </div>}
      <div className="logs">
        {logs && logs.length > 0
          ? logs.map((log, id) => <p key={id}>{log}</p>)
          : <p>No logs available</p>}
      </div>
      <Toggle
        component={() => (
          <div className="prompt-model">
            <h3>Prompt to Model</h3>
            <pre>{promptModel}</pre>
          </div>
        )}
        label={{ show: "Show Prompt to Model", hide: "Hide Prompt to Model" }}
      />  
    </>
  );
}

export default Model;
