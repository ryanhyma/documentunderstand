# 📘 ARCHITECTURE.md  
## **Hybrid Agent Architecture (Strategy + Parser + Middleware + LangGraph + MCP Tools)**

This document outlines the recommended hybrid agent architecture for building a scalable, deterministic, observable multi-agent system using **LangChain**, **LangGraph**, **MCP (Model Context Protocol)**, and LLM-based agents.

The architecture supports **local execution**, **remote distributed execution**, and **MCP tool exposure**, enabling hybrid multi-agent orchestration.

---

# 🧱 1. Core Components Overview

The system is composed of:

1. **Strategy** → Builds prompts/messages (behavior definition)  
2. **Parser** → Extracts structured results from raw LLM responses  
3. **PureAgent** → Deterministic agent executor (strategy + llm.invoke)  
4. **Middleware** → Moderation, trust layers, observability, retries, parsing  
5. **AgentFactory** → Assembles Strategy + Parser + PureAgent + Middleware  
6. **LangGraph Nodes** → Deterministic orchestration of agent workflows  
7. **MCP Tool Endpoints** → Each agent exposed as a callable tool in the LLM ecosystem  

This enables **hybrid orchestration**, where some agents run locally, some remotely, and some as MCP tools — all seamlessly integrated.

---

# 🧠 2. Strategy (Behavior Builder)

A Strategy defines the agent’s behavior and constructs system/user prompts.

- Owns prompts (inline or via external `.md` files)  
- Produces message arrays for the LLM  
- Deterministic and stateless  

```ts
class SummarizerStrategy {
  buildMessages(state) {
    return [
      { role: "system", content: "Summarize the following text." },
      { role: "user", content: state.input }
    ];
  }
}
```

---

# 🧩 3. Parser (Output Interpreter)

Parsers translate raw LLM output into a clean, structured result shape.

```ts
class SummarizerParser {
  parse(raw) {
    return { summary: raw.trim() };
  }
}
```

Parsers **do not** know about strategies, middleware, or LangGraph.

---

# 🤖 4. PureAgent (Deterministic Executor)

PureAgent composes Strategy + Parser and executes the LLM in a deterministic, isolated manner.

```ts
class PureAgent {
  constructor({ strategy, parser }) {
    this.strategy = strategy;
    this.parser = parser;
  }

  buildMessages(state) {
    return this.strategy.buildMessages(state);
  }

  invoke(messages, llm) {
    return llm.invoke(messages);
  }
}
```

PureAgent has **no side effects** and relies on middleware for operational logic.

---

# 🛠️ 5. Middleware (Cross-Cutting Pipeline)

The Middleware layer standardizes:

- Moderation  
- Trust & safety  
- Logging and tracing  
- Retry logic  
- Parsing  
- Error shaping  

```ts
class AgentMiddleware {
  constructor({ llm, moderation, trustLayer, tracer }) {
    this.llm = llm;
    this.moderation = moderation;
    this.trustLayer = trustLayer;
    this.tracer = tracer;
  }

  async run(agent, state) {
    const messages = agent.buildMessages(state);

    await this.moderation.check(messages);
    const raw = await agent.invoke(messages, this.llm);
    await this.trustLayer.verify(raw);

    return agent.parser.parse(raw);
  }
}
```

Middleware is **fully generic** and reusable across all agents.

---

# 🏭 6. AgentFactory (Local, Remote, or MCP Wiring)

AgentFactory constructs agents and enables hybrid execution modes:

- **local** → Run PureAgent + Middleware in-process  
- **remote** → Call distributed microservices  
- **mcp** → Register agent as an MCP tool  

```ts
function createAgent({ type, mode, llm, middleware }) {
  const strategy = strategyFactory(type);
  const parser = parserFactory(type);

  if (mode === "mcp") return new MCPAgentTool({ strategy, parser });
  if (mode === "remote") return new RemoteAgentProxy({ strategy, parser });

  const agent = new PureAgent({ strategy, parser });
  return { run: (state) => middleware.run(agent, state) };
}
```

---

# 🌐 7. MCP Integration — **Each Agent as an MCP Tool**

Each agent can be exposed as an MCP tool that the LLM can autonomously call.

### Benefits:

- Standardized schemas  
- Auto-discoverable tools  
- Agents callable by LLM, LangGraph, or external clients  
- Cross-language support  
- Distributed execution  

### Example MCP Tool Registration

```ts
const summarizerTool = {
  name: "summarizer",
  description: "Summarizes text concisely",
  input_schema: {
    type: "object",
    properties: { text: { type: "string" } },
    required: ["text"]
  },
  handler: async ({ text }) => {
    const agent = createAgent({ type: "summarizer", mode: "local" });
    return await agent.run({ input: text });
  }
};
```

---

# 🔌 8. MCP + LangGraph Hybrid Orchestration

Example: LangGraph node invoking MCP agent tooling:

```ts
workflow.addNode("researchOrSummarize", async (state, context) => {
  const agent = createAgent({
    type: state.taskType,
    mode: "mcp",
    llm: context.llm,
    middleware: context.middleware
  });

  const result = await agent.run(state);
  return { ...state, result };
});
```

LangGraph handles:

- State transitions  
- Checkpointing  
- Deterministic replay  
- Branch logic  

Agents execute via any supported mode.

---

# 🧬 9. Distributed Agent Architecture

This architecture supports:

### ✔ Local In-Process Agents  
### ✔ Remote Microservice Agents  
### ✔ MCP Tool Agents  
### ✔ Fully Hybrid Mix

All without changing Strategy, Parser, or Middleware.

Only the **execution wrapper** changes — maintaining clean separation.

---

# 📁 10. Recommended Folder Structure

```
src/
  agents/
    pure-agent.js
    remote-agent-proxy.js
    mcp-agent-tool.js
    agent-factory.js
    strategies/
      summarizer/
        prompt.md
        strategy.js
      researcher/
        prompt.md
        strategy.js
    parsers/
      summarizer-parser.js
      researcher-parser.js
  middleware/
    agent-middleware.js
  mcp/
    register-tools.js
  graph/
    workflow.js
  index.js
```

---

# 🏁 Summary

> **Each agent = Strategy + Parser + Middleware pipeline.  
Agents may run locally, remotely, or as MCP tools.  
Strategies build prompts, Parsers shape responses,  
PureAgents remain deterministic, Middleware handles execution,  
LangGraph orchestrates workflows,  
MCP exposes agents to LLMs and external systems.  
This architecture fully supports hybrid, distributed multi-agent systems.**