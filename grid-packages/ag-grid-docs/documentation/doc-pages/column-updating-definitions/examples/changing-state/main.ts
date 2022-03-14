import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'

function getColumnDefs(): ColDef[] {
  return [
    { field: 'athlete', width: 150, sort: 'asc' },
    { field: 'age' },
    { field: 'country', pinned: 'left' },
    { field: 'sport' },
    { field: 'year' },
    { field: 'date' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ]
}

const gridOptions: GridOptions = {
  defaultColDef: {
    initialWidth: 100,
    width: 100, // resets col widths if manually resized
    sortable: true,
    resizable: true,
    pinned: null, // important - clears pinned if not specified in col def
    sort: null, // important - clears sort if not specified in col def
  },
  columnDefs: getColumnDefs(),
}

function onBtWithState() {
  gridOptions.api!.setColumnDefs(getColumnDefs())
}

function onBtRemove() {
  gridOptions.api!.setColumnDefs([])
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
