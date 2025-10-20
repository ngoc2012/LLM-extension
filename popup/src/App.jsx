// App.jsx
import { useEffect, useState } from 'react';
import './App.css';
import { logs$, prompt$, apiKey$, tabs$, selectedTabId$ } from './streams';
import Voice from './Voice.jsx';
import LLM from './LLM.jsx';
import useConnect from './useConnect.jsx';
import ActionTest from './ActionTest.jsx';


function App() {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState("Hello, world");
  const [logs, setLogs] = useState([]);
  const [tabs, setTabs] = useState([]);

  useConnect();
  
  useEffect(() => {
    const logsSubscription = logs$.map((logs) => {
      setLogs(logs);
    });
    const promptSubscription = prompt$.map((prompt) => {
      setPrompt(prompt);
    });
    const apiKeySubscription = apiKey$.map((apiKey) => {
      setApiKey(apiKey);
    });
    const tabsSubscription = tabs$.map((tabs) => {
      setTabs(tabs);
    });
    return () => {
      logsSubscription.end(true);
      promptSubscription.end(true);
      apiKeySubscription.end(true);
      tabsSubscription.end(true);
    };
  }, []);

  return (
    <div className="App">
      <h2>LLM Extension</h2>

      <div>
        <h3>API Key</h3>
        <textarea
          value={apiKey}
          onChange={(e) => apiKey$(e.target.value)}
          placeholder="Enter your API key"
          rows={3}
        />
      </div>

      <div>
        <h3>Prompt</h3>
        <textarea
          value={prompt}
          onChange={(e) => prompt$(e.target.value)}
          placeholder="Type or speak your prompt"
          rows={5}
        />
      </div>

      <div>
        <h3>Open Tabs</h3>
        <select onChange={(e) => {selectedTabId$(parseInt(e.target.value))}}>
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.title + '|' + tab.id + '|' + tab.url.slice(0, 30)}
            </option>
          ))}
        </select>
      </div>
      

      <div style={{ margin: '1rem 0' }}>
        <Voice />
        <LLM />
      </div>

      <ActionTest />

      <div className="logs">
        {logs && logs.length > 0
          ? logs.map((log, id) => <p key={id}>{log}</p>)
          : <p>No logs available</p>}
      </div>
    </div>
  );
}

export default App;
