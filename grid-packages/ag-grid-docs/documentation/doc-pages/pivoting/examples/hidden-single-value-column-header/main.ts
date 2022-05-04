import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
    columnDefs: [
      { field: 'country', rowGroup: true, enableRowGroup: true },
      { field: 'year', pivot: true, enablePivot: true },
      { field: 'date' },
      { field: 'sport', enablePivot: true, },
      { field: 'gold', aggFunc: 'sum', enableValue: true, },
      { field: 'silver', enableValue: true, },
      { field: 'bronze', enableValue: true },
    ],
    defaultColDef: {
      flex: 1,
      minWidth: 150,
    },
    autoGroupColumnDef: {
      minWidth: 200,
    },
    sideBar: 'columns',
    pivotMode: true,
    removePivotHeaderRowWhenSingleValueColumn: true,
  }

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
