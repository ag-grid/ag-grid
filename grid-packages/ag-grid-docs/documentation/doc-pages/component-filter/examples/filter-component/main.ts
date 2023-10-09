import { ColDef, GridApi, createGrid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";
import { PartialMatchFilter } from './partialMatchFilter_typescript';


const columnDefs: ColDef[] = [
    { field: 'row' },
    {
        field: 'name',
        filter: PartialMatchFilter,
    },
]

let api: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true,
    },
    columnDefs: columnDefs,
    rowData: getData()
}

function onClicked() {
    api!.getFilterInstance<PartialMatchFilter>('name', function (instance) {
        instance!.componentMethod('Hello World!');
    })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    api = createGrid(gridDiv, gridOptions);;
    api!.sizeColumnsToFit()
})
