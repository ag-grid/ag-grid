import {
  FirstDataRenderedEvent,
  GridApi,
  createGrid,
  GridOptions,
  IFiltersToolPanel,
} from '@ag-grid-community/core';

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
  gridApi!.setGridOption('rowData', newData)
}

function reset() {
  gridApi!.setFilterModel(null);
  gridApi!.setGridOption('rowData', getRowData());
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.getToolPanelInstance('filters')!.expandFilters();
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);
