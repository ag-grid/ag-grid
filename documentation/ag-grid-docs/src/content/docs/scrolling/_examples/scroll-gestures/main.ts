import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    ScrollGestureModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ScrollGestureModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: Array.from({ length: 10 }, (_, i) => ({ field: `c${i}`, headerName: `Column ${i + 1}` })),
    defaultColDef: { width: 180 },
    rowData: Array.from({ length: 100 }, (_, row) =>
        Object.fromEntries(Array.from({ length: 10 }, (_, col) => [`c${col}`, `Row ${row + 1}, column ${col + 1}`]))
    ),
    scrollGestureMode: 'native',
};

function onScrollGestureModeChange() {
    const select = document.querySelector<HTMLSelectElement>('#scrollGestureMode')!;
    gridApi.setGridOption('scrollGestureMode', select.value as GridOptions['scrollGestureMode']);
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
