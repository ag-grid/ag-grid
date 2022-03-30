import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  { field: 'country', rowGroup: true, hide: true },
  { field: 'year', filter: 'agNumberColumnFilter' },
  { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
  { field: 'silver', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
  { field: 'bronze', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
  { field: 'total', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    resizable: true,
    floatingFilter: true,
  },
  autoGroupColumnDef: {
    headerName: 'Country',
    field: 'athlete',
  },
  groupAggFiltering: true,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
