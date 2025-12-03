import PureAgent from './PureAgent.js';
import TaskStrategy from './strategies/TaskStrategy.js';
import OCRStrategy from './strategies/OCRStrategy.js';
import TaskParser from './parsers/TaskParser.js';
import OCRParser from './parsers/OCRParser.js';
import AgentMiddleware from '../middleware/AgentMiddleware.js';
import { getLLMForAgent } from '../services/llm.js';

const STRATEGIES = {
    'TASK': TaskStrategy,
    'OCR': OCRStrategy
};

const PARSERS = {
    'TASK': TaskParser,
    'OCR': OCRParser
};

function createAgent({ type, llm }) {
    const StrategyClass = STRATEGIES[type];
    const ParserClass = PARSERS[type];

    if (!StrategyClass || !ParserClass) {
        throw new Error(`Unknown agent type: ${type}`);
    }

    const strategy = new StrategyClass();
    const parser = new ParserClass();
    const agent = new PureAgent({ strategy, parser });

    // If an explicit `llm` was passed, use it. Otherwise obtain an LLM
    // tailored for this agent type (e.g., Ollama orchestrator or OCR model).
    const llmToUse = llm || getLLMForAgent(type);

    // Middleware wraps the agent execution
    const middleware = new AgentMiddleware({ llm: llmToUse });

    return {
        run: (state) => middleware.run(agent, state)
    };
}

function createTaskAgent({ llm } = {}) {
    return createAgent({ type: 'TASK', llm });
}

function createOCRAgent({ llm } = {}) {
    return createAgent({ type: 'OCR', llm });
}

export { createAgent, createTaskAgent, createOCRAgent };
