/**
 * Issue: Excel export with `exportAsExcelTable` writes table column names (xl/tables/table1.xml) with
 * control characters left raw, while the matching header cell text in the sheet has them escaped as _xHHHH_.
 *
 * Setup: ExcelExportModule, a column whose headerName contains a control character (U+0001), exported with
 * `exportAsExcelTable: true`.
 *
 * Expected: the generated file is valid for Excel, so control characters in the table column name are escaped
 * as `_x0001_` in the same way as the header cell text (as already done for cell text by
 * replaceInvisibleCharacters). Excel requires table column names to match the text of the header cells, and
 * the XML must contain no characters that are illegal in XML 1.0 (U+0001 is not a valid XML 1.0 character).
 *
 * Actual: only '\n' is converted in the table column name, so the raw U+0001 character is written into table1.xml,
 * which is invalid XML and makes Excel show "We found a problem with some content ... recover as much as we can".
 *
 * Reported on: vue 33.3.2.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). Two searches in March 2026 (vue 33.3.2) for:
 * "Excel export warning 'We found a problem with some content' recover as much as we can illegal characters XML
 * control characters processCellCallback" and "Excel export invalid XML character recover content warning known
 * issue xlsx control characters tree data".
 */
import { TestGridsManager, objectUrls } from 'ag-test-utils';
import * as XLSX from 'xlsx';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';

// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('Excel table column names with control characters', () => {
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

    test('table column name has control characters escaped', async () => {
        const api = gridsManager.createGrid('excel-table-control-chars', {
            columnDefs: [{ field: 'a', headerName: 'A\u0001B' }],
            rowData: [{ a: 1 }],
        });
        api.exportDataAsExcel({ exportAsExcelTable: true });
        const zip = XLSX.CFB.read(new Uint8Array(await (await objectUrls.pullBlob()).arrayBuffer()), { type: 'array' });
        const tableXml = new TextDecoder().decode(XLSX.CFB.find(zip, '/xl/tables/table1.xml').content);
        const name = /<tableColumn\b[^>]*\bname="([^"]*)"/.exec(tableXml)?.[1];
        expect(name).toBe('A_x0001_B');
    });
});
