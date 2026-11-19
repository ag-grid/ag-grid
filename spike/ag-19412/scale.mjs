// usage: node scale.mjs <rounds> <mode> <territories,...> name=dir ...
import { chromium } from 'playwright';
import fs from 'node:fs'; import path from 'node:path';
const [rounds, mode, ts, ...vs] = process.argv.slice(2);
const variants = vs.map((v) => { const [name, dir] = v.split('='); return { name, dir: path.resolve(dir) }; });
const tpl = fs.readFileSync(new URL('./repro-scaled.html', import.meta.url), 'utf8');
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
for (const t of ts.split(',').map(Number)) {
  const res = Object.fromEntries(variants.map((v) => [v.name, { first: [], warm: [] }]));
  for (let r = 0; r < +rounds; r++) {
    for (const v of r % 2 ? [...variants].reverse() : variants) {
      const htmlPath = path.join(v.dir, '_scaled.html');
      fs.writeFileSync(htmlPath, tpl.replace('BUNDLE_DIR', 'file://' + v.dir).replace('BUNDLE_FILE', 'ag-grid-enterprise.js'));
      const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192'] });
      const page = await browser.newPage();
      await page.goto('file://' + htmlPath + '?t=' + t);
      res[v.name].first.push((await page.evaluate((m) => window.run(m), mode)).firstDataRendered);
      // warm: repeated loads in the same page, like a bench loop
      const warm = [];
      for (let k = 0; k < 5; k++) warm.push((await page.evaluate((m) => window.run(m), mode)).firstDataRendered);
      res[v.name].warm.push(med(warm));
      await browser.close();
    }
  }
  console.log(`rows=${t * 6}`.padEnd(13), variants.map((v) => `${v.name}: first ${med(res[v.name].first)}ms warm ${med(res[v.name].warm)}ms`).join(' | '));
}
