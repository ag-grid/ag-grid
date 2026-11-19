import { chromium } from 'playwright';
import fs from 'node:fs'; import path from 'node:path';
const [dir, mode, out] = process.argv.slice(2);
const tpl = fs.readFileSync(new URL('./repro.html', import.meta.url), 'utf8');
const htmlPath = path.join(path.resolve(dir), '_repro.html');
fs.writeFileSync(htmlPath, tpl.replace('BUNDLE_DIR', 'file://' + path.resolve(dir)).replace('BUNDLE_FILE', 'ag-grid-enterprise.js'));
const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192'] });
const page = await browser.newPage();
await page.goto('file://' + htmlPath);
await browser.startTracing(page, { path: out, categories: ['devtools.timeline', 'v8', 'disabled-by-default-v8.gc'] });
const r = await page.evaluate((m) => window.run(m), mode);
await browser.stopTracing();
console.log(JSON.stringify(r));
const t = JSON.parse(fs.readFileSync(out, 'utf8'));
const ev = t.traceEvents ?? t;
const main = ev.find((e) => e.name === 'thread_name' && e.args?.name === 'CrRendererMain');
const sums = {};
for (const e of ev) {
  if (e.ph !== 'X' || !e.dur) continue;
  if (!/GC|Scavenge|MarkCompact|Mark|Sweep|Minor|Major/i.test(e.name)) continue;
  const k = (e.tid === main?.tid && e.pid === main?.pid ? 'main ' : 'other ') + e.name;
  sums[k] = (sums[k] ?? 0) + e.dur / 1000;
}
for (const [k, v] of Object.entries(sums).sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(Math.round(v).toString().padStart(6), k);
await browser.close();
