# documentunderstand

Experimental project: local small OCR + LLM orchestration for data extraction and knowledge interpretation.

This repository is an experiment in building a local pipeline that: 1) extracts text from images/documents using lightweight OCR, 2) orchestrates one or more small, local LLMs to interpret and structure the extracted text, and 3) emits structured data and human-readable interpretations.

Status
- Proof-of-concept / research experiment.
- No production guarantees. The repo currently has no code or manifests; use this README as a guide for next steps and scaffolding.

Goals
- Evaluate feasibility of fully-local document understanding using small OCR engines and locally-run LLMs.
- Create an orchestration layer to combine multiple specialized models (OCR, extractor, reasoner) for better results.
- Produce reproducible, privacy-preserving pipelines that can run offline.

Big-picture architecture (conceptual)
- Input: images, PDFs, screenshots.
- OCR stage: lightweight OCR engines (examples: Tesseract, PaddleOCR, or other small local OCRs) to produce raw text and simple layout metadata.
- Preprocessing: cleaning, layout grouping (blocks/tables), and candidate field detection.
- Orchestration: a coordinator that routes text fragments to one or more local LLMs (small models running via `llama.cpp`, `ggml`, or other local runtime) to extract structured fields, validate, and infer relationships.
- Postprocessing: normalization, confidence scoring, and output serialization (JSON, CSV, or a simple knowledge graph).

Typical developer workflows
- Explore the repo (it's currently minimal). If you add code, keep the following in mind.

- Suggested local setup (Python-focused example):
  - Create and activate a venv (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

  - Install dependencies (if you add a `requirements.txt`):

```powershell
pip install -r requirements.txt
```

- Running experiments (conceptual):
  1. Run OCR to generate text and bounding boxes from input images.
  2. Run an orchestration script that chunks OCR output and sends chunks to local LLMs for extraction.
  3. Collect and merge structured outputs, then run normalization and confidence heuristics.

Project-specific conventions and suggestions
- Keep experiments and runnable scripts under `src/` or `examples/` so they are easy to find.
- Store model weights and large artifacts outside the repo (do not commit binary model files). Use a `models/` ignore rule in `.gitignore`.
- Prefer small reproducible examples (one or two images + a notebook/script) over large end-to-end demos.

Integration points and external dependencies
- OCR engines: Tesseract, PaddleOCR, EasyOCR or other small local OCRs. These are invoked as subprocesses or via Python bindings.
- Local LLM runtimes: `llama.cpp`, `ggml` builds, or other local inference runtimes. Expect to configure model paths and memory/perf options.
- Optional: small vector stores (e.g., SQLite-based) for caching embeddings or intermediate results.

Examples and templates to add (recommended files)
- `README.md` (this file)
- `src/ocr_example.py` — small script that runs OCR on a sample image and prints results.
- `src/orchestrator.py` — minimal coordinator that demonstrates routing text to a local LLM runner.
- `examples/sample-data/` — one or two public-domain sample images for quick tests.
- `requirements.txt` or `pyproject.toml` if using Python.

Contributing
- Keep changes small and focused. For experiments, include a short `NOTES.md` describing model variants and hyperparameters used.
- If you add CI or tests, prefer lightweight checks (linting, small unit tests) that do not require downloading large models.

Privacy and model artifacts
- Do not commit model weights or sensitive documents. Use environment variables or a `models/` directory referenced by `.gitignore`.

Next steps I can do for you
- Scaffold a minimal Python example (scripts, `requirements.txt`, sample image). 
- Add a GitHub Actions CI that runs linting and unit tests (no model downloads).

If you want a scaffold, tell me which language (Python / Node / Go / Rust) and I'll create the minimal files and example run commands.
--
Monorepo notes
- This repository now uses an npm workspace monorepo layout. The primary Node app lives in `packages/orchestrator`.
- To install dependencies for the monorepo, run the workspace bootstrap (root):

```powershell
npm run bootstrap
```

- To start the orchestrator service (from root):

```powershell
npm run start:orchestrator
```

- To run the local OCR example (install dependencies then run from workspace):

```powershell
npm --workspace @doc/orchestrator run start
```


---
*Created: November 26, 2025.*
