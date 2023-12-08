import {
  FirstDataRenderedEvent,
  GridApi,
  createGrid,
  GridOptions,
  IFiltersToolPanel,
} from '@ag-grid-community/core';

const gridOptions: GridOptions = {
  rowData: getRowData(),
  columnDefs: [
    {
      headerName: 'Set Filter Column',
      field: 'col1',
      filter: 'agSetColumnFilter',
      editable: true,
      flex: 1,
    },
  ],
  sideBar: 'filters',
  onFirstDataRendered: onFirstDataRendered,
}

function getRowData() {
  return [
    { col1: 'A' },
    { col1: 'A' },
    { col1: 'B' },
    { col1: 'B' },
    { col1: 'C' },
    { col1: 'C' },
  ]
}

function updateFirstRow() {
  var firstRow = gridApi!.getDisplayedRowAtIndex(0)
  if (firstRow) {
    var firstRowData = firstRow.data
    firstRowData['col1'] += 'X'
    gridApi!.applyTransaction({ update: [firstRowData] })
  }
}

function addDRow() {
  gridApi!.applyTransaction({ add: [{ col1: 'D' }] })
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
