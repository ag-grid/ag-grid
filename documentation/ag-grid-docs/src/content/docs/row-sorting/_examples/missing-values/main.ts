import type { ColDef, GridApi, GridOptions, SortMissingValues } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

function createColumnDefs(sortMissingValues: SortMissingValues): ColDef[] {
    return [
        { field: 'amount', initialSort: 'asc', sortMissingValues },
        { field: 'description', sortable: false },
    ];
}

function setSortMissingValues(sortMissingValues: SortMissingValues) {
    gridApi!.setGridOption('columnDefs', createColumnDefs(sortMissingValues));
}

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: createColumnDefs('last'),
    rowData: [7, undefined, 5, NaN, 0, null, -2].map((amount) => ({ amount, description: String(amount) })),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
