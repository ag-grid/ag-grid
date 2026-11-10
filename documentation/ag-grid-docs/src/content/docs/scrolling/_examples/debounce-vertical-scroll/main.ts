import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'row' }, { field: 'name' }],
    defaultColDef: { flex: 1 },
    rowData: Array.from({ length: 1000 }, (_, index) => ({ row: index + 1, name: `Item ${index + 1}` })),
    rowHeight: 40,
    debounceVerticalScrollbar: false,
};

function onDebounceChange() {
    const checkbox = document.querySelector<HTMLInputElement>('#debounce')!;
    // debounceVerticalScrollbar is initial-only, so changing it requires a new grid.
    gridApi.destroy();
    gridOptions.debounceVerticalScrollbar = checkbox.checked;
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
