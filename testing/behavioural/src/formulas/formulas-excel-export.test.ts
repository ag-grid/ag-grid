import type { WorkSheet } from 'xlsx';
import XLSX from 'xlsx';

import type { GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { ExcelExportModule, FormulaModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, objectUrls } from '../test-utils';

const rowNumberRefreshBufferMs = 25;

describe('ag-grid formulas excel export', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, FormulaModule, ExcelExportModule] as Module[],
    });

    beforeEach(() => {
        objectUrls.init();
        gridsManager.reset();
    });

    afterEach(() => {
        vitest.restoreAllMocks();
        gridsManager.reset();
    });

    test('excel export includes formula strings for formula cells', async () => {
        const rowData = [
            { id: 'row-1', value: 10 },
            { id: 'row-2', value: 20 },
            // Relative formula syntax
            { id: 'row-3', value: '=SUM(A1:A2)' },
            // Explicit REF(COLUMN,ROW) syntax with row ids
            { id: 'row-4', value: '=REF(COLUMN("value"),ROW("row-1"))+REF(COLUMN("value"),ROW("row-2"))' },
            // Explicit REF(COLUMN,ROW) syntax with absolute references
            { id: 'row-5', value: '=REF(COLUMN("A",true),ROW("1",true))+REF(COLUMN("A",true),ROW("2",true))' },
        ];

        const gridOptions: GridOptions = {
            defaultColDef: {
                allowFormula: true,
            },
            rowNumbers: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [{ field: 'value', headerName: 'value' }],
        };

        const api = gridsManager.createGrid('formulas-excel-export', gridOptions);
        await new GridColumns(api, `excel export includes formula strings for formula cells setup`).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            └── value width:200
        `);
        await new GridRows(api, `excel export includes formula strings for formula cells setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:row-1 row-number:"1" value:10
            ├── LEAF id:row-2 row-number:"2" value:20
            ├── LEAF id:row-3 row-number:"3" value:30
            ├── LEAF id:row-4 row-number:"4" value:30
            └── LEAF id:row-5 row-number:"5" value:30
        `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        api.exportDataAsExcel({ fileName: 'test.xlsx' });

        const sheet = await getExcelSheet(await objectUrls.pullBlob());

        // First two rows should have their numeric values (row 1 is header, so data starts at row 2)
        expect(sheet['A2']?.v).toBe(10);
        expect(sheet['A3']?.v).toBe(20);

        // Third data row (A4) - relative formula adjusted from A1:A2 to A2:A3 because of header row offset
        expect(sheet['A4']?.f).toBe('SUM(A2:A3)');

        // Fourth data row (A5) - explicit REF with row ids converted to relative Excel references
        expect(sheet['A5']?.f).toBe('A2+A3');

        // Fifth data row (A6) - explicit REF with absolute references converted to absolute Excel references
        expect(sheet['A6']?.f).toBe('$A$1+$A$2');
        await new GridRows(api, `excel export includes formula strings for formula cells final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:row-1 row-number:"1" value:10
            ├── LEAF id:row-2 row-number:"2" value:20
            ├── LEAF id:row-3 row-number:"3" value:30
            ├── LEAF id:row-4 row-number:"4" value:30
            └── LEAF id:row-5 row-number:"5" value:30
        `);
    });

    test('excel export with AG Grid REF formula converts to Excel cell references', async () => {
        const rowData = [
            { id: 'row-1', A: 5, B: 3 },
            { id: 'row-2', A: 10, B: 7 },
            // Relative formula syntax
            { id: 'row-3', A: '=SUM(A1:A2)', B: '=B1*B2' },
            // Explicit REF with row ids (relative references)
            {
                id: 'row-4',
                A: '=REF(COLUMN("A"),ROW("row-1"))+REF(COLUMN("A"),ROW("row-2"))',
                B: '=REF(COLUMN("B"),ROW("row-1"))-REF(COLUMN("B"),ROW("row-2"))',
            },
            // Explicit REF with absolute row references
            {
                id: 'row-5',
                A: '=REF(COLUMN("A",true),ROW("1",true))+REF(COLUMN("A",true),ROW("2",true))',
                B: '=REF(COLUMN("B",true),ROW("1",true))*REF(COLUMN("B",true),ROW("2",true))',
            },
            // Mixed: absolute column, relative row
            { id: 'row-6', A: '=REF(COLUMN("A",true),ROW("row-1"))', B: '=REF(COLUMN("B",true),ROW("row-2"))' },
        ];

        const gridOptions: GridOptions = {
            defaultColDef: {
                allowFormula: true,
            },
            rowNumbers: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [
                { field: 'A', headerName: 'A' },
                { field: 'B', headerName: 'B' },
            ],
        };

        const api = gridsManager.createGrid('formulas-excel-cell-refs', gridOptions);
        await new GridColumns(api, `excel export with AG Grid REF formula converts to Excel cell references setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── A width:200
                └── B width:200
            `);
        await new GridRows(api, `excel export with AG Grid REF formula converts to Excel cell references setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:row-1 row-number:"1" A:5 B:3
                ├── LEAF id:row-2 row-number:"2" A:10 B:7
                ├── LEAF id:row-3 row-number:"3" A:15 B:21
                ├── LEAF id:row-4 row-number:"4" A:15 B:-4
                ├── LEAF id:row-5 row-number:"5" A:15 B:21
                └── LEAF id:row-6 row-number:"6" A:5 B:7
            `
        );
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        api.exportDataAsExcel({ fileName: 'test.xlsx' });

        const sheet = await getExcelSheet(await objectUrls.pullBlob());

        // First two rows should have their numeric values
        expect(sheet['A2']?.v).toBe(5);
        expect(sheet['B2']?.v).toBe(3);
        expect(sheet['A3']?.v).toBe(10);
        expect(sheet['B3']?.v).toBe(7);

        // Third row - relative formulas adjusted for header row offset
        expect(sheet['A4']?.f).toBe('SUM(A2:A3)');
        expect(sheet['B4']?.f).toBe('B2*B3');

        // Fourth row - explicit REF with row ids converted to relative Excel references
        expect(sheet['A5']?.f).toBe('A2+A3');
        expect(sheet['B5']?.f).toBe('B2-B3');

        // Fifth row - explicit REF with absolute references
        expect(sheet['A6']?.f).toBe('$A$1+$A$2');
        expect(sheet['B6']?.f).toBe('$B$1*$B$2');

        // Sixth row - mixed absolute column, relative row
        expect(sheet['A7']?.f).toBe('$A2');
        expect(sheet['B7']?.f).toBe('$B3');
        await new GridRows(api, `excel export with AG Grid REF formula converts to Excel cell references final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:row-1 row-number:"1" A:5 B:3
                ├── LEAF id:row-2 row-number:"2" A:10 B:7
                ├── LEAF id:row-3 row-number:"3" A:15 B:21
                ├── LEAF id:row-4 row-number:"4" A:15 B:-4
                ├── LEAF id:row-5 row-number:"5" A:15 B:21
                └── LEAF id:row-6 row-number:"6" A:5 B:7
            `);
    });

    test('excel export with value formatter exports formula not formatted value', async () => {
        const rowData = [
            { id: 'row-1', price: 100 },
            { id: 'row-2', price: 200 },
            // Relative formula syntax
            { id: 'row-3', price: '=A1+A2' },
            // Explicit REF with row ids (relative references)
            { id: 'row-4', price: '=REF(COLUMN("price"),ROW("row-1"))+REF(COLUMN("price"),ROW("row-2"))' },
            // Explicit REF with absolute row references
            { id: 'row-5', price: '=REF(COLUMN("A",true),ROW("1",true))+REF(COLUMN("A",true),ROW("2",true))' },
        ];

        const gridOptions: GridOptions = {
            defaultColDef: {
                allowFormula: true,
            },
            rowNumbers: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [
                {
                    field: 'price',
                    headerName: 'price',
                    valueFormatter: (params) => (params.value != null ? `$${params.value}` : ''),
                },
            ],
        };

        const api = gridsManager.createGrid('formulas-excel-formatter', gridOptions);
        await new GridColumns(api, `excel export with value formatter exports formula not formatted value setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                └── price width:200
            `);
        await new GridRows(api, `excel export with value formatter exports formula not formatted value setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:row-1 row-number:"1" price:"$100"
                ├── LEAF id:row-2 row-number:"2" price:"$200"
                ├── LEAF id:row-3 row-number:"3" price:"$300"
                ├── LEAF id:row-4 row-number:"4" price:"$300"
                └── LEAF id:row-5 row-number:"5" price:"$300"
            `
        );
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        api.exportDataAsExcel({ fileName: 'test.xlsx' });

        const sheet = await getExcelSheet(await objectUrls.pullBlob());

        // Values should be exported (not formatted)
        expect(sheet['A2']?.v).toBe(100);
        expect(sheet['A3']?.v).toBe(200);

        // Formula cells should have formulas, not the formatted values
        // Third row - relative formula adjusted for header row offset
        expect(sheet['A4']?.f).toBe('A2+A3');

        // Fourth row - explicit REF with row ids converted to relative Excel references
        expect(sheet['A5']?.f).toBe('A2+A3');

        // Fifth row - explicit REF with absolute references
        expect(sheet['A6']?.f).toBe('$A$1+$A$2');
        await new GridRows(api, `excel export with value formatter exports formula not formatted value final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:row-1 row-number:"1" price:"$100"
                ├── LEAF id:row-2 row-number:"2" price:"$200"
                ├── LEAF id:row-3 row-number:"3" price:"$300"
                ├── LEAF id:row-4 row-number:"4" price:"$300"
                └── LEAF id:row-5 row-number:"5" price:"$300"
            `);
    });

    test('excel export with non-formula column treats = as text', async () => {
        const rowData = [
            { id: 'row-1', text: 'Hello' },
            { id: 'row-2', text: '=Not a formula' },
        ];

        const gridOptions: GridOptions = {
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [
                {
                    field: 'text',
                    headerName: 'text',
                    allowFormula: false, // Formulas disabled for this column
                },
            ],
        };

        const api = gridsManager.createGrid('formulas-excel-disabled', gridOptions);
        await new GridColumns(api, `excel export with non-formula column treats = as text setup`).checkColumns(`
            CENTER
            └── text width:200
        `);
        await new GridRows(api, `excel export with non-formula column treats = as text setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:row-1 text:"Hello"
            └── LEAF id:row-2 text:"=Not a formula"
        `);

        api.exportDataAsExcel({ fileName: 'test.xlsx' });

        const sheet = await getExcelSheet(await objectUrls.pullBlob());

        // Without allowFormula, the = prefix should just be treated as text
        expect(sheet['A2']?.v).toBe('Hello');
        expect(sheet['A2']?.f).toBeUndefined(); // No formula

        expect(sheet['A3']?.v).toBe('=Not a formula');
        expect(sheet['A3']?.f).toBeUndefined();
        await new GridRows(api, `excel export with non-formula column treats = as text final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:row-1 text:"Hello"
            └── LEAF id:row-2 text:"=Not a formula"
        `); // No formula, just text value
    });

    test('excel export non-formula values are not affected by formula processing', async () => {
        const rowData = [
            { id: 'row-1', num: 42, text: 'hello' },
            { id: 'row-2', num: 3.14, text: 'world' },
            { id: 'row-3', num: 0, text: '' },
        ];

        const gridOptions: GridOptions = {
            defaultColDef: {
                allowFormula: true,
            },
            rowNumbers: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [
                { field: 'num', headerName: 'num' },
                { field: 'text', headerName: 'text' },
            ],
        };

        const api = gridsManager.createGrid('formulas-excel-non-formula', gridOptions);
        await new GridColumns(api, `excel export non-formula values are not affected by formula processing setup`)
            .checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── num width:200
                └── text width:200
            `);
        await new GridRows(api, `excel export non-formula values are not affected by formula processing setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:row-1 row-number:"1" num:42 text:"hello"
                ├── LEAF id:row-2 row-number:"2" num:3.14 text:"world"
                └── LEAF id:row-3 row-number:"3" num:0 text:""
            `
        );
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        api.exportDataAsExcel({ fileName: 'test.xlsx' });

        const sheet = await getExcelSheet(await objectUrls.pullBlob());

        // All values should be preserved exactly, no formula conversion
        expect(sheet['A2']?.v).toBe(42);
        expect(sheet['A2']?.f).toBeUndefined();
        expect(sheet['B2']?.v).toBe('hello');
        expect(sheet['B2']?.f).toBeUndefined();

        expect(sheet['A3']?.v).toBe(3.14);
        expect(sheet['B3']?.v).toBe('world');

        expect(sheet['A4']?.v).toBe(0);
        // Empty string cell might not be present or be empty
        expect(sheet['B4']?.v ?? '').toBe('');
        await new GridRows(api, `excel export non-formula values are not affected by formula processing final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:row-1 row-number:"1" num:42 text:"hello"
                ├── LEAF id:row-2 row-number:"2" num:3.14 text:"world"
                └── LEAF id:row-3 row-number:"3" num:0 text:""
            `);
    });

    test('excel export with number valueFormatter exports numeric values not formatted strings', async () => {
        const rowData = [
            { id: 'row-1', price: 1234.56 },
            { id: 'row-2', price: 7890 },
            { id: 'row-3', price: -42.5 },
        ];

        const gridOptions: GridOptions = {
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [
                {
                    field: 'price',
                    headerName: 'price',
                    // Number formatter that adds currency symbol
                    valueFormatter: (params) => (params.value != null ? `£${params.value.toFixed(2)}` : ''),
                },
            ],
        };

        const api = gridsManager.createGrid('excel-number-formatter', gridOptions);
        await new GridColumns(
            api,
            `excel export with number valueFormatter exports numeric values not formatted str setup`
        ).checkColumns(`
            CENTER
            └── price width:200
        `);
        await new GridRows(
            api,
            `excel export with number valueFormatter exports numeric values not formatted str setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:row-1 price:"£1234.56"
            ├── LEAF id:row-2 price:"£7890.00"
            └── LEAF id:row-3 price:"£-42.50"
        `);

        api.exportDataAsExcel({ fileName: 'test.xlsx' });

        const sheet = await getExcelSheet(await objectUrls.pullBlob());

        // Numbers should be exported as numeric values, NOT as formatted strings
        // This preserves the ability to use them in Excel formulas
        expect(sheet['A2']?.v).toBe(1234.56);
        expect(sheet['A2']?.t).toBe('n'); // 'n' = number type
        expect(sheet['A2']?.f).toBeUndefined(); // Not a formula

        expect(sheet['A3']?.v).toBe(7890);
        expect(sheet['A3']?.t).toBe('n');

        expect(sheet['A4']?.v).toBe(-42.5);
        expect(sheet['A4']?.t).toBe('n');
        await new GridRows(
            api,
            `excel export with number valueFormatter exports numeric values not formatted str final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:row-1 price:"£1234.56"
            ├── LEAF id:row-2 price:"£7890.00"
            └── LEAF id:row-3 price:"£-42.50"
        `);
    });

    test('excel export with number valueFormatter and formulas exports formulas correctly', async () => {
        const rowData = [
            { id: 'row-1', price: 100 },
            { id: 'row-2', price: 200 },
            // Relative formula syntax
            { id: 'row-3', price: '=SUM(A1:A2)' },
            // Explicit REF with row ids (relative references)
            { id: 'row-4', price: '=REF(COLUMN("price"),ROW("row-1"))+REF(COLUMN("price"),ROW("row-2"))' },
            // Explicit REF with absolute references
            { id: 'row-5', price: '=REF(COLUMN("A",true),ROW("1",true))+REF(COLUMN("A",true),ROW("2",true))' },
        ];

        const gridOptions: GridOptions = {
            defaultColDef: {
                allowFormula: true,
            },
            rowNumbers: true,
            rowData,
            getRowId: (params) => params.data?.id,
            columnDefs: [
                {
                    field: 'price',
                    headerName: 'price',
                    // Number formatter - should NOT affect formulas
                    valueFormatter: (params) => {
                        return params.value != null ? `£${params.value.toFixed(2)}` : '';
                    },
                },
            ],
        };

        const api = gridsManager.createGrid('excel-number-formatter-formulas', gridOptions);
        await new GridColumns(
            api,
            `excel export with number valueFormatter and formulas exports formulas correctly setup`
        ).checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            └── price width:200
        `);
        await new GridRows(api, `excel export with number valueFormatter and formulas exports formulas correctly setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:row-1 row-number:"1" price:"£100.00"
                ├── LEAF id:row-2 row-number:"2" price:"£200.00"
                ├── LEAF id:row-3 row-number:"3" price:"£300.00"
                ├── LEAF id:row-4 row-number:"4" price:"£300.00"
                └── LEAF id:row-5 row-number:"5" price:"£300.00"
            `);
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        api.exportDataAsExcel({ fileName: 'test.xlsx' });

        const sheet = await getExcelSheet(await objectUrls.pullBlob());

        // Numbers should be exported as numeric values
        expect(sheet['A2']?.v).toBe(100);
        expect(sheet['A2']?.t).toBe('n');
        expect(sheet['A2']?.f).toBeUndefined();

        expect(sheet['A3']?.v).toBe(200);
        expect(sheet['A3']?.t).toBe('n');
        expect(sheet['A3']?.f).toBeUndefined();

        // Formula cells should have formulas, not the formatted values
        // Third row - relative formula adjusted for header row offset
        expect(sheet['A4']?.f).toBe('SUM(A2:A3)');

        // Fourth row - explicit REF with row ids converted to relative Excel references
        expect(sheet['A5']?.f).toBe('A2+A3');

        // Fifth row - explicit REF with absolute references
        expect(sheet['A6']?.f).toBe('$A$1+$A$2');
        await new GridRows(
            api,
            `excel export with number valueFormatter and formulas exports formulas correctly final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:row-1 row-number:"1" price:"£100.00"
            ├── LEAF id:row-2 row-number:"2" price:"£200.00"
            ├── LEAF id:row-3 row-number:"3" price:"£300.00"
            ├── LEAF id:row-4 row-number:"4" price:"£300.00"
            └── LEAF id:row-5 row-number:"5" price:"£300.00"
        `);
    });
});

async function getExcelSheet(blob: Blob): Promise<WorkSheet> {
    const workbook = XLSX.read(new Uint8Array(await blob.arrayBuffer()), { type: 'array' });
    return workbook.Sheets[workbook.SheetNames[0]];
}
