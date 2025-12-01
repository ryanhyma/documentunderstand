const PureAgent = require('./PureAgent');
const TaskStrategy = require('./strategies/TaskStrategy');
const OCRStrategy = require('./strategies/OCRStrategy');
const TaskParser = require('./parsers/TaskParser');
const OCRParser = require('./parsers/OCRParser');
const AgentMiddleware = require('../middleware/AgentMiddleware');

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
    const PureAgent = require('./PureAgent');
    const TaskStrategy = require('./strategies/TaskStrategy');
    const OCRStrategy = require('./strategies/OCRStrategy');
    const TaskParser = require('./parsers/TaskParser');
    const OCRParser = require('./parsers/OCRParser');
    const AgentMiddleware = require('../middleware/AgentMiddleware');

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

        // Middleware wraps the agent execution
        const middleware = new AgentMiddleware({ llm });

        return {
            run: (state) => middleware.run(agent, state)
        };
    }

    function createTaskAgent({ llm }) {
        return createAgent({ type: 'TASK', llm });
    }

    function createOCRAgent({ llm }) {
        return createAgent({ type: 'OCR', llm });
    }

    module.exports = { createAgent, createTaskAgent, createOCRAgent };
