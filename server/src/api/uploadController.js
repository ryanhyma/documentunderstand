// Upload controller for handling file uploads
// Exposes a POST / (mounted at /upload) endpoint that accepts a multipart file
// and stores it under server/data/pdf/. Returns the server‑side path.

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer to store uploads in a temporary folder
const upload = multer({ dest: path.join(__dirname, '..', '..', 'data', 'tmp') });

router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Ensure the final pdf directory exists
    const pdfDir = path.resolve(__dirname, '..', '..', 'data', 'pdf');
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Move the file to the pdf directory, preserving original name
    const destPath = path.join(pdfDir, req.file.originalname);
    fs.renameSync(req.file.path, destPath);

    // Respond with the saved path (relative to the project root)
    const relativePath = path.relative(path.resolve(__dirname, '..', '..'), destPath);
    res.json({ savedPath: relativePath });
});

module.exports = router;
