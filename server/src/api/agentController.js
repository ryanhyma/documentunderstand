// Controller to run the main agent graph with a mock LLM
const express = require('express');
const path = require('path');
const { createMainGraph } = require('../graphs/MainGraph');
const llm = require('../services/llm');

const router = express.Router();

// POST /run-main
// body: { input: '<uploaded pdf path or filename>' }
router.post('/run-main', async (req, res) => {
    const { input } = req.body || {};
    if (!input) return res.status(400).json({ error: 'Missing "input" in body' });

    try {
        // Use basename so the mock LLM can recognize filenames like 'invoice.pdf'
        const base = path.basename(input);
        const app = await createMainGraph({ llm });

        // Use a prompt-like input that the LLM expects (e.g. 'Process invoice.pdf')
        const invokeInput = `Process ${base}`;
        const result = await app.invoke({ input: invokeInput });

        res.json({ result });
    } catch (err) {
        console.error('Error running main graph:', err);
        res.status(500).json({ error: err.message || 'Failed to run main graph' });
    }
});

module.exports = router;
