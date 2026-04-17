// Smoke test for analyzeMenu. Run with:
//   node --env-file=.env.local smoke-test.js <path-to-image>
// If no path passed, uses ../og-cafe.jpg (a non-menu image; expects no_menu_detected response).

import { analyzeMenu } from './lib/analyzeMenu.js';
import fs from 'node:fs';
import path from 'node:path';

const imagePath = process.argv[2] || path.join('..', 'og-cafe.jpg');
const ext = path.extname(imagePath).toLowerCase();
const mediaType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

console.log(`Reading: ${imagePath}`);
const imageBase64 = fs.readFileSync(imagePath).toString('base64');
console.log(`Size: ${(imageBase64.length / 1024).toFixed(0)} KB base64`);

const start = Date.now();
try {
  const result = await analyzeMenu({
    imageBase64,
    mediaType,
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nResponse in ${elapsed}s:\n`);
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.error(`\nError in ${elapsed}s:`, err.message);
  if (err.code) console.error('Code:', err.code);
  process.exit(1);
}
