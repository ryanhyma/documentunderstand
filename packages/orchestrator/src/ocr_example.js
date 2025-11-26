const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

async function runExample() {
  const img = path.join(__dirname, '..', '..', 'examples', 'sample-data', 'sample.png');
  if (!fs.existsSync(img)) {
    console.log('No sample image found at', img);
    return;
  }

  const worker = Tesseract.createWorker();
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data } = await worker.recognize(img);
  await worker.terminate();
  console.log('OCR text:\n', data.text);
}

if (require.main === module) runExample().catch(console.error);
