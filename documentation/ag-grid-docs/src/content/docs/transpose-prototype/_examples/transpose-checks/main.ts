import type { ColDef, ColGroupDef, GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    CsvExportModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    RowApiModule,
    RowSelectionModule,
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
    RowSelectionModule,
    NumberFilterModule,
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
            {
                colId: 'grossProfit',
                headerName: 'Gross Profit',
                valueGetter: (params) => params.data!.revenue - params.data!.costOfSales,
                valueFormatter: currency,
            },
        ],
    },
];

let gridApi: GridApi<CompanyRecord>;
let lastClipboard: string | null = null;
// Read through a function: `sendToClipboard` sets it while a check awaits, which narrowing cannot see.
const readClipboard = (): string | null => lastClipboard;
let fakeClipboardText = '';
let uncaughtErrors = 0;
let testHooksInstalled = false;

const gridOptions: GridOptions<CompanyRecord> = {
    columnDefs,
    defaultColDef: { width: 130, editable: true, filter: true },
    rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
    getRowId: (params) => params.data.id,
    rowData: getData(),
    transpose: true,
    transposeHeaderColId: 'name',
    cellSelection: true,
    undoRedoCellEditing: true,
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function log(message: string) {
    const eLog = document.querySelector<HTMLElement>('#eventLog')!;
    eLog.textContent += message + '\n';
}

// Installed on first run: the framework example generators drop top-level statements.
function installTestHooks() {
    if (testHooksInstalled) {
        return;
    }
    testHooksInstalled = true;
    window.addEventListener('error', () => uncaughtErrors++);
    Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { readText: async () => fakeClipboardText, writeText: async () => undefined },
    });
}

function fieldRowIndex(api: GridApi<CompanyRecord>, colId: string): number {
    for (let i = 0; i < api.getDisplayedRowCount(); i++) {
        if (api.getDisplayedRowAtIndex(i)?.id === `ag-Grid-TransposeField-${colId}`) {
            return i;
        }
    }
    return -1;
}

const recordCol = (recordId: string) => `ag-Grid-TransposeRecord-${recordId}`;
const record = (api: GridApi<CompanyRecord>, recordId: string) => api.getRowNode(recordId)!.data!;

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

function runChecks() {
    return runAllChecks(gridApi);
}

async function runAllChecks(api: GridApi<CompanyRecord>) {
    installTestHooks();
    // Set here, not in the grid options, so copying works with the real clipboard until the checks run.
    api.setGridOption('sendToClipboard', (params) => {
        lastClipboard = params.data;
    });
    document.querySelector<HTMLElement>('#eventLog')!.textContent = '';
    api.setGridOption('rowData', getData());
    await wait(100);
    const revenueRow = fieldRowIndex(api, 'revenue');
    const costRow = fieldRowIndex(api, 'costOfSales');

    await check('CSV export', () => {
        const lines = api.getDataAsCsv()!.split('\n');
        const revenueLine = lines.find((line) => line.startsWith('"Revenue"')) ?? '';
        expect(
            lines[0].includes('Northwind') && revenueLine.includes('400'),
            `${lines.length - 1} data rows, first ${JSON.stringify(lines.slice(0, 3))}`
        );
        return `header ${lines[0]} | revenue ${revenueLine}`;
    });

    await check('Excel export', () => {
        const blob = api.getDataAsExcel() as Blob | undefined;
        expect(!!blob && blob.size > 0, 'no workbook produced');
        return `${blob!.size} bytes`;
    });

    await check('Copy a range of transposed cells', async () => {
        lastClipboard = null;
        api.clearCellSelection();
        api.addCellRange({
            rowStartIndex: revenueRow,
            rowEndIndex: costRow,
            columns: [recordCol('rec-0'), recordCol('rec-1')],
        });
        api.copySelectedRangeToClipboard();
        await wait(100);
        const copied = readClipboard();
        expect(!!copied && copied.includes('400') && copied.includes('537'), `got ${JSON.stringify(copied)}`);
        return JSON.stringify(copied);
    });

    await check('Paste into transposed cells', async () => {
        fakeClipboardText = '999\t888';
        api.clearCellSelection();
        api.setFocusedCell(revenueRow, recordCol('rec-0'));
        api.addCellRange({ rowStartIndex: revenueRow, rowEndIndex: revenueRow, columns: [recordCol('rec-0')] });
        api.pasteFromClipboard();
        await wait(300);
        const got = [record(api, 'rec-0').revenue, record(api, 'rec-1').revenue];
        expect(Number(got[0]) === 999 && Number(got[1]) === 888, `records now hold revenue ${JSON.stringify(got)}`);
        return `Northwind revenue ${got[0]}, Contoso revenue ${got[1]}`;
    });

    await check('Undo and redo an edit made in the transposed view', async () => {
        api.setGridOption('rowData', getData());
        await wait(100);
        const before = record(api, 'rec-2').costOfSales;
        api.startEditingCell({ rowIndex: costRow, colKey: recordCol('rec-2') });
        await wait(100);
        const input = document.querySelector<HTMLInputElement>('.ag-cell-inline-editing input');
        expect(!!input, 'editor did not open');
        input!.value = '111';
        input!.dispatchEvent(new Event('input', { bubbles: true }));
        api.stopEditing();
        await wait(100);
        const edited = record(api, 'rec-2').costOfSales;
        const undoSize = api.getCurrentUndoSize();
        api.undoCellEditing();
        await wait(100);
        const undone = record(api, 'rec-2').costOfSales;
        api.redoCellEditing();
        await wait(100);
        const redone = record(api, 'rec-2').costOfSales;
        const detail = `before ${before}, edited ${edited}, undo stack ${undoSize}, after undo ${undone}, after redo ${redone}`;
        expect(Number(edited) === 111 && undone === before && Number(redone) === 111, detail);
        return detail;
    });

    await check('Transaction update refreshes the transposed cell', async () => {
        api.setGridOption('rowData', getData());
        await wait(100);
        const updated = { ...record(api, 'rec-1'), revenue: 4321 };
        api.applyTransaction({ update: [updated] });
        await wait(200);
        const cell = document.querySelector(
            `.ag-row[row-id="ag-Grid-TransposeField-revenue"] .ag-cell[col-id="${recordCol('rec-1')}"]`
        );
        const text = cell?.textContent ?? '';
        expect(text.includes('4,321'), `cell shows ${JSON.stringify(text)}`);
        return `cell shows ${text}`;
    });

    await check('Space on a transposed cell does not select a field row', async () => {
        api.deselectAll();
        api.setFocusedCell(revenueRow, recordCol('rec-0'));
        await wait(50);
        const focused = document.querySelector<HTMLElement>('.ag-cell-focus');
        focused?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }));
        await wait(100);
        const selected = api.getSelectedNodes().map((node) => node.id);
        expect(
            selected.every((id) => !id?.startsWith('ag-Grid-Transpose')),
            `selected ${JSON.stringify(selected)}`
        );
        return `selected ${JSON.stringify(selected)}`;
    });

    await check('A record hidden by a filter keeps its column width', async () => {
        api.setColumnWidths([{ key: recordCol('rec-0'), newWidth: 222 }]);
        await api.setColumnFilterModel('revenue', { type: 'greaterThan', filter: 500 });
        api.onFilterChanged();
        await wait(150);
        const hidden = !api.getAllDisplayedColumns().some((col) => col.getColId() === recordCol('rec-0'));
        await api.setColumnFilterModel('revenue', null);
        api.onFilterChanged();
        await wait(150);
        const width = api.getColumn(recordCol('rec-0'))?.getActualWidth();
        expect(hidden && width === 222, `hidden while filtered: ${hidden}, width after clearing: ${width}`);
        return `hidden while filtered, width after clearing ${width}`;
    });

    await check('Toggling transpose never renders user columns against field rows', async () => {
        const errorsBefore = uncaughtErrors;
        api.setGridOption('transpose', false);
        await wait(200);
        api.setGridOption('transpose', true);
        await wait(200);
        api.setGridOption('transposeRecordColumnDef', { width: 140 });
        await wait(200);
        const errors = uncaughtErrors - errorsBefore;
        expect(errors === 0, `${errors} uncaught errors (Gross Profit's valueGetter reads params.data)`);
        return 'no errors from a valueGetter that reads params.data';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
