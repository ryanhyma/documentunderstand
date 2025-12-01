// Lightweight LLM selector.
// If USE_MOCK=true, use the local mockLLM. Otherwise, use OpenAI via
// the environment variable OPENAI_API_KEY.

const mock = require('./mockLLM');

async function openaiInvoke(messages) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set');

  const body = {
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    messages: messages
  };

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error('OpenAI error: ' + resp.status + ' ' + txt);
  }

  const j = await resp.json();
  const msg = j.choices && j.choices[0] && j.choices[0].message;
  return { content: msg ? msg.content : '' };
}

module.exports = {
  invoke: async (messages) => {
    if (process.env.USE_MOCK && process.env.USE_MOCK.toLowerCase() === 'true') {
      return mock.invoke(messages);
    }
    return openaiInvoke(messages);
  }
};
