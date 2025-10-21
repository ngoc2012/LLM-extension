// ActionTest.jsx
import { useState } from 'react';
import { pushLog } from '../pushLog';
import { tabs$ } from '../streams';
import { llmAction} from '../Model/Content/llmAction';
import useConnect from './useConnect';
import { useFlyd } from '../useFlyd';

function ActionTest() {
  const tabs = useFlyd(tabs$);
  const [selectedTabId, setSelectedTabId] = useState(null);

  useConnect();

  return (
    <div>
      <h3>Open Tabs</h3>
      <select onChange={(e) => {setSelectedTabId(e.target.value)}} >
        {tabs.map((tab) => (
          <option key={tab.id} value={tab.id}>
            {tab.title + '|' + tab.id + '|' + tab.url.slice(0, 30)}
          </option>
        ))}
      </select>
      <h3>Action Test</h3>
      <button onClick={() => llmAction(['tabs', 'navigate', 'https://www.gmail.com', selectedTabId])}>
        Navigate
      </button>
      <button onClick={() => llmAction(["tabs", "navigate", "https://mail.google.com/mail/u/0/#search/newer_than:7d", selectedTabId])}>
        Click
      </button>
      <button onClick={() => llmAction(['dom', 'inputText', '#gs_lc50 > input:nth-child(1)', 'ngrok', selectedTabId])}>
        Input Text
      </button>
      <button onClick={async () => {
        const tabs = await llmAction(['tabs', 'getAll', '']);
        pushLog(`Tabs Info: ${JSON.stringify(tabs)}`);
      }}>
        Get Tabs Info
      </button>
      <button onClick={() =>
        llmAction(['tabs', 'create', 'https://www.gmail.com', ''])
      }>
        Create Tab
      </button>
    </div>
  );
}

export default ActionTest;
