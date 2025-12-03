// Simple Ollama client for local Ollama HTTP API.
// Uses the same messages shape as the agents (array of {role, content}).

const OLLAMA_BASE = process.env.OLLAMA_HOST || 'http://localhost:11434';

function mergeMessagesToPrompt(messages) {
  // Fallback: if Ollama instance doesn't accept chat-style messages,
  // merge them into a single prompt preserving roles.
  return messages.map((m) => `(${m.role.toUpperCase()}): ${m.content}`).join('\n\n');
}

export async function invoke(messages, model) {
  const modelName = model || process.env.OLLAMA_MODEL_DEFAULT;
  if (!modelName) throw new Error('No Ollama model specified');

  const url = `${OLLAMA_BASE}/api/generate`;

  // Try to send the chat-style messages; include stream:false to request
  // a non-streaming JSON response when Ollama supports it.
  const body = { model: modelName, messages, stream: false };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Ollama error ${resp.status}: ${txt}`);
  }

  const text = await resp.text();

  // Response can be JSON or plain text depending on Ollama version.
  try {
    const j = JSON.parse(text);
    // Normalize to { content: string }
    if (j.choices && j.choices[0] && j.choices[0].message) {
      return { content: j.choices[0].message.content };
    }
    if (j.text) {
      return { content: j.text };
    }
    // If no recognized structure, return the raw JSON string
    return { content: JSON.stringify(j) };
  } catch (err) {
    // Not JSON — return raw text
    return { content: text };
  }
}

