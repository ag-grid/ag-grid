/**
 * Issue: cells in `prependContent` / `appendContent` ExcelRows ignore `cell.data.type`. The serializing session
 * derives the type from the value alone, so a cell declared as `type: 'String'` with value '123' is written to the
 * sheet as a number.
 *
 * Setup: ExcelExportModule, a simple grid exported with `prependContent` containing a cell
 * `{ data: { type: 'String', value: '123' } }` and no matching `excelStyles` dataType.
 *
 * Expected: the declared type is honoured (ExcelData.type: "The type of data being in the cell"), so the cell is a
 * text cell, not a number (https://www.ag-grid.com/javascript-data-grid/excel-export-extra-content/).
 *
 * Actual: the cell is written as a number (t="n"), so Excel shows 123 as a number rather than the text '123'.
 *
 * Reported on: vue 34.3.1.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). One search in January 2026 (vue 34.3.1) for:
 * "exportDataAsExcel prependContent ExcelRow cells format broken corrupt file".
 */
import { TestGridsManager, objectUrls } from 'ag-test-utils';
import * as XLSX from 'xlsx';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';

// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('Excel prependContent cell data type', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ExcelExportModule],
    });

    beforeEach(() => {
        objectUrls.init();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('a String typed cell with a numeric value is written as text', async () => {
        const api = gridsManager.createGrid('excel-prepend-type', {
            columnDefs: [{ field: 'a' }],
            rowData: [{ a: 'x' }],
        });
        api.exportDataAsExcel({
            prependContent: [{ cells: [{ data: { type: 'String', value: '123' } }] }],
        });
        const zip = XLSX.CFB.read(new Uint8Array(await (await objectUrls.pullBlob()).arrayBuffer()), { type: 'array' });
        const sheetXml = new TextDecoder().decode(XLSX.CFB.find(zip, '/xl/worksheets/sheet1.xml').content);
        const cellTag = /<c\b[^>]*\br="A1"[^>]*>/.exec(sheetXml)?.[0];
        expect(cellTag).toBeDefined();
        expect(cellTag).not.toMatch(/\bt="n"/);
    });
});
