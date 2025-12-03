import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { runGraph } from './services/graphRunner.js';
import uploadController from './api/uploadController.js';
import graphController from './api/graphController.js';
import agentController from './api/agentController.js';

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..', 'data');
const pdfDir = path.join(dataDir, 'pdf');
fs.mkdirSync(pdfDir, { recursive: true });

app.get('/', (req, res) => res.send({ ok: true, service: 'documentunderstand-server' }));

// Register API controllers
app.use('/upload', uploadController);
app.use('/graphs', graphController);
app.use('/agents', agentController);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
