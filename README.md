# documentunderstand

Experimental project: local small OCR + LLM orchestration for data extraction and knowledge interpretation.

Current repo state (working layout)
- `web/` — frontend React app scaffolded with Create React App (`npx create-react-app web`). This is a client-side React app.
- `server/` — Node/Express backend containing controllers, services, a tiny graph runner, and sample graphs. Uploads and generated artifacts are stored under `server/data/`.

Status
- Proof-of-concept / research experiment. The repository contains a working CRA frontend and an Express backend scaffold. Expect to iterate on APIs and graphs.

Quick start (run locally)
1) Start the server:

```powershell
cd server
npm install
npm run dev   # requires nodemon if you want auto-reload, otherwise `npm start`
```

2) Start the React frontend (separate shell):

```powershell
cd web
npm install
npm start
```

Development notes
- The frontend (CRA) should be configured with a `proxy` to forward API requests to the backend (default `http://localhost:3000`). If you need, add to `web/package.json`:

```json
  "proxy": "http://localhost:3000"
```

- Backend endpoints (server):
  - `POST /upload` — multipart file upload (field name `file`). Uploaded PDFs are saved to `server/data/pdf/` and the endpoint returns the saved server path.
  - `POST /graphs/run` — execute a named graph defined in `server/graphs/*.json`. Body: `{ graph: 'pdf_to_images', params: { inputPath: '<server-path-to-pdf>' } }`.

- Example graph: `server/graphs/pdf_to_images.json` — converts a PDF into page images using `pdftoppm` (Poppler) and writes images to `server/data/img/<pdfbasename>/`.

Important dependencies and system requirements
- `pdftoppm` (part of Poppler) is required for PDF→image conversion. Install via your OS package manager:
  - macOS: `brew install poppler`
  - Ubuntu/Debian: `sudo apt install poppler-utils`
  - Windows: install Poppler for Windows and add `pdftoppm.exe` to your PATH.

Project conventions
- Server code organization:
  - `server/src/api/` — express controllers (routes) that handle HTTP I/O (`uploadController.js`, `graphController.js`).
  - `server/src/services/` — implementation logic (e.g., `pdfToImageService.js`).
  - `server/src/graphRunner.js` — small graph executor that runs steps defined in JSON.

- Controller naming: use `uploadController.js`, `graphController.js` (or `upload.controller.js`) — either is fine. Consistency matters more than exact style; I recommend `*Controller.js` for clarity in this project.

Data and artifacts
- The server writes runtime artifacts under `server/data/`. Add this directory to `.gitignore` if you don't want to commit outputs.

Next steps and suggestions
- Add a small UI in the CRA app to upload PDFs and call `/graphs/run` (I can add this).
- Add SSE/WebSocket progress updates for long-running graph executions.
- Add a root-level `dev` script (using `concurrently`) to start both server and web with one command.
- Add tests and a minimal CI workflow that runs linting and unit tests (no heavy model downloads).

Contact / Iteration
If you'd like, I can implement any of the Next steps above — tell me which to do next (UI upload + graph flow, progress streaming, concurrent dev script, or CI).

---
*Created: November 26, 2025 (updated).*
