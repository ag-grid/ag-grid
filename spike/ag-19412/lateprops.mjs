import { chromium } from 'playwright';
import path from 'node:path'; import fs from 'node:fs';
const dir = path.resolve(process.argv[2]);
const htmlPath = path.join(dir, '_late.html');
fs.writeFileSync(htmlPath, `<!DOCTYPE html><html><head><script src="file://${dir}/ag-grid-enterprise.js"></script></head><body><div id="grid" style="height:600px"></div></body></html>`);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + htmlPath);
console.log(JSON.stringify(await page.evaluate(() => new Promise((resolve) => {
  const rows = []; let i = 0;
  for (let t = 0; t < 100; t++) for (const s of ['A','B','C']) for (const x of ['M','F']) rows.push({ territory: 'T' + t, species: s, sex: x, i: i++ });
  const api = agGrid.createGrid(document.getElementById('grid'), {
    columnDefs: [{ field: 'territory', rowGroup: true, hide: true }, { field: 'species', rowGroup: true, hide: true }, { field: 'sex' }],
    rowData: rows, groupDefaultExpanded: -1,
    onFirstDataRendered: () => {
      const leaf = api.getRowNode('0');
      const keys = Object.keys(leaf); const b = keys.indexOf('beans');
      const g = leaf.parent; const gk = Object.keys(g); const gb = gk.indexOf('beans');
      resolve({ leafCtor: b + 1, leafLate: keys.slice(b + 1), groupCtor: gb + 1, groupLate: gk.slice(gb + 1) });
    },
  });
}))));
await browser.close();
