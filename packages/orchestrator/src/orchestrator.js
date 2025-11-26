const express = require('express');
const Tesseract = require('tesseract.js');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send({ status: 'orchestrator', ok: true });
});

// Simple OCR endpoint: accepts JSON { image: '<url|path|base64>' }
app.post('/ocr', async (req, res) => {
  const { image } = req.body || {};
  if (!image) return res.status(400).send({ error: 'image required' });

  try {
    const worker = Tesseract.createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data } = await worker.recognize(image);
    await worker.terminate();
    res.send({ text: data.text, blocks: data.blocks });
  } catch (err) {
    res.status(500).send({ error: String(err) });
  }
});

// Placeholder extraction endpoint: orchestrate calls to local LLMs (LangGraph)
app.post('/extract', async (req, res) => {
  const { text } = req.body || {};
  if (!text) return res.status(400).send({ error: 'text required' });

  // TODO: call langgraph orchestration here. Return a sample structure.
  // This keeps the scaffold runnable without model downloads.
  const sample = {
    fields: [
      { name: 'sample_field', value: text.slice(0, 120) }
    ],
    confidence: 0.5
  };

  res.send(sample);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Orchestrator running on http://localhost:${PORT}`);
});
