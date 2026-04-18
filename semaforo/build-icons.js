// One-shot script to generate PWA icons from icon-source.svg.
// Run: node build-icons.js
// Regenerate whenever icon-source.svg changes.

import sharp from 'sharp';
import fs from 'node:fs';

const svg = fs.readFileSync('./icon-source.svg');

await sharp(svg, { density: 300 })
  .resize(192, 192)
  .png()
  .toFile('icon-192.png');
console.log('✓ icon-192.png');

await sharp(svg, { density: 300 })
  .resize(512, 512)
  .png()
  .toFile('icon-512.png');
console.log('✓ icon-512.png');

// Maskable variant: add ~20% padding so the icon survives circular/squircle masks.
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0f0f0f"/>
  <circle cx="256" cy="188" r="52" fill="#22c55e"/>
  <circle cx="256" cy="268" r="52" fill="#facc15"/>
  <circle cx="256" cy="348" r="52" fill="#ef4444"/>
</svg>`;

await sharp(Buffer.from(maskableSvg), { density: 300 })
  .resize(512, 512)
  .png()
  .toFile('icon-512-maskable.png');
console.log('✓ icon-512-maskable.png');

// Apple touch icon (for iOS home screen).
await sharp(svg, { density: 300 })
  .resize(180, 180)
  .png()
  .toFile('apple-touch-icon.png');
console.log('✓ apple-touch-icon.png');
