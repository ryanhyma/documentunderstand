import { resolve } from 'path';
import { readFile } from 'fs/promises';
import { convert } from './pdfToImageService.js';

function resolveParams(params, vars) {
  const out = {};
  for (const k of Object.keys(params || {})) {
    const v = params[k];
    if (typeof v === 'string') {
      out[k] = v.replace(/{{\s*([^}]+)\s*}}/g, (_, name) => vars[name] ?? '');
    } else {
      out[k] = v;
    }
  }
  return out;
}

async function runGraph(graphPath, inputs = {}) {
  const content = await readFile(graphPath, 'utf8');
  const graph = JSON.parse(content);
  const vars = { ...inputs };

  for (const step of graph.steps || []) {
    const params = resolveParams(step.params || {}, vars);
    if (step.service === 'pdfToImage') {
      const inputPath = params.inputPath;
      const baseOut = params.outDir || resolve(__dirname, '..', 'data');
      const images = await convert(inputPath, baseOut);
      vars[step.id] = images;
      vars['images'] = images;
    } else {
      throw new Error('Unknown service: ' + step.service);
    }
  }

  return vars;
}

export default { runGraph };
