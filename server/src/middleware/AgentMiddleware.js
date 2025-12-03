class AgentMiddleware {
    constructor({ llm }) {
        this.llm = llm;
    }

    async run(agent, state) {
        const messages = agent.buildMessages(state);

        // Future: Add moderation check here
        // await this.moderation.check(messages);

        const raw = await agent.invoke(messages, this.llm);

        // Future: Add trust layer verification here
        // await this.trustLayer.verify(raw);

        return agent.parser.parse(raw);
    }
}

export default AgentMiddleware;
