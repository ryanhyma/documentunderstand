const { StateGraph, END } = require('@langchain/langgraph');
const { createTaskAgent, createOCRAgent } = require('../agents/AgentFactory');

// Define the state schema
const graphState = {
    messages: {
        value: (x, y) => x.concat(y),
        default: () => []
    },
    input: {
        value: null,
        default: () => ""
    },
    tasks: {
        value: (x, y) => y ? y : x, // Replace tasks
        default: () => []
    },
    results: {
        value: (x, y) => ({ ...x, ...y }),
        default: () => ({})
    }
};

async function createMainGraph({ llm }) {
    const taskAgent = createTaskAgent({ llm });
    const ocrAgent = createOCRAgent({ llm });

    // Node: Task Orchestrator
    async function taskNode(state) {
        console.log("--- Task Orchestrator ---");
        const result = await taskAgent.run({ input: state.input });

        // Assume result.content contains the plan or tasks
        // For now, we'll try to parse tasks from the content if it's structured
        // Or we can assume the TaskParser returns a 'tasks' array if we update it.
        // For this first pass, let's assume the LLM returns a JSON with "tasks"

        let tasks = [];
        if (result.tasks) {
            tasks = result.tasks;
        } else if (typeof result.content === 'string') {
            // Fallback: try to find a list in the text
            // This is a simplification. Ideally TaskParser handles this.
            // If the user said "OCR this file", we create a task.
            if (result.content.toLowerCase().includes("ocr")) {
                tasks.push({ type: 'OCR', input: state.input }); // Pass original input or extracted path
            }
        }

        return {
            messages: [{ role: 'assistant', content: JSON.stringify(result) }],
            tasks: tasks
        };
    }

    // Node: OCR Agent
    async function ocrNode(state) {
        console.log("--- OCR Agent ---");
        const tasks = state.tasks || [];
        const results = {};

        for (const task of tasks) {
            if (task.type === 'OCR') {
                const res = await ocrAgent.run({ input: task.input });
                results[task.input] = res;
            }
        }

        return { results };
    }

    // Conditional Edge
    function shouldContinue(state) {
        const tasks = state.tasks;
        if (tasks && tasks.length > 0) {
            return "ocr";
        }
        return END;
    }

    const workflow = new StateGraph({ channels: graphState })
        .addNode("orchestrator", taskNode)
        .addNode("ocr", ocrNode)
        .addEdge("start", "orchestrator")
        .addConditionalEdges("orchestrator", shouldContinue, {
            ocr: "ocr",
            [END]: END
        })
        .addEdge("ocr", END);

    return workflow.compile();
}

module.exports = { createMainGraph };
