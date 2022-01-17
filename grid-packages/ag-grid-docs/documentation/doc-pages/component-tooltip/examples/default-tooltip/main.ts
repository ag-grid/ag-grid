import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  { field: 'athlete', minWidth: 170, tooltipField: 'athlete' },
  { field: 'age' },
  { field: 'country', minWidth: 150, tooltipField: 'country' },
  { field: 'year' },
  { field: 'date', minWidth: 150 },
  { field: 'sport' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
  { field: 'total' },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },

  enableBrowserTooltips: true,

  // set rowData to null or undefined to show loading panel by default
  rowData: null,
  columnDefs: columnDefs,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => {
      gridOptions.api!.setRowData(data)
    })
})
