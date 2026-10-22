import { waitFor } from '@testing-library/dom';
import { TestGridsManager, objectUrls } from 'ag-test-utils';
import * as XLSX from 'xlsx';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { CellStyleModule, ClientSideRowModelModule, CsvExportModule, RowSelectionModule } from 'ag-grid-community';
import { ExcelExportModule, RowGroupingModule, TransposeModule } from 'ag-grid-enterprise';

interface Company {
    id: string;
    name: string;
    region: string;
    sector: string;
    revenue: number;
}

const ROW_DATA: Company[] = [
    { id: 'a', name: 'Northwind', region: 'EMEA', sector: 'Retail', revenue: 400 },
    { id: 'b', name: 'Contoso', region: 'APAC', sector: 'Tech', revenue: 250 },
    { id: 'c', name: 'Fabrikam', region: 'AMER', sector: 'Retail', revenue: 900 },
];

const csvRows = (csv: string) => csv.split('\r\n').map((line) => line.split(',').map((cell) => cell.replace(/"/g, '')));

describe('exporting the transposed view', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            CellStyleModule,
            ClientSideRowModelModule,
            CsvExportModule,
            ExcelExportModule,
            RowGroupingModule,
            RowSelectionModule,
            TransposeModule,
        ],
    });

    beforeEach(() => {
        objectUrls.init();
        gridsManager.reset();
    });
    afterEach(() => gridsManager.reset());

    const create = (extra: GridOptions<Company> = {}): GridApi<Company> =>
        gridsManager.createGrid('export', {
            columnDefs: [
                { field: 'name', headerName: 'Company' },
                { headerName: 'Details', groupId: 'details', children: [{ field: 'region' }, { field: 'sector' }] },
                { field: 'revenue', aggFunc: 'sum', cellClass: 'money', valueFormatter: (p) => `£${p.value}m` },
            ],
            rowData: ROW_DATA,
            getRowId: (params) => params.data.id,
            transpose: true,
            transposeHeaderColId: 'name',
            excelStyles: [{ id: 'money', numberFormat: { format: '£#,##0' } }],
            ...extra,
        });

    test('CSV exports the field rows across the records, formatted, with the totals column', () => {
        const api = create({ grandTotalRow: 'bottom' });
        expect(csvRows(api.getDataAsCsv()!)).toEqual([
            ['Company', 'Northwind', 'Contoso', 'Fabrikam', 'Total'],
            ['Details', '', '', '', ''],
            ['Region', 'EMEA', 'APAC', 'AMER', ''],
            ['Sector', 'Retail', 'Tech', 'Retail', ''],
            ['Revenue', '£400m', '£250m', '£900m', '£1550m'],
        ]);
    });

    test("Excel keeps numbers as numbers, formatted by the field's Excel style", async () => {
        const api = create({ grandTotalRow: 'bottom' });
        api.exportDataAsExcel();
        const workbook = XLSX.read(new Uint8Array(await (await objectUrls.pullBlob()).arrayBuffer()), {
            type: 'array',
            cellNF: true,
        });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const cell = (ref: string) => ({ value: sheet[ref]?.v, type: sheet[ref]?.t, format: sheet[ref]?.z });
        expect(cell('A5')).toEqual({ value: 'Revenue', type: 's', format: 'General' });
        expect(cell('C5')).toEqual({ value: 250, type: 'n', format: '£#,##0' });
        expect(cell('E5')).toEqual({ value: 1550, type: 'n', format: '£#,##0' });
        expect(cell('C3')).toEqual({ value: 'APAC', type: 's', format: 'General' });
    });

    test("onlySelected exports the selected records' columns", () => {
        const api = create({ rowSelection: { mode: 'multiRow' }, grandTotalRow: 'bottom' });
        api.getRowNode('b')!.setSelected(true);
        expect(csvRows(api.getDataAsCsv({ onlySelected: true })!)).toEqual([
            ['Company', 'Contoso'],
            ['Details', ''],
            ['Region', 'APAC'],
            ['Sector', 'Tech'],
            ['Revenue', '£250m'],
        ]);
    });

    test('columnKeys naming the original columns exports the untransposed view', () => {
        const api = create();
        expect(csvRows(api.getDataAsCsv({ columnKeys: ['name', 'region', 'revenue'] })!)).toEqual([
            ['', 'Details', ''],
            ['Company', 'Region', 'Revenue'],
            ['Northwind', 'EMEA', '£400m'],
            ['Contoso', 'APAC', '£250m'],
            ['Fabrikam', 'AMER', '£900m'],
        ]);
    });

    test("a collapsed field group's fields are left out, as a collapsed column group's columns are", async () => {
        const api = create();
        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const expand = await waitFor(() => {
            const el = gridDiv.querySelector<HTMLElement>(
                '[row-id="ag-Grid-TransposeFieldGroup-details"] .ag-transpose-field-expand'
            );
            if (!el?.firstChild) {
                throw new Error('expand icon not found');
            }
            return el;
        });
        expand.click();
        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(2));
        expect(csvRows(api.getDataAsCsv()!)).toEqual([
            ['Company', 'Northwind', 'Contoso', 'Fabrikam'],
            ['Details', '', '', ''],
            ['Revenue', '£400m', '£250m', '£900m'],
        ]);
    });

    test('processCellCallback gets the real record and field for a value cell', () => {
        const api = create();
        const seen: string[] = [];
        api.getDataAsCsv({
            processCellCallback: (params) => {
                if (params.column.getColId() === 'revenue') {
                    seen.push(`${params.node?.id}:${params.node?.data?.name}=${params.value}`);
                }
                return params.value;
            },
        });
        expect(seen).toEqual(['a:Northwind=400', 'b:Contoso=250', 'c:Fabrikam=900']);
    });
});
