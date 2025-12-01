import React, { useState } from 'react';
import './PdfUpload.css';

function PdfUpload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setStatus('Uploading...');

    const fd = new FormData();
    fd.append('file', file, file.name);

    try {
      const resp = await fetch('/upload', { method: 'POST', body: fd });
      const data = await resp.json();
      if (resp.ok) {
        setStatus('Uploaded');
        if (onUploaded) onUploaded(data.savedPath || file.name);
      } else {
        setStatus('Upload failed');
        console.error('Upload error', data);
      }
    } catch (err) {
      setStatus('Upload error');
      console.error(err);
    }
  }

  return (
    <div className="pdf-upload">
      <h4>Upload PDF</h4>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} />
        <button type="submit" disabled={!file}>Upload</button>
      </form>
      <div className="upload-status">{status}</div>
    </div>
  );
}

export default PdfUpload;
