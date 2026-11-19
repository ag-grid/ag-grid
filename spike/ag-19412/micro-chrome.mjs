import { chromium } from 'playwright';
import fs from 'node:fs';
const src = fs.readFileSync(new URL('./micro.mjs', import.meta.url), 'utf8');
const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192'] });
const page = await browser.newPage();
page.on('console', (m) => console.log(m.text()));
console.log(await browser.version());
await page.evaluate(src);
await browser.close();
