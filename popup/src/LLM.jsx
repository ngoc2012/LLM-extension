// App.jsx
import { useState } from 'react';
import './App.css';
import Anthropic from '@anthropic-ai/sdk';
import { prompt$, apiKey$ } from './streams';
import { pushLog } from './pushLog';


function LLM() {
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);

    if (!apiKey$()) {
      pushLog('API key is required', "ERROR");
      setLoading(false);
      return;
    }
    if (!prompt$()) {
      pushLog('Prompt is required', "ERROR");
      setLoading(false);
      return;
    }

    try {
      const anthropic = new Anthropic({
        apiKey: apiKey$(),
        dangerouslyAllowBrowser: true,
      });

      const result = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt$() }],
      });

      pushLog(
        `Response received: ${result.content?.[0]?.text || JSON.stringify(result)}`,
        'INFO'
      );
    } catch (err) {
      pushLog(`Error sending to Anthropic: ${err.message || String(err)}`, "ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleSend} disabled={loading}>
      {loading ? 'Sending...' : 'Send'}
    </button>
  );
}

export default LLM;
