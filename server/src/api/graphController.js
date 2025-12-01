// Graph controller for executing predefined graphs
// Exposes POST /run (mounted at /graphs) endpoint.
// Expected body: { graph: 'graph_name', params: { ... } }
// Looks for a JSON file under server/graphs/<graph_name>.json and runs it.

const express = require('express');
const path = require('path');
const { runGraph } = require('../services/graphRunner').default;

const router = express.Router();

router.post('/run', async (req, res) => {
    const { graph, params } = req.body || {};
    if (!graph) {
        return res.status(400).json({ error: 'Missing "graph" in request body' });
    }

    // Resolve the graph JSON file path
    const graphFile = path.resolve(__dirname, '..', '..', 'graphs', `${graph}.json`);
    try {
        const result = await runGraph(graphFile, params || {});
        res.json({ result });
    } catch (err) {
        console.error('Error running graph:', err);
        res.status(500).json({ error: err.message || 'Failed to run graph' });
    }
});

module.exports = router;
