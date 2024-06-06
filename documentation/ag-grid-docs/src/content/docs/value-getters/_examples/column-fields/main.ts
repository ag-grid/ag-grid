import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    // define grid columns
    columnDefs: [
        { headerName: 'Name (field)', field: 'name' },
        // Using dot notation to access nested property
        { headerName: 'Country (field & dot notation)', field: 'person.country' },
        // Show default header name
        {
            headerName: 'Total Medals (valueGetter)',
            valueGetter: (p) => p.data.medals.gold + p.data.medals.silver + p.data.medals.bronze,
        },
    ],
    defaultColDef: {
        flex: 1,
    },
    rowData: getData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
