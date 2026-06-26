import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const columnDefs: ColDef[] = [{ headerName: 'Locale-specific Sort', field: 'letter', sort: 'asc' }];

function applyLocale() {
    gridApi!.updateGridOptions({
        accentedSort: true,
        columnDefs: [{ field: 'letter', sort: 'asc', headerName: 'Locale-specific Sort' }],
    });
}

function applyDefault() {
    gridApi!.updateGridOptions({
        accentedSort: false,
        columnDefs: [{ field: 'letter', sort: 'asc', headerName: 'Default Sort' }],
    });
}

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: columnDefs,
    accentedSort: true,
    rowData: [...'bàac'].map((x) => ({ letter: x })),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
