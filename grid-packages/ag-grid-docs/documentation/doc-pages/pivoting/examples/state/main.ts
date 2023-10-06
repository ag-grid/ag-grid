import { Grid, ColumnState, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'athlete', enableRowGroup: true, enablePivot: true },
    { field: 'age', enableValue: true },
    { field: 'country', enableRowGroup: true, enablePivot: true, rowGroup: true },
    { field: 'year', enableRowGroup: true, enablePivot: true },
    { field: 'date', enableRowGroup: true, enablePivot: true },
    { field: 'sport', enableRowGroup: true, enablePivot: true, pivot: true },
    { field: 'gold', enableValue: true, aggFunc: 'sum' },
    { field: 'silver', enableValue: true, aggFunc: 'sum' },
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
    minWidth: 300,
  },
  sideBar: true,
  pivotMode: true,
}

var savedState: ColumnState[];
var savedPivotMode: boolean;

function printState() {
  var state = gridOptions.api!.getColumnState()
  console.log(state)
}

function saveState() {
  savedState = gridOptions.api!.getColumnState()
  savedPivotMode = gridOptions.api!.isPivotMode()
  console.log('column state saved')
}

function restoreState() {
  if (savedState) {
    // Pivot mode must be set first otherwise the columns we're trying to set state for won't exist yet
    gridOptions.api!.setPivotMode(savedPivotMode)
    gridOptions.api!.applyColumnState({ state: savedState, applyOrder: true })
    console.log('column state restored')
  } else {
    console.log('no previous column state to restore!')
  }
}

function togglePivotMode() {
  var pivotMode = gridOptions.api!.isPivotMode()
  gridOptions.api!.setPivotMode(!pivotMode)
}

function resetState() {
  gridOptions.api!.resetColumnState()
  gridOptions.api!.setPivotMode(false)
  console.log('column state reset')
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
