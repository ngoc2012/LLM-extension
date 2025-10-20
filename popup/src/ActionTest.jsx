// App.jsx
import { useEffect, useState } from 'react';
import './App.css';
import { pushLog } from './pushLog';
import { prompt$, selectedTabId$ } from './streams';
import { llmAction} from './content';

function ActionTest() {

  return (
    <div>
      <h3>Action Test</h3>
      <button onClick={() => llmAction(['tabs', 'navigate', 'https://www.gmail.com', selectedTabId$()])}>
        Navigate
      </button>
      <button onClick={() => llmAction(['dom', 'click', 'div.T-I.T-I-KE.L3'], selectedTabId$())}>
        Click
      </button>
      <button onClick={() => llmAction(['dom', 'inputText', '#gs_lc50 > input:nth-child(1)', 'ngrok'], selectedTabId$())}>
        Input Text
      </button>
      <button onClick={async () => {
        const tabs = await llmAction(['tabs', 'getAll']);
        pushLog(`Tabs Info: ${JSON.stringify(tabs)}`);
      }}>
        Get Tabs Info
      </button>
    </div>
  );
}

export default ActionTest;
