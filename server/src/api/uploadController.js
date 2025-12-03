// Upload controller for handling file uploads
// Exposes a POST / (mounted at /upload) endpoint that accepts a multipart file
// and stores it under server/data/pdf/. Returns the server‑side path.

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer to store uploads in a temporary folder
const upload = multer({ dest: path.join(process.cwd(), 'server', 'data', 'tmp') });

router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Ensure the final pdf directory exists
    const pdfDir = path.resolve(process.cwd(), 'server', 'data', 'pdf');
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Move the file to the pdf directory, preserving original name
    const destPath = path.join(pdfDir, req.file.originalname);
    fs.renameSync(req.file.path, destPath);

    // Respond with the saved path (relative to the project root)
    const relativePath = path.relative(path.resolve(process.cwd()), destPath);
    res.json({ savedPath: relativePath });
});

export default router;
