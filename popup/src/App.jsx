// App.jsx
import { useEffect, useState } from 'react';
import './App.css';
import Anthropic from '@anthropic-ai/sdk';
import { logs$ } from './streams';
import { pushLog } from './pushLog';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState("Hello, world");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const logsSubscription = logs$.map(logs => {
      setLogs(logs);
    });

    return () => {
      logsSubscription.end(true);
    };
  }, []);

  const handleSend = async () => {
    setLoading(true);

    if (!apiKey) {
      pushLog('API key is required', "ERROR");
      setLoading(false);
      return;
    }
    if (!prompt) {
      pushLog('Prompt is required', "ERROR");
      setLoading(false);
      return;
    }

    try {
      const anthropic = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });

      const result = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 512,
        messages: [
          { role: 'user', content: prompt }
        ],
      });

      pushLog(`Response received: ${result.content || JSON.stringify(result)}`, "INFO");
    } catch (err) {
      pushLog(`Error sending to Anthropic: ${err.message || String(err)}`, "ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h3>LLM Extension</h3>

      <div>
        <span>API Key:</span>
        <textarea
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          rows={4}
          cols={50}
        />
      </div>

      <div>
        <span>Prompt:</span>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your prompt here"
          rows={6}
          cols={50}
        />
      </div>

      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>

      <div className="logs">
        {logs && logs.length > 0
          ? logs.map((log, id) => <p key={id}>{log}</p>)
          : <p>No logs available</p>}
      </div>
    </div>
  );
}

export default App;
