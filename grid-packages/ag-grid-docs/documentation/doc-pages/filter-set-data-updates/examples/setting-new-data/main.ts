import {
  FirstDataRenderedEvent,
  GridApi,
  createGrid,
  GridOptions,
  IFiltersToolPanel,
} from '@ag-grid-community/core';

let api: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
    {
      headerName: 'Set Filter Column',
      field: 'col1',
      filter: 'agSetColumnFilter',
      flex: 1,
      editable: true,
    },
  ],
  sideBar: 'filters',
  rowData: getRowData(),
  onFirstDataRendered: onFirstDataRendered,
}

function getRowData() {
  return [{ col1: 'A' }, { col1: 'A' }, { col1: 'B' }, { col1: 'C' }]
}

function setNewData() {
  var newData = [
    { col1: 'A' },
    { col1: 'A' },
    { col1: 'B' },
    { col1: 'C' },
    { col1: 'D' },
    { col1: 'E' },
  ]
  api!.setRowData(newData)
}

function reset() {
  api!.setFilterModel(null);
  api!.setRowData(getRowData());
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.getToolPanelInstance('filters')!.expandFilters();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;
})
