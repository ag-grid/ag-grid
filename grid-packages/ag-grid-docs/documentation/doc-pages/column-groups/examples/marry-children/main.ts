import { Grid, ColDef, ColGroupDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: (ColDef | ColGroupDef)[] = [
  {
    headerName: 'Athlete Details',
    marryChildren: true,
    children: [
      { field: 'athlete', colId: 'athlete' },
      { field: 'country', colId: 'country' },
    ],
  },
  { field: 'age', colId: 'age' },
  {
    headerName: 'Sports Results',
    marryChildren: true,
    children: [
      { field: 'sport', colId: 'sport' },
      { field: 'total', colId: 'total' },
      { field: 'gold', colId: 'gold' },
      { field: 'silver', colId: 'silver' },
      { field: 'bronze', colId: 'bronze' },
    ],
  },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    resizable: true,
    width: 160,
  },
  // debug: true,
  columnDefs: columnDefs,
  rowData: null,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
