import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";

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

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);
