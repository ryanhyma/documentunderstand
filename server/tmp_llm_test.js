// Quick smoke test for LLM factory (non-network).
try {
  const { default: llm, getLLMForAgent } = await import('./src/services/llm.js');
  const client = getLLMForAgent('TASK');
  console.log('client.invoke =', typeof client.invoke);
  console.log('client keys =', Object.keys(client));
} catch (err) {
  console.error('Error loading LLM factory:', err.message);
  process.exitCode = 2;
}
