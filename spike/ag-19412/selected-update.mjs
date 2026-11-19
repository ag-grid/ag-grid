import { chromium } from 'playwright';
import fs from 'node:fs'; import path from 'node:path';
const [rounds, ...vs] = process.argv.slice(2);
const variants = vs.map((v) => { const [name, dir] = v.split('='); return { name, dir: path.resolve(dir) }; });
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const res = Object.fromEntries(variants.map((v) => [v.name, []]));
for (let r = 0; r < +rounds; r++) {
  for (const v of r % 2 ? [...variants].reverse() : variants) {
    const htmlPath = path.join(v.dir, '_sel.html');
    fs.writeFileSync(htmlPath, `<!DOCTYPE html><html><head><script src="file://${v.dir}/ag-grid-enterprise.js"></script></head><body><div id="grid" style="height:600px"></div></body></html>`);
    const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192'] });
    const page = await browser.newPage();
    await page.goto('file://' + htmlPath);
    const out = await page.evaluate(() => new Promise((resolve) => {
      const rows = []; let i = 0;
      for (let t = 0; t < 166667; t++) for (const s of ['A', 'B', 'C']) for (const x of ['M', 'F']) rows.push({ territory: 'T' + t, species: s, sex: x, i: i++ });
      const api = agGrid.createGrid(document.getElementById('grid'), {
        columnDefs: [{ field: 'territory', rowGroup: true, hide: true }, { field: 'species', rowGroup: true, hide: true }, { field: 'sex' }, { field: 'i' }],
        rowData: rows.slice(0, 10),
        getRowId: (p) => String(p.data.i),
        rowSelection: { mode: 'multiRow' },
        onFirstDataRendered: () => {
          api.setNodesSelected({ nodes: [0, 1, 2, 3, 4].map((n) => api.getRowNode(String(n))), newValue: true });
          const t0 = performance.now();
          api.setGridOption('rowData', rows);
          const ms = Math.round(performance.now() - t0);
          resolve({ ms, selected: api.getSelectedNodes().length, sameNodes: api.getSelectedNodes().every((n) => api.getRowNode(n.id) === n), rows: api.getDisplayedRowCount() });
        },
      });
    }));
    res[v.name].push(out.ms);
    if (r === 0) console.log(v.name, JSON.stringify(out));
    await browser.close();
  }
}
for (const [n, a] of Object.entries(res)) console.log(n.padEnd(6), 'median', med(a), 'ms', JSON.stringify(a));
