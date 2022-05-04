import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', rowGroup: true, enableRowGroup: true, hide: true },
    {
        field: 'gold',
        aggFunc: 'sum',
        // restricts agg functions to be: `sum`, `min` and `max`
        allowedAggFuncs: ['sum', 'min', 'max'],
    },
    { field: 'silver', aggFunc: 'sum' },
  ],
  defaultColDef: {
    flex: 1,
  },
  autoGroupColumnDef: {
    minWidth: 180,
  },
  sideBar: 'columns',
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
