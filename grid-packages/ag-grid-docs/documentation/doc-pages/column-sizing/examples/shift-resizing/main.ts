import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  { field: 'athlete', width: 150 },
  { field: 'age', width: 90 },
  { field: 'country', width: 150 },
  { field: 'year', width: 90 },
  { field: 'date', width: 110 },
  { field: 'sport', width: 150 },
  { field: 'gold', width: 100 },
  { field: 'silver', width: 100 },
  { field: 'bronze', width: 100 },
  { field: 'total', width: 100 },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    resizable: true,
  },
  columnDefs: columnDefs,
  rowData: null,
  colResizeDefault: 'shift',
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
