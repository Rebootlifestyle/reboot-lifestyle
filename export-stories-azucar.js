import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 2000 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

for (const [slug, file] of [['story-azucar-poll', 'story-azucar-poll.png'], ['story-azucar-reveal', 'story-azucar-reveal.png']]) {
  await page.goto(`http://localhost:8080/${slug}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const handle = await page.$('.story');
  await handle.screenshot({ path: path.join(__dirname, file) });
  console.log(`→ ${file}`);
}
await browser.close();
