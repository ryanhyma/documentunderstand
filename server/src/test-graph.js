import { createMainGraph } from './graphs/MainGraph.js';

// Mock LLM that simulates returning a task list
const mockLlm = {
    invoke: async (messages) => {
        const lastMsg = messages[messages.length - 1].content;
        console.log('LLM received:', lastMsg);

        if (lastMsg.includes('invoice.pdf')) {
            return {
                content: JSON.stringify({
                    tasks: [{ type: 'OCR', input: 'invoice.pdf' }]
                })
            };
        }
        return { content: 'I can help you with documents.' };
    }
};

async function testGraph() {
    try {
        console.log('Initializing Graph...');
        const app = await createMainGraph({ llm: mockLlm });

        console.log("Running Graph with 'Process invoice.pdf'...");
        const result = await app.invoke({ input: 'Process invoice.pdf' });

        console.log('Graph Execution Result:', JSON.stringify(result, null, 2));

    } catch (e) {
        console.error('Error:', e);
    }
}

testGraph();
