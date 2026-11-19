// usage: node ab.mjs <rounds> <mode> name=dir name=dir ...
import { chromium } from 'playwright';
import fs from 'node:fs'; import path from 'node:path';
const [rounds, mode, ...vs] = process.argv.slice(2);
const variants = vs.map((v) => { const [name, dir] = v.split('='); return { name, dir: path.resolve(dir) }; });
const results = Object.fromEntries(variants.map((v) => [v.name, { first: [], second: [] }]));
const tpl = fs.readFileSync(new URL('./repro.html', import.meta.url), 'utf8');
for (let r = 0; r < +rounds; r++) {
  const order = r % 2 ? [...variants].reverse() : variants;
  for (const v of order) {
    const htmlPath = path.join(v.dir, '_repro.html');
    fs.writeFileSync(htmlPath, tpl.replace('BUNDLE_DIR', 'file://' + v.dir).replace('BUNDLE_FILE', 'ag-grid-enterprise.js'));
    const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192'] });
    const page = await browser.newPage();
    await page.goto('file://' + htmlPath);
    const a = await page.evaluate((m) => window.run(m), mode);
    const b = await page.evaluate((m) => window.run(m), mode);
    results[v.name].first.push(a.firstDataRendered); results[v.name].second.push(b.firstDataRendered);
    if (results[v.name].displayed === undefined) results[v.name].displayed = a.displayed;
    await browser.close();
  }
}
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
for (const [n, r] of Object.entries(results)) console.log(n.padEnd(12), 'first med', med(r.first), JSON.stringify(r.first), ' second med', med(r.second), JSON.stringify(r.second), 'rows', r.displayed);
