# 📘 AGENTARCHITECTURE.md
## **Hybrid Agent Architecture (Strategy + Parser + Middleware + LangGraph)**

This document outlines the recommended hybrid agent architecture for building a scalable, deterministic, observable multi-agent system using **LangChain**, **LangGraph**, and **LLM-based agents**.

The architecture keeps agents **pure and deterministic**, while centralizing cross-cutting concerns (moderation, trust layers, observability, retries, error shaping) inside a **generic middleware layer**.

---

# 🧱 1. Core Components Overview

The system is composed of five major parts:

1. **Strategy** → Builds messages (behavior constructor)
2. **Parser** → Extracts structured output from raw LLM response
3. **PureAgent** → Deterministic agent executor (strategy + llm)
4. **Middleware** → Shared pipeline (moderation, observability, parsing, trust)
5. **AgentFactory** → Assembles Strategy + Parser + PureAgent + Middleware
6. **LangGraph Nodes** → Deterministic state transitions calling agent.run()

This separation creates a clean, extensible architecture that scales well as you add agents, tools, and workflows.

---

# 🧠 2. Strategy (Behavior Builder)

A **Strategy** contains the behavior of the agent — it constructs system/user messages but does *not* execute LLM calls or parse output.

### Responsibilities:
- Build messages
- Encode agent-specific instructions

### Not Responsible For:
- Moderation
- Parsing
- Validation
- Trust & safety
- Observability
- Invoking LLMs

```ts
class SummarizerStrategy {
  constructor() {
    // Strategies are the ONLY place where prompts are loaded
    this.systemPrompt = require('../../prompts/summarizer-system.txt');
  }

  buildMessages(state) {
    return [
      { role: "system", content: this.systemPrompt },
      { role: "user", content: state.input }
    ];
  }
}
```

### Prompts Management:
- All prompts reside in a dedicated `src/prompts/` folder.
- **Strategies** are the **ONLY** component allowed to load these prompt files.
- This ensures a single source of truth for agent personas and instructions.

---

# 🧩 3. Parser (Output Interpreter)

Each agent defines a **Parser** that translates raw LLM output into structured results.

### Responsibilities:
- Interpret output
- Extract fields
- Normalize agent-specific formats

```ts
class SummarizerParser {
  parse(raw) {
    return { summary: raw.trim() };
  }
}
```

Strategies and Parsers remain **fully separate** to keep concerns clean.

---

# 🤖 4. PureAgent (Deterministic LLM Executor)

The **PureAgent** composes Strategy + Parser and performs the minimal possible execution work:

### Responsibilities:
- Build messages through strategy
- Call `llm.invoke()`
- Expose parser for middleware

### Not Responsible For:
- Moderation
- Error shaping
- Logging
- Observability
- Retry logic
- Trust layers

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

PureAgent remains simple and deterministic — crucial for LangGraph.

---

# 🛠️ 5. Middleware (Shared Execution Pipeline)

The **Middleware** handles *all cross-cutting concerns* and provides a uniform execution pipeline for every agent.

### Responsibilities:
- Moderation
- Trust & safety layers
- Observability / tracing
- Retries & backoff
- Logging
- Error shaping
- Applying Parsing

Middleware calls the agent’s parser **generically**:

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

This keeps middleware fully generic across all agents.

---

# 🏭 6. AgentFactory (Assemble Strategy + Parser + Agent)

The **factory** chooses the correct Strategy + Parser and assembles a PureAgent wrapped in Middleware.

```ts
function createAgent({ type, llm, middleware }) {
  const strategy = strategyFactory(type);
  const parser = parserFactory(type);

  const agent = new PureAgent({ strategy, parser });

  return {
    run: (state) => middleware.run(agent, state)
  };
}
```

The factory is the single place where components come together.

---

# 🌐 7. LangGraph Integration

LangGraph nodes remain **pure, deterministic functions** that call an assembled agent:

```ts
workflow.addNode("agentNode", async (state, context) => {
  const agent = createAgent({
    type: state.taskType,
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
- Branching
- Replayability
- Node-level tracing

Your middleware handles:
- moderation
- observability
- trust layers
- parsing
- retries

---

# 🎯 8. Why Strategy + Parser Should Remain Separate

Keeping them separate ensures:

### ✔ Clear Separation of Concerns
- Strategy = Behavior
- Parser = Output format

### ✔ Avoids “god-class” anti-pattern
### ✔ Makes output formats flexible
### ✔ Allows shared parsers for multiple strategies
### ✔ Supports centralized observability and trust logic
### ✔ Keeps deterministic execution for LangGraph
### ✔ Enables easier unit testing

---

# 📁 9. Recommended Folder Structure

```
src/
  agents/
    pure-agent.js
    agent-factory.js
    strategies/
      task-strategy.js
      ocr-strategy.js
    parsers/
      task-parser.js
      ocr-parser.js
  prompts/
    task-system.txt
    ocr-system.txt
  middleware/
    agent-middleware.js
  graph/
    workflow.js
  index.js
```

---

# 🏁 Summary

> **Strategy builds messages.  
Parser interprets agent output.  
PureAgent executes deterministically.  
Middleware applies cross-cutting logic and calls parser.  
AgentFactory assembles everything.  
LangGraph nodes stay pure and simple.**