const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs/promises');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function checkPdftoppm() {
  return new Promise((resolve) => {
    const p = spawn('pdftoppm', ['-v']);
    p.on('error', () => resolve(false));
    p.on('close', (code) => resolve(code === 0 || code === 1));
  });
}

// Convert PDF to JPEGs using pdftoppm. Writes into outDir/img/<basename>/
async function convert(inputPath, outDir) {
  const hasTool = await checkPdftoppm();
  if (!hasTool) throw new Error('pdftoppm not found on PATH. Install Poppler.');

  const absInput = path.resolve(inputPath);
  const base = path.basename(absInput, path.extname(absInput));
  const targetDir = path.resolve(outDir, 'img', base);
  await ensureDir(targetDir);

  const prefix = path.join(targetDir, base);

  return new Promise((resolve, reject) => {
    const args = ['-jpeg', absInput, prefix];
    const proc = spawn('pdftoppm', args);
    let stderr = '';
    proc.stderr.on('data', (b) => stderr += b.toString());
    proc.on('error', (err) => reject(err));
    proc.on('close', async (code) => {
      if (code !== 0) return reject(new Error('pdftoppm failed: ' + stderr));
      try {
        const files = await fs.readdir(targetDir);
        const images = files.filter(f => /\.(jpe?g|png)$/i.test(f)).map(f => path.join(targetDir, f));
        resolve(images.sort());
      } catch (err) { reject(err); }
    });
  });
}

module.exports = { convert };
