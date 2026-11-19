import { chromium } from 'playwright';
import path from 'node:path'; import fs from 'node:fs';
const dir = path.resolve(process.argv[2]);
const htmlPath = path.join(dir, '_sanity.html');
fs.writeFileSync(htmlPath, `<!DOCTYPE html><html><head><script src="file://${dir}/ag-grid-enterprise.js"></script></head><body><div id="grid" style="height:600px"></div></body></html>`);
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto('file://' + htmlPath);
console.log(JSON.stringify(await page.evaluate(() => new Promise((resolve) => {
  const rows = []; let i = 0;
  for (let t = 0; t < 1000; t++) for (const s of ['A','B','C']) for (const x of ['M','F']) rows.push({ territory: 'T' + t, species: s, sex: x, i: i++ });
  const api = agGrid.createGrid(document.getElementById('grid'), {
    columnDefs: [{ field: 'territory', rowGroup: true, hide: true }, { field: 'species', rowGroup: true, hide: true }, { field: 'sex' }, { field: 'i', aggFunc: 'sum' }],
    rowData: rows, groupDefaultExpanded: 0,
    onFirstDataRendered: () => {
      const g = api.getRowNode('row-group-territory-T5-species-B');
      const before = { found: !!g, leafs: g?.allLeafChildren?.length, sum: g?.aggData?.i, displayed: api.getDisplayedRowCount() };
      api.setRowNodeExpanded(api.getRowNode('row-group-territory-T5'), true, false, true);
      // second load: reuse path
      api.setGridOption('rowData', rows.slice(0, 600));
      const g2 = api.getRowNode('row-group-territory-T5-species-B');
      resolve({ before, afterExpand: api.getDisplayedRowCount(), reload: { found: !!g2, sameNode: g2 === g, leafs: g2?.allLeafChildren?.length, displayed: api.getDisplayedRowCount(), stale: api.getRowNode('row-group-territory-T200') ?? null } });
    },
  });
}))));
await browser.close();
