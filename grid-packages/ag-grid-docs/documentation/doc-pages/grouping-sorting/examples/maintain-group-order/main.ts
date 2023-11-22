import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";

let gridApi: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'assignee', rowGroup: true, hide: true },
    { field: 'priority', rowGroup: true, hide: true },
    { field: 'task' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
  },
  autoGroupColumnDef: {
    sort: 'desc',
    minWidth: 200,
  },
  groupDisplayType: 'multipleColumns',
  groupMaintainOrder: true,
  groupDefaultExpanded: -1,
  rowData: getData(),
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
