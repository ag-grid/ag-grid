import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

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
    // scrollGestureMode is an initial-only option, so changing it recreates the grid.
    gridApi.destroy();
    gridOptions.scrollGestureMode = select.value as GridOptions['scrollGestureMode'];
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
