import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const columnDefs: ColDef[] = [{ headerName: 'Locale-specific Sort', field: 'letter', sort: 'asc', accentedSort: true }];

function applyLocale() {
    gridApi!.updateGridOptions({
        columnDefs: [{ field: 'letter', sort: 'asc', headerName: 'Locale-specific Sort', accentedSort: true }],
    });
}

function applySwedish() {
    gridApi!.updateGridOptions({
        columnDefs: [{ field: 'letter', sort: 'asc', headerName: 'Swedish Sort', accentedSort: { locales: 'sv' } }],
    });
}

function applyDefault() {
    gridApi!.updateGridOptions({
        columnDefs: [{ field: 'letter', sort: 'asc', headerName: 'Default Sort', accentedSort: false }],
    });
}

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: columnDefs,
    rowData: [...'bàacäz'].map((x) => ({ letter: x })),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
