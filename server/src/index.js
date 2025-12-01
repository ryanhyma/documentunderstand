const express = require('express');
const path = require('path');
const fs = require('fs');
const { runGraph } = require('./services/graphRunner');
const uploadController = require('./api/uploadController');
const graphController = require('./api/graphController');

const app = express();
app.use(express.json());

const dataDir = path.resolve(__dirname, '..', 'data');
const pdfDir = path.join(dataDir, 'pdf');
fs.mkdirSync(pdfDir, { recursive: true });

app.get('/', (req, res) => res.send({ ok: true, service: 'documentunderstand-server' }));

// Register API controllers
app.use('/upload', uploadController);
app.use('/graphs', graphController);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
