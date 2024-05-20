import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

var rowData = [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
];

let gridApi: GridApi;

// let the grid know which columns and what data to use
const gridOptions: GridOptions = {
    columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],
    rowData: rowData,
    onGridReady: (params) => {
        window.addEventListener('resize', () => {
            setTimeout(() => {
                params.api.sizeColumnsToFit();
            });
        });
    },
    autoSizeStrategy: {
        type: 'fitGridWidth',
    },
};

document.addEventListener('DOMContentLoaded', function () {
    var eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(eGridDiv, gridOptions);
});
