import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', rowGroup: true, enableRowGroup: true },
    { field: 'year', rowGroup: true, enableRowGroup: true, enablePivot: true },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 150,
  },
  autoGroupColumnDef: {
    minWidth: 250,
  },
  sideBar: 'columns',
}

function onBtNormal() {
  gridApi!.setGridOption('pivotMode', false)
  gridApi!.applyColumnState({
    state: [
      { colId: 'country', rowGroup: true },
      { colId: 'year', rowGroup: true },
    ],
    defaultState: {
      pivot: false,
      rowGroup: false,
    },
  })
}

function onBtPivotMode() {
  gridApi!.setGridOption('pivotMode', true)
  gridApi!.applyColumnState({
    state: [
      { colId: 'country', rowGroup: true },
      { colId: 'year', rowGroup: true },
    ],
    defaultState: {
      pivot: false,
      rowGroup: false,
    },
  })
}

function onBtFullPivot() {
  gridApi!.setGridOption('pivotMode', true)
  gridApi!.applyColumnState({
    state: [
      { colId: 'country', rowGroup: true },
      { colId: 'year', pivot: true },
    ],
    defaultState: {
      pivot: false,
      rowGroup: false,
    },
  })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data))
})
