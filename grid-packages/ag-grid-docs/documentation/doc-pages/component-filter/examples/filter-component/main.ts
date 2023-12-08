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
    gridApi!.getFilterInstance<PartialMatchFilter>('name', function (instance) {
        instance!.componentMethod('Hello World!');
    })
}

// setup the grid
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  const gridApi: GridApi = createGrid(gridDiv, gridOptions);
