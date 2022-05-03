import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', rowGroup: true, enableRowGroup: true, hide: true },
    {
        field: 'gold',
        // allow gui to set aggregations for this column
        enableValue: true,
        // restrict aggregations to sum, min and max
        allowedAggFuncs: ['sum', 'min', 'max'],
        aggFunc: 'sum',
    },
    { field: 'silver', enableValue: true },
    // Default to using the 'min' aggregation function for this column
    { field: 'bronze', enableValue: true },
  ],
  defaultColDef: {
    flex: 1,
    // Default to using the 'avg' aggregation function for other columns
    defaultAggFunc: 'avg',
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
