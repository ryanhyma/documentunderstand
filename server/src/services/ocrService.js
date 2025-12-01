import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

async function ocrImage(imagePath) {
  return new Promise((resolve, reject) => {
    const args = [imagePath, 'stdout'];
    const proc = spawn('tesseract', args);
    let out = '';
    let err = '';
    proc.stdout.on('data', (b) => out += b.toString());
    proc.stderr.on('data', (b) => err += b.toString());
    proc.on('error', (e) => reject(e));
    proc.on('close', (code) => {
      if (code !== 0) return reject(new Error('tesseract failed: ' + err));
      resolve(out.trim());
    });
  });
}

export async function ocrImages(images = []) {
  const results = {};
  for (const img of images) {
    try {
      const text = await ocrImage(img);
      results[img] = text;
    } catch (e) {
      results[img] = `ERROR: ${e.message}`;
    }
  }
  return results;
}

export default { ocrImages };
