# TODO — Next Integration Options

This file lists short, actionable options to advance the PDF → Agent → OCR integration. Pick one to implement next.

A) Implement end-to-end OCR executor
- What: Add a service or graph step that runs OCR on images produced by `pdfToImageService` (e.g., Tesseract or a JS binding), collect text per page, and attach results to the graph output.
- Why: Provides real extracted text (not just LLM-simulated), enabling downstream tasks like entity extraction and search.
- Rough tasks:
  - Add `server/src/services/ocrService.js` to run `tesseract` or an npm OCR library.
  - Extend `server/src/services/graphRunner.js` to support a `pdfToText`/`runOCR` step that consumes images and produces text.
  - Update `server/graphs/pdf_to_text.json` to sequence `pdfToImages` → `runOCR`.
- Pros: Real OCR, deterministic results. Cons: Requires native tool (Tesseract) or heavy JS libs; longer runtime.

B) Replace mock LLM with a real provider
- What: Swap `mockLLM` with an actual LLM integration (OpenAI, Anthropic, or a local LLM wrapper) and wire credentials/config.
- Why: Produces realistic task planning and richer responses from agents.
- Rough tasks:
  - Add `server/src/services/llm/*` implementation and config via env vars.
  - Update `AgentFactory` or `agentController` to inject the real LLM.
  - Add tests/mocks to avoid incurring API costs during dev.
- Pros: Better agent behavior. Cons: Costs, requires API keys or local model infra.

C) Convert synchronous agent runs to async jobs with status updates
- What: Offload long-running graph/ocr execution to a background job (e.g., simple in-memory queue or Redis + Bull), return a job id from the API, and provide endpoints or websocket events for status and results.
- Why: Avoids blocking HTTP requests for long OCR runs and improves UX for large PDFs.
- Rough tasks:
  - Add a job runner service and persistence for job states (queued/running/done/failed).
  - Change `POST /agents/run-main` to return `{ jobId }` instead of waiting.
  - Add `/jobs/:id` or websocket events so the frontend can poll/subscribe and update the TaskList when complete.
- Pros: Scalable and responsive UI. Cons: More infra complexity (queue, persistence, background worker).

Recommended next step
- For immediate value and end-to-end testing: implement option A (OCR executor) first so the UI + agents produce real extracted text. After that, convert to option C (async jobs) if OCR runs are slow or heavy.

Notes
- These options are orthogonal and can be combined (A → B → C) in any order. If you want, I can implement option A next and provide the patches and tests.
