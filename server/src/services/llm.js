// Lightweight LLM selector.
// Supports: mock (USE_MOCK=true), Ollama (USE_OLLAMA=true) and OpenAI (OPENAI_API_KEY).

import mock from './mockLLM.js';
import * as ollama from './ollamaLLM.js';

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

function getOllamaModelForType(type) {
  // Map agent types to Ollama model names; can be overridden with env vars
  if (type === 'TASK') return process.env.OLLAMA_MODEL_TASK || 'huihui_ai/orchestrator-abliterated:latest';
  if (type === 'OCR') return process.env.OLLAMA_MODEL_OCR || 'qwen2.5vl:latest';
  return process.env.OLLAMA_MODEL_DEFAULT || null;
}

export function getLLMForAgent(type) {
  // Returns an object with an `invoke(messages)` method tailored for the agent type
  if (process.env.USE_MOCK && process.env.USE_MOCK.toLowerCase() === 'true') {
    return mock;
  }

  if (process.env.USE_OLLAMA && process.env.USE_OLLAMA.toLowerCase() === 'true') {
    const model = getOllamaModelForType(type);
    return {
      invoke: async (messages) => ollama.invoke(messages, model)
    };
  }

  // Default to OpenAI
  return { invoke: openaiInvoke };
}

// Backwards-compatible default export: invoke with OpenAI or mock depending on env
const defaultExport = {
  getLLMForAgent,
  invoke: async (messages) => {
    if (process.env.USE_MOCK && process.env.USE_MOCK.toLowerCase() === 'true') {
      return mock.invoke(messages);
    }
    if (process.env.USE_OLLAMA && process.env.USE_OLLAMA.toLowerCase() === 'true') {
      const model = process.env.OLLAMA_MODEL_DEFAULT || null;
      return ollama.invoke(messages, model);
    }
    return openaiInvoke(messages);
  }
};

export default defaultExport;
