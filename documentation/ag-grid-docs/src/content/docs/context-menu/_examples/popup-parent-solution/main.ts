import { ClientSideRowModelModule } from 'ag-grid-community';
import { GridApi, GridOptions, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ClipboardModule } from 'ag-grid-enterprise';
import { ExcelExportModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ClientSideRowModelModule, ClipboardModule, ExcelExportModule, MenuModule]);

var rowData = [
    { a: 1, b: 1, c: 1, d: 1, e: 1 },
    { a: 2, b: 2, c: 2, d: 2, e: 2 },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }, { field: 'e' }],
    rowData: rowData,
    popupParent: document.querySelector('body'),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
