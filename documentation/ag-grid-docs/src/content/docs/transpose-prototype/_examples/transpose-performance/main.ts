import type { ColDef, ColGroupDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    ScrollApiModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { TransposeModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ClientSideRowModelApiModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    ScrollApiModule,
    TransposeModule,
    CellStyleModule,
    TextEditorModule,
    NumberEditorModule,
    NumberFilterModule,
    ValidationModule,
]);

const FIELD_GROUPS = 5;
const FIELDS_PER_GROUP = 5;

interface Row {
    id: string;
    name: string;
    [field: string]: string | number;
}

const columnDefs: (ColDef<Row> | ColGroupDef<Row>)[] = [{ field: 'name' }];
for (let g = 0; g < FIELD_GROUPS; g++) {
    const children: ColDef<Row>[] = [];
    for (let f = 0; f < FIELDS_PER_GROUP; f++) {
        children.push({
            field: `f${g}_${f}`,
            valueFormatter: (params) => (params.value == null ? '' : `£${params.value}m`),
        });
    }
    columnDefs.push({ headerName: `Group ${g + 1}`, children });
}

function createRow(i: number): Row {
    const row: Row = { id: `r${i}`, name: `Record ${i}` };
    for (let g = 0; g < FIELD_GROUPS; g++) {
        for (let f = 0; f < FIELDS_PER_GROUP; f++) {
            row[`f${g}_${f}`] = (i * 31 + g * 7 + f * 13) % 1000;
        }
    }
    return row;
}

let gridApi: GridApi<Row>;
let rowCount = 0;

const gridOptions: GridOptions<Row> = {
    columnDefs,
    defaultColDef: { width: 120, editable: true, filter: true },
    getRowId: (params) => params.data.id,
    rowData: [],
    transpose: true,
    transposeHeaderColId: 'name',
    suppressColumnVirtualisation: new URLSearchParams(location.search).has('novirt'),
};

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const idle = () => new Promise<void>((resolve) => requestIdleCallback(() => resolve(), { timeout: 20000 }));

let longestTask = 0;
new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        longestTask = Math.max(longestTask, entry.duration);
    }
}).observe({ type: 'longtask', buffered: false });

async function measure(label: string, action: () => void) {
    longestTask = 0;
    const start = performance.now();
    action();
    const sync = performance.now() - start;
    await nextFrame();
    await idle();
    const total = performance.now() - start;
    const cols = gridApi.getAllDisplayedColumns().length;
    log(
        `${label}: sync ${sync.toFixed(0)} ms, until idle ${total.toFixed(0)} ms, longest task ${longestTask.toFixed(0)} ms ` +
            `(records ${rowCount}, columns ${cols}, transpose ${gridApi.getGridOption('transpose')})`
    );
}

function log(message: string) {
    const eLog = document.querySelector<HTMLElement>('#eventLog')!;
    eLog.textContent = message + '\n' + eLog.textContent;
}

async function load(count: number) {
    const rows: Row[] = [];
    for (let i = 0; i < count; i++) {
        rows.push(createRow(i));
    }
    rowCount = count;
    await measure(`Load ${count}`, () => gridApi.setGridOption('rowData', rows));
}

async function toggleTranspose() {
    const transpose = !gridApi.getGridOption('transpose');
    await measure(transpose ? 'Enable transpose' : 'Disable transpose', () =>
        gridApi.setGridOption('transpose', transpose)
    );
}

async function sortField() {
    const current = gridApi.getColumnState().find((state) => state.colId === 'f1_1')?.sort;
    await measure('Sort', () =>
        gridApi.applyColumnState({
            state: [{ colId: 'f1_1', sort: current === 'desc' ? 'asc' : 'desc' }],
            defaultState: { sort: null },
        })
    );
}

async function updateValue() {
    const row = createRow(0);
    row.f0_0 = Math.round(Math.random() * 1000);
    await measure('Update one value', () => gridApi.applyTransaction({ update: [row] }));
}

async function addRecord() {
    rowCount++;
    await measure('Add one record', () => gridApi.applyTransaction({ add: [createRow(rowCount + 100000)] }));
}

async function scrollToEnd() {
    const cols = gridApi.getAllDisplayedColumns();
    await measure('Scroll to last column', () => gridApi.ensureColumnVisible(cols[cols.length - 1]));
}

async function renameRecord() {
    const row = createRow(0);
    row.name = `Record 0 (${Math.round(Math.random() * 1000)})`;
    await measure('Rename one record', () => gridApi.applyTransaction({ update: [row] }));
}

async function autoSizeAll() {
    await measure('Auto-size all columns', () => gridApi.autoSizeAllColumns());
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
