// anthropic.js
import Anthropic from '@anthropic-ai/sdk';
import { apiKey$ } from '../streams';
import { pushLog } from '../pushLog';


async function anthropic(prompt) {
  
  if (!apiKey$()) {
    pushLog('API key is required', "ERROR");
    return;
  }
  if (!prompt) {
    pushLog('Prompt is required', "ERROR");
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
      messages: [{ role: 'user', content: prompt }],
    });
    pushLog(
      `Response received: ${result.content?.[0]?.text || JSON.stringify(result)}`,
      'INFO'
    );
    return result.content?.[0]?.text || null;
  } catch (err) {
    pushLog(`Error sending to Anthropic: ${err.message || String(err)}`, "ERROR");
    return null;
  }
};

export default anthropic;
