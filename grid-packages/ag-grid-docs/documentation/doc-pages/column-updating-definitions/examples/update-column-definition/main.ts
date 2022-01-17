import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'

function getColumnDefs() {
  return [
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
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
    sortable: true,
    resizable: true,
    filter: true,
  },
  columnDefs: getColumnDefs(),
}

function setHeaderNames() {
  const columnDefs: ColDef[] = getColumnDefs()
  columnDefs.forEach(function (colDef, index) {
    colDef.headerName = 'C' + index
  })
  gridOptions.api!.setColumnDefs(columnDefs)
}

function removeHeaderNames() {
  const columnDefs: ColDef[] = getColumnDefs()
  columnDefs.forEach(function (colDef, index) {
    colDef.headerName = undefined
  })
  gridOptions.api!.setColumnDefs(columnDefs)
}

function setValueFormatters() {
  const columnDefs: ColDef[] = getColumnDefs()
  columnDefs.forEach(function (colDef, index) {
    colDef.valueFormatter = function (params) {
      return '[ ' + params.value + ' ]'
    }
  })
  gridOptions.api!.setColumnDefs(columnDefs)
}

function removeValueFormatters() {
  const columnDefs: ColDef[] = getColumnDefs()
  columnDefs.forEach(function (colDef, index) {
    colDef.valueFormatter = undefined
  })
  gridOptions.api!.setColumnDefs(columnDefs)
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
