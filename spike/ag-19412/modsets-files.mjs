// usage: node modsets.mjs <rounds> <mode> <source: local|released>
import { chromium } from 'playwright';
import fs from 'node:fs';
const [rounds, mode, source] = process.argv.slice(2);
const R = new URL('../../packages', import.meta.url).pathname;
const CDN = 'https://cdn.jsdelivr.net/npm';
const map = source === 'local'
  ? { 'ag-grid-community': 'http://bench.local/community.mjs', 'ag-grid-enterprise': 'http://bench.local/enterprise.mjs', 'ag-stack': 'http://bench.local/stack.mjs' }
  : { 'ag-grid-community': `${CDN}/ag-grid-community@36.3.0/dist/package/main.esm.min.mjs`, 'ag-grid-enterprise': `${CDN}/ag-grid-enterprise@36.3.0/dist/package/main.esm.min.mjs`, 'ag-stack': `${CDN}/ag-stack@36.3.0/dist/package/main.esm.min.mjs` };
const localFiles = process.env.FILES ? JSON.parse(process.env.FILES) : { '/community.mjs': `${R}/ag-grid-community/dist/package/main.esm.min.mjs`, '/enterprise.mjs': `${R}/ag-grid-enterprise/dist/package/main.esm.min.mjs`, '/stack.mjs': `${R}/ag-stack/dist/package/main.esm.min.mjs` };
const html = `<!DOCTYPE html><html><head><script type="importmap">${JSON.stringify({ imports: map })}</script></head><body><div id="grid" style="height:600px"></div>
<script type="module">
import { ClientSideRowModelModule, AllCommunityModule, createGrid } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
const SETS = { csrmOnly: [ClientSideRowModelModule], allCommunity: [AllCommunityModule], allEnterprise: [AllEnterpriseModule] };
function buildRows() { const rows = []; let i = 0; for (let t = 0; t < 166667; t++) for (const s of ['A','B','C']) for (const x of ['M','F']) rows.push({ territory: 'T' + t, species: s, sex: x, i: i++ }); return rows; }
function buildColumns(grouped) {
  const cols = grouped ? [{ field: 'territory', rowGroup: true, hide: true }, { field: 'species', rowGroup: true, hide: true }, { field: 'sex' }] : [{ field: 'territory' }, { field: 'species' }, { field: 'sex' }];
  for (let c = 0; c < 10; c++) cols.push({ headerName: 'v' + c, valueGetter: (p) => (p.data ? (p.data.i * (c + 7)) % 100000 : null) });
  return cols;
}
window.run = (set, mode) => new Promise((resolve) => {
  const rows = buildRows(); const t0 = performance.now();
  const api = createGrid(document.getElementById('grid'), { columnDefs: buildColumns(mode !== 'flat'), rowData: rows, groupDefaultExpanded: mode === 'grouped' ? -1 : 0,
    onFirstDataRendered: () => { const ms = Math.round(performance.now() - t0); setTimeout(() => resolve({ ms, rows: api.getDisplayedRowCount(), sel: api.isModuleRegistered('RowSelectionModule') }), 0); } }, { modules: SETS[set] });
});
window.ready = true;
</script></body></html>`;
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const sets = (process.env.SETS ?? 'allCommunity,allEnterprise').split(',');
const res = Object.fromEntries(sets.map((s) => [s, []]));
for (let r = 0; r < +rounds; r++) {
  for (const set of r % 2 ? [...sets].reverse() : sets) {
    const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192'] });
    const page = await browser.newPage();
    page.on('pageerror', (e) => console.log('pageerror', e.message));
    await page.route('http://bench.local/**', (route) => {
      const p = new URL(route.request().url()).pathname;
      if (p === '/index.html') return route.fulfill({ body: html, contentType: 'text/html' });
      route.fulfill({ body: fs.readFileSync(localFiles[p]), contentType: 'text/javascript' });
    });
    await page.goto('http://bench.local/index.html');
    await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
    const out = await page.evaluate(([s, m]) => window.run(s, m), [set, mode]);
    res[set].push(out.ms);
    if (r === 0) console.log(source, set, JSON.stringify(out));
    await browser.close();
  }
}
for (const [s, a] of Object.entries(res)) console.log((process.env.LABEL ?? source).padEnd(9), mode, s.padEnd(14), 'median', med(a), 'ms', JSON.stringify(a));
