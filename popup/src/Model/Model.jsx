// Model.jsx
import { useEffect, useState } from 'react';
import { prompt$, logs$, actionLogs$, promptModel$ } from '../streams.js';
import anthropic from './anthropic.js';
import { llmAction} from './Content/llmAction.js';
import { useFlyd } from '../useFlyd.js';
import usePrompt from './usePrompt.js';
import extractJSON from './extractJSON.js';
import { LLM_REQUEST_DELAY, LLM_MAX_STEPS } from '../param.js';
import { use } from 'react';


function Model() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [promptHistory, setPromptHistory] = useState([]);
  const [result, setResult] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [running, setRunning] = useState(false);
  const prompt = useFlyd(prompt$, () => setStep(0));
  const promptModel = useFlyd(promptModel$);

  usePrompt(step, promptHistory, prompt);
  
  const nextHandler = () => {
    setLoading(true);
    anthropic(promptModel).then(async (response) => {
      setLoading(false);
      if (!response) {
        return;
      }
      setStep(step + 1);
      const extracted = extractJSON(response);
      if (!extracted) return;
      const action = extracted?.action;
      actionLogs$([]); // Clear action logs for the next step
      await llmAction(action);
      setPromptHistory((prev) => [
        ...prev,
        {...extracted, actionLogs: actionLogs$()}
      ]);
      const resultText = extracted?.result || '';
      if (resultText) {
        setResult(resultText);
        setRunning(false);
      }
      const reasoningText = extracted?.reasoning || '';
      if (reasoningText) {
        setReasoning(reasoningText);
      }
      if (extracted?.speech) {
        console.log('Speaking:', extracted.speech);
        speechSynthesis.cancel();
        speechSynthesis.speak(new SpeechSynthesisUtterance(extracted.speech));
      }
    });
  };

  useEffect(() => {
    let timeout;
    if (running && step < LLM_MAX_STEPS && !loading) {
      timeout = setTimeout(() => {
        nextHandler();
      }, LLM_REQUEST_DELAY);
    }
    return () => clearTimeout(timeout);
  }, [step, loading, running]);

  useEffect(() => {
    if (step >= LLM_MAX_STEPS) {
      setRunning(false);
    }
  }, [step]);

  function resetHandler() {
    setStep(0);
    setResult('');
    actionLogs$([]);
    logs$([]);
    setPromptHistory([]);
    setReasoning('');
  }

  return (
    <>
      <h3>Model</h3>
      <button onClick={nextHandler}  disabled={loading || running}>
        {loading ? 'Sending...' : step > 0 ? (running ? 'Waiting...' : 'Next') : 'Send'}
      </button>
      <button onClick={() => setRunning(true)} disabled={running || step >= LLM_MAX_STEPS}>
        Start Auto
      </button>
      <button onClick={() => setRunning(false)} disabled={!running}>
        Stop Auto
      </button>
      <button onClick={resetHandler}>Reset</button>
      {reasoning && <div className='reasoning'>
        <h3>Model reasoning on step {step}</h3>
        <div>{reasoning}</div>
      </div>}
      {result && <div className='result'>
        <h3>Final Result</h3>
        <div>{result}</div>
      </div>}
    </>
  );
}

export default Model;
