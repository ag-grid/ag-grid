import { GridApi, createGrid, ColumnState, GridOptions } from '@ag-grid-community/core';

let api: GridApi<IOlympicData>;

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
  var state = api!.getColumnState()
  console.log(state)
}

function saveState() {
  savedState = api!.getColumnState()
  savedPivotMode = api!.isPivotMode()
  console.log('column state saved')
}

function restoreState() {
  if (savedState) {
    // Pivot mode must be set first otherwise the columns we're trying to set state for won't exist yet
    api!.setPivotMode(savedPivotMode)
    api!.applyColumnState({ state: savedState, applyOrder: true })
    console.log('column state restored')
  } else {
    console.log('no previous column state to restore!')
  }
}

function togglePivotMode() {
  var pivotMode = api!.isPivotMode()
  api!.setPivotMode(!pivotMode)
}

function resetState() {
  api!.resetColumnState()
  api!.setPivotMode(false)
  console.log('column state reset')
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => api!.setRowData(data))
})
