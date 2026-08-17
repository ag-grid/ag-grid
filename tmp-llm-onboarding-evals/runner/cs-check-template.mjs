// Verify one column-sizing template before any agent sees it: it renders a grid, and its console is
// silent under enableDevValidations().
//
// The console check is the load-bearing one. Templates must start silent, or an AG Grid warning found
// after a run cannot be attributed to the agent that produced it — which is how the warning #318
// finding was established.
//
// Column widths and screenshots are recorded for eyeballing, not asserted. Per-criterion behavioural
// probes used to live here; they caught one real problem in fourteen criteria while being the most
// brittle code in the harness, so they were removed. Look at the screenshot instead.
//
// usage: node cs-check-template.mjs <url> <criterion> <outDir>

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [url, criterion, outDir] = process.argv.slice(2);
if (!url || !criterion || !outDir) {
    console.error('usage: node cs-check-template.mjs <url> <criterion> <outDir>');
    process.exit(2);
}

mkdirSync(outDir, { recursive: true });

// Vite's HMR chatter and React's devtools nag are ours, not the app's.
const IGNORE = [/\[vite\]/i, /Download the React DevTools/i, /react-refresh/i];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const messages = [];
page.on('console', (m) => messages.push({ type: m.type(), text: m.text() }));
page.on('pageerror', (e) => messages.push({ type: 'pageerror', text: String(e) }));

let renderError = null;
try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.ag-row', { timeout: 30000 });
    await page.waitForTimeout(2500);
} catch (e) {
    renderError = String(e).split('\n')[0];
}

const observed = renderError
    ? {}
    : {
          rows: await page.$$eval('.ag-row', (r) => r.length),
          columns: await page.$$eval('.ag-header-cell', (cells) =>
              cells.map((c) => ({
                  id: c.getAttribute('col-id'),
                  width: Math.round(c.getBoundingClientRect().width),
              }))
          ),
          gridWidth: await page.$eval('.ag-grid-viewport', (e) => Math.round(e.clientWidth)),
      };

if (observed.columns) {
    observed.totalColumnWidth = observed.columns.reduce((total, c) => total + c.width, 0);
}

await page.screenshot({ path: join(outDir, `${criterion}.png`), fullPage: false });
await browser.close();

const noise = messages.filter((e) => !IGNORE.some((r) => r.test(e.text)));
const rendered = !renderError && observed.rows > 0 && (observed.columns?.length ?? 0) > 0;

writeFileSync(
    join(outDir, `${criterion}.json`),
    JSON.stringify({ criterion, rendered, renderError, consoleClean: noise.length === 0, console: noise, observed }, null, 2)
);

const ok = rendered && noise.length === 0;
console.log(
    `${ok ? 'PASS' : 'FAIL'} ${criterion} rendered=${rendered} console=${noise.length === 0 ? 'clean' : noise.length + ' msg'}` +
        (observed.columns ? ` cols=${observed.columns.length} width=${observed.totalColumnWidth}/${observed.gridWidth}` : '')
);
if (!ok) {
    console.log(JSON.stringify({ renderError, console: noise }, null, 2));
}
process.exit(ok ? 0 : 1);
