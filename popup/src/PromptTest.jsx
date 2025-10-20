// App.jsx
import { useEffect, useState } from 'react';
import './App.css';
import { prompt$, apiKey$, tabs$, selectedTabId$ } from './streams.js';
import Voice from './Voice.jsx';
import LLM from './LLM.jsx';
import useConnect from './useConnect.jsx';


function PromptTest() {
  const [prompt, setPrompt] = useState("Hello, world");

  return (
    <div>
      <h3>Prompt Test</h3>
      <div className='prompt-test'>
        {prompt$()}
      </div>
      <div className='prompt-output'></div>
      <button onClick={() => prompt$(prompt)}>Submit</button>
    </div>
  );
}

export default PromptTest;
