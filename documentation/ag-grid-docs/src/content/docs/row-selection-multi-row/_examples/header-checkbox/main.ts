import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridApi, GridOptions } from '@ag-grid-community/core';
import { createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { headerName: 'Athlete', field: 'athlete', minWidth: 180 },
        { field: 'age' },
        { field: 'country', minWidth: 150 },
        { field: 'year' },
        { field: 'date', minWidth: 150 },
        { field: 'sport', minWidth: 150 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    pagination: true,
    paginationAutoPageSize: true,
    selection: {
        mode: 'multiRow',
        suppressClickSelection: true,
        selectAll: 'all',
    },
};

function onQuickFilterChanged() {
    gridApi!.setGridOption('quickFilterText', document.querySelector<HTMLInputElement>('#quickFilter')?.value);
}

function updateSelectAllMode() {
    const selectAll = document.querySelector<HTMLSelectElement>('#select-all-mode')?.value ?? 'all';

    gridApi.setGridOption('selection', {
        mode: 'multiRow',
        suppressClickSelection: true,
        selectAll: selectAll as 'all' | 'filtered' | 'currentPage',
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data));
});
