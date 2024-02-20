import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  // row group columns
  { field: 'country', rowGroup: true },
  { field: 'athlete', rowGroup: true },

  // pivot column
  {
    headerName: 'Year',
    // to mix it up a bit, here we are using a valueGetter for the year column.
    valueGetter: 'data.year',
    pivot: true,
  },

  // aggregation columns
  { field: 'gold', aggFunc: 'sum' },
  { field: 'silver', aggFunc: 'sum' },
  { field: 'bronze', aggFunc: 'sum' },
  { field: 'total', aggFunc: 'sum' },
]

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    enableRowGroup: true,
    enablePivot: true,
    enableValue: true,
    filter: true,
  },
  autoGroupColumnDef: {
    minWidth: 250,
  },
  pivotMode: true,
  groupDefaultExpanded: 9,
  groupHideOpenParents: true,
  groupDisplayType: 'multipleColumns',
  sideBar: true,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);


  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {
      gridApi!.setGridOption('rowData', data)
    })
})
