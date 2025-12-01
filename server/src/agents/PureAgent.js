class PureAgent {
    constructor({ strategy, parser }) {
        this.strategy = strategy;
        this.parser = parser;
    }

    buildMessages(state) {
        return this.strategy.buildMessages(state);
    }

    async invoke(messages, llm) {
        return llm.invoke(messages);
    }
}

module.exports = PureAgent;
