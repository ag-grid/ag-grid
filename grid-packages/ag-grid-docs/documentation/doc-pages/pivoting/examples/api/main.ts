import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    {
      field: 'athlete',
      enableRowGroup: true,
      enablePivot: true,
      minWidth: 200,
    },
    { field: 'age', enableValue: true },
    { field: 'country', enableRowGroup: true, enablePivot: true },
    { field: 'year', enableRowGroup: true, enablePivot: true },
    { field: 'date', enableRowGroup: true, enablePivot: true },
    { field: 'sport', enableRowGroup: true, enablePivot: true, minWidth: 200 },
    { field: 'gold', enableValue: true, aggFunc: 'sum' },
    { field: 'silver', enableValue: true },
    { field: 'bronze', enableValue: true },
    { field: 'total', enableValue: true },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    filter: true,
    resizable: true,
  },
  autoGroupColumnDef: {
    minWidth: 250,
  },
  sideBar: true,
}

function turnOffPivotMode() {
  gridOptions.columnApi!.setPivotMode(false)
}

function turnOnPivotMode() {
  gridOptions.columnApi!.setPivotMode(true)
}

function addPivotColumn() {
  gridOptions.columnApi!.applyColumnState({
    state: [{ colId: 'country', pivot: true }],
    defaultState: { pivot: false },
  })
}

function addPivotColumns() {
  gridOptions.columnApi!.applyColumnState({
    state: [
      { colId: 'year', pivot: true },
      { colId: 'country', pivot: true },
    ],
    defaultState: { pivot: false },
  })
}

function removePivotColumn() {
  gridOptions.columnApi!.applyColumnState({
    state: [{ colId: 'country', pivot: false }],
  })
}

function emptyPivotColumns() {
  gridOptions.columnApi!.applyColumnState({
    defaultState: { pivot: false },
  })
}

function exportToCsv() {
  gridOptions.api!.exportDataAsCsv()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
