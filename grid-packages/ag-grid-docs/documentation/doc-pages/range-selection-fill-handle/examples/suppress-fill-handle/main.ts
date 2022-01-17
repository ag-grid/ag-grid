import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'athlete', minWidth: 150 },
    { field: 'age', maxWidth: 90 },
    { field: 'country', minWidth: 150, suppressFillHandle: true },
    { field: 'year', maxWidth: 90 },
    { field: 'date', minWidth: 150, suppressFillHandle: true },
    { field: 'sport', minWidth: 150 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    editable: true,
  },
  enableRangeSelection: true,
  enableFillHandle: true,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {
      gridOptions.api!.setRowData(data)
    })
})
