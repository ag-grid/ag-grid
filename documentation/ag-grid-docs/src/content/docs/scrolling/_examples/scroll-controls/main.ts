import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    ScrollApiModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ScrollApiModule]);

let gridApi: GridApi;

const COLUMN_COUNT = 20;

const columnDefs: ColDef[] = Array.from({ length: COLUMN_COUNT }, (_, i) => ({
    field: `c${i}`,
    headerName: `Column ${i + 1}`,
    width: 150,
}));

const rowData = Array.from({ length: 200 }, (_, row) =>
    Object.fromEntries(Array.from({ length: COLUMN_COUNT }, (_, col) => [`c${col}`, `Row ${row}, column ${col + 1}`]))
);

const gridOptions: GridOptions = {
    columnDefs,
    rowData,
};

function getInput(id: string) {
    return document.querySelector<HTMLInputElement>(`#${id}`)!;
}

function getSelect(id: string) {
    return document.querySelector<HTMLSelectElement>(`#${id}`)!;
}

function onEnsureIndexVisible() {
    const position = getSelect('rowPosition').value as 'auto' | 'top' | 'middle' | 'bottom';
    gridApi.ensureIndexVisible(Number(getInput('rowIndex').value), position);
}

function onEnsureColumnVisible() {
    const position = getSelect('columnPosition').value as 'auto' | 'start' | 'middle' | 'end';
    gridApi.ensureColumnVisible(`c${Number(getInput('columnNumber').value) - 1}`, position);
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
