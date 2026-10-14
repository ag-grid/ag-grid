import type { ColDef, ColGroupDef, GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    CsvExportModule,
    ModuleRegistry,
    NumberEditorModule,
    RowApiModule,
    TextEditorModule,
    UndoRedoEditModule,
    ValidationModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { CellSelectionModule, ClipboardModule, ExcelExportModule, TransposeModule } from 'ag-grid-enterprise';

import type { CompanyRecord } from './data';
import { getData } from './data';

if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClientSideRowModelApiModule,
    ColumnApiModule,
    TransposeModule,
    CellStyleModule,
    TextEditorModule,
    NumberEditorModule,
    UndoRedoEditModule,
    RowApiModule,
    CsvExportModule,
    ExcelExportModule,
    ClipboardModule,
    CellSelectionModule,
    ValidationModule,
]);

const currency = (params: ValueFormatterParams) =>
    params.value == null ? '' : `£${Number(params.value).toLocaleString('en-GB')}m`;

const columnDefs: (ColDef<CompanyRecord> | ColGroupDef<CompanyRecord>)[] = [
    { field: 'name', headerName: 'Company' },
    { headerName: 'Details', children: [{ field: 'region' }, { field: 'sector' }] },
    {
        headerName: 'Income Statement',
        children: [
            { field: 'revenue', valueFormatter: currency },
            { field: 'costOfSales', headerName: 'Cost of Sales', valueFormatter: currency },
        ],
    },
];

let gridApi: GridApi<CompanyRecord>;
let lastClipboard: string | null = null;
let fakeClipboardText = '';

const gridOptions: GridOptions<CompanyRecord> = {
    columnDefs,
    defaultColDef: { width: 130, editable: true },
    getRowId: (params) => params.data.id,
    rowData: getData(),
    transpose: true,
    transposeHeaderColId: 'name',
    cellSelection: true,
    undoRedoCellEditing: true,
    sendToClipboard: (params) => {
        lastClipboard = params.data;
    },
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function log(message: string) {
    const eLog = document.querySelector<HTMLElement>('#eventLog')!;
    eLog.textContent += message + '\n';
}

function fieldRowIndex(colId: string): number {
    for (let i = 0; i < gridApi.getDisplayedRowCount(); i++) {
        if (gridApi.getDisplayedRowAtIndex(i)?.id === `ag-Grid-TransposeField-${colId}`) {
            return i;
        }
    }
    return -1;
}

const recordCol = (recordId: string) => `ag-Grid-TransposeRecord-${recordId}`;
const record = (recordId: string) => gridApi.getRowNode(recordId)!.data!;

async function check(name: string, run: () => Promise<string> | string) {
    try {
        log(`PASS ${name}: ${await run()}`);
    } catch (error) {
        log(`FAIL ${name}: ${(error as Error).message}`);
    }
}

function expect(condition: boolean, detail: string) {
    if (!condition) {
        throw new Error(detail);
    }
}

async function runChecks() {
    document.querySelector<HTMLElement>('#eventLog')!.textContent = '';
    gridApi.setGridOption('rowData', getData());
    await wait(100);
    const revenueRow = fieldRowIndex('revenue');
    const costRow = fieldRowIndex('costOfSales');

    await check('CSV export', () => {
        const lines = gridApi.getDataAsCsv()!.split('\n');
        const revenueLine = lines.find((line) => line.startsWith('"Revenue"')) ?? '';
        expect(
            lines[0].includes('Northwind') && revenueLine.includes('400'),
            `${lines.length - 1} data rows, first ${JSON.stringify(lines.slice(0, 3))}`
        );
        return `header ${lines[0]} | revenue ${revenueLine}`;
    });

    await check('Excel export', () => {
        const blob = gridApi.getDataAsExcel() as Blob | undefined;
        expect(!!blob && blob.size > 0, 'no workbook produced');
        return `${blob!.size} bytes`;
    });

    await check('Copy a range of transposed cells', async () => {
        lastClipboard = null;
        gridApi.clearCellSelection();
        gridApi.addCellRange({
            rowStartIndex: revenueRow,
            rowEndIndex: costRow,
            columns: [recordCol('rec-0'), recordCol('rec-1')],
        });
        gridApi.copySelectedRangeToClipboard();
        await wait(100);
        expect(
            !!lastClipboard && lastClipboard.includes('400') && lastClipboard.includes('537'),
            `got ${JSON.stringify(lastClipboard)}`
        );
        return JSON.stringify(lastClipboard);
    });

    await check('Paste into transposed cells', async () => {
        fakeClipboardText = '999\t888';
        gridApi.clearCellSelection();
        gridApi.setFocusedCell(revenueRow, recordCol('rec-0'));
        gridApi.addCellRange({ rowStartIndex: revenueRow, rowEndIndex: revenueRow, columns: [recordCol('rec-0')] });
        gridApi.pasteFromClipboard();
        await wait(300);
        const got = [record('rec-0').revenue, record('rec-1').revenue];
        expect(Number(got[0]) === 999 && Number(got[1]) === 888, `records now hold revenue ${JSON.stringify(got)}`);
        return `Northwind revenue ${got[0]}, Contoso revenue ${got[1]}`;
    });

    await check('Undo and redo an edit made in the transposed view', async () => {
        gridApi.setGridOption('rowData', getData());
        await wait(100);
        const before = record('rec-2').costOfSales;
        gridApi.startEditingCell({ rowIndex: costRow, colKey: recordCol('rec-2') });
        await wait(100);
        const input = document.querySelector<HTMLInputElement>('.ag-cell-inline-editing input');
        expect(!!input, 'editor did not open');
        input!.value = '111';
        input!.dispatchEvent(new Event('input', { bubbles: true }));
        gridApi.stopEditing();
        await wait(100);
        const edited = record('rec-2').costOfSales;
        const undoSize = gridApi.getCurrentUndoSize();
        gridApi.undoCellEditing();
        await wait(100);
        const undone = record('rec-2').costOfSales;
        gridApi.redoCellEditing();
        await wait(100);
        const redone = record('rec-2').costOfSales;
        const detail = `before ${before}, edited ${edited}, undo stack ${undoSize}, after undo ${undone}, after redo ${redone}`;
        expect(Number(edited) === 111 && undone === before && Number(redone) === 111, detail);
        return detail;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { readText: async () => fakeClipboardText, writeText: async () => undefined },
    });
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
