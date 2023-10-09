import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';

let api: GridApi<IOlympicData>;

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
    sortable: true,
    resizable: true,
  },
  autoGroupColumnDef: {
    minWidth: 250,
  },
  sideBar: 'columns',
}

function onBtNormal() {
  api!.setPivotMode(false)
  api!.applyColumnState({
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
  api!.setPivotMode(true)
  api!.applyColumnState({
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
  api!.setPivotMode(true)
  api!.applyColumnState({
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
  api = createGrid(gridDiv, gridOptions);;

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => api!.setRowData(data))
})
