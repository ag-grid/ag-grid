import { ClientSideRowModelModule } from 'ag-grid-community';
import { ColDef, GridApi, GridOptions, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    { headerName: 'ID', valueGetter: 'node.rowIndex + 1', width: 70 },
    { field: 'model', width: 150 },
    { field: 'color' },
    { field: 'price', valueFormatter: '"$" + value.toLocaleString()' },
    { field: 'year' },
    { field: 'country' },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: columnDefs,
    rowData: getData(),
    defaultColDef: {
        width: 100,
    },
};

function onBtPrinterFriendly() {
    var eGridDiv = document.querySelector<HTMLElement>('#myGrid')! as any;
    eGridDiv.style.width = '';
    eGridDiv.style.height = '';

    gridApi!.setGridOption('domLayout', 'print');
}

function onBtNormal() {
    var eGridDiv = document.querySelector<HTMLElement>('#myGrid')! as any;
    eGridDiv.style.width = '400px';
    eGridDiv.style.height = '200px';

    // Same as setting to 'normal' as it is the default
    gridApi!.setGridOption('domLayout', undefined);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
