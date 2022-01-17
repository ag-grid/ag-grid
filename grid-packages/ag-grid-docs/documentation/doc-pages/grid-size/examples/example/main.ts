import { Grid, FirstDataRenderedEvent, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'athlete', minWidth: 150 },
    { field: 'age', minWidth: 70, maxWidth: 90 },
    { field: 'country', minWidth: 130 },
    { field: 'year', minWidth: 70, maxWidth: 90 },
    { field: 'date', minWidth: 120 },
    { field: 'sport', minWidth: 120 },
    { field: 'gold', minWidth: 80 },
    { field: 'silver', minWidth: 80 },
    { field: 'bronze', minWidth: 80 },
    { field: 'total', minWidth: 80 },
  ],

  defaultColDef: {
    resizable: true,
  },

  onFirstDataRendered: onFirstDataRendered,
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.sizeColumnsToFit()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
