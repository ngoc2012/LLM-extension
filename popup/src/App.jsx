// App.jsx
import React, { useState } from 'react';
import './App.css';
import Anthropic from '@anthropic-ai/sdk';

function App() {
  const [apiKey, setApiKey] = useState('sk-ant-api03-uPEHhaBvt0FnRIwmV99DtWFfmu7JUpeaz3boVhEFPE0ckhR71LGccf3AEe5wGTP9JtGtfGFadR6Y8nZh9EwA-Jq8ckwAA');
  const [prompt, setPrompt] = useState("Hello, world");
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setResponse('');

    if (!apiKey) {
      setError('API key is required');
      setLoading(false);
      return;
    }
    if (!prompt) {
      setError('Prompt is required');
      setLoading(false);
      return;
    }

    try {
      // Create a new client instance with the user’s API key, and allow browser usage
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

      // The response content is in result.content
      setResponse(result.content ?? JSON.stringify(result));
    } catch (err) {
      console.error('Error sending to Anthropic:', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h3>Anthropic Prompt Sender (SDK)</h3>

      <div>
        <label>
          API Key:
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
          />
        </label>
      </div>

      <div>
        <label>
          Prompt:
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt here"
          />
        </label>
      </div>

      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>

      {error && (
        <div style={{ color: 'red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="response">
          <h2>Response</h2>
          <pre>{response}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
