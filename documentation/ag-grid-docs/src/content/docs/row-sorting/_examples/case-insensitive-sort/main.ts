import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

function applyCaseInsensitive() {
    gridApi!.updateGridOptions({
        accentedSort: { options: { sensitivity: 'accent' } },
        columnDefs: [{ field: 'code', sort: 'asc', headerName: 'Case-insensitive Sort' }],
    });
}

function applyDefault() {
    gridApi!.updateGridOptions({
        accentedSort: false,
        columnDefs: [{ field: 'code', sort: 'asc', headerName: 'Default Sort' }],
    });
}

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'code', sort: 'asc', headerName: 'Case-insensitive Sort' }],
    // compare strings ignoring case, so values that differ only in case keep their original order
    accentedSort: { options: { sensitivity: 'accent' } },
    rowData: ['b', 'AA', 'az', 'aa', 'B', 'Aa', 'AZ'].map((code) => ({ code })),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
