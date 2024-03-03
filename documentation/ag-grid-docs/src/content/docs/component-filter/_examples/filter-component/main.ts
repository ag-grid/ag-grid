import { ColDef, GridApi, createGrid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

import { PartialMatchFilter } from './partialMatchFilter_typescript';


const columnDefs: ColDef[] = [
    { field: 'row' },
    {
        field: 'name',
        filter: PartialMatchFilter,
    },
]

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    columnDefs: columnDefs,
    rowData: getData(),
}

function onClicked() {
    gridApi!.getColumnFilterInstance<PartialMatchFilter>('name').then(instance => {
        instance!.componentMethod('Hello World!');
    })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    gridApi = createGrid(gridDiv, gridOptions);
})