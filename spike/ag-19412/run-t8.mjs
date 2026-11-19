import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192'] });
for (const scenario of process.argv.slice(2)) {
  const page = await browser.newPage();
  const res = await page.evaluate((scenario) => {
    const keys = [];
    for (let t = 0; t < 166667; t++) { const a = 'row-group-' + ('territory' + '-' + ('T' + t)); keys.push(a); for (const s of ['A','B','C']) keys.push((a + '-') + ('species' + '-' + s)); }
    const build = () => { const fresh = keys.map((k) => k.slice(0, 5) + k.slice(5)); const m = new Map(); const t0 = performance.now(); for (const k of fresh) { m.get(k); m.set(k, 1); } return Math.round(performance.now() - t0); };
    const before = build();
    const keep = {};
    if (scenario === 'indexKeysObject') for (let i = 0; i < 1000002; i++) keep[String(i)] = i;
    if (scenario === 'internalizedNames') for (let i = 0; i < 1000002; i++) keep['k' + i] = i;
    if (scenario === 'numericStringsMap') { const m = new Map(); for (let i = 0; i < 1000002; i++) m.set(String(i), i); window.__m = m; }
    if (scenario === 'nonNumericStringsMap') { const m = new Map(); for (let i = 0; i < 1000002; i++) m.set('k' + i, i); window.__m = m; }
    if (scenario === 'numericStringsMapSmall') { const m = new Map(); for (let i = 0; i < 100000; i++) m.set(String(i), i); window.__m = m; }
    if (scenario === 'numericStringsMapThenDrop') { let m = new Map(); for (let i = 0; i < 1000002; i++) m.set(String(i), i); m = null; }
    if (scenario === 'numbersMap') { const m = new Map(); for (let i = 0; i < 1000002; i++) m.set(i, i); window.__m = m; }
    if (scenario === 'numericStringsArray') { window.__a = []; for (let i = 0; i < 1000002; i++) window.__a.push(String(i)); }
    if (scenario === 'numStrHashedKeepStrings') { const a = []; for (let i = 0; i < 1000002; i++) a.push(String(i)); let m = new Map(); for (const s of a) m.set(s, 1); m = null; window.__a = a; }
    if (scenario === 'numStrObjPropKeepStrings') { const a = []; const o = Object.create(null); for (let i = 0; i < 1000002; i++) { const s = String(i); a.push(s); o[s] = 1; } window.__a = a; window.__o = o; }
    window.__keep = keep;
    return { before, after: build() };
  }, scenario);
  console.log(scenario.padEnd(20), JSON.stringify(res));
  await page.close();
}
await browser.close();
