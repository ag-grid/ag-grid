import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  { field: 'country', rowGroup: true, hide: true },
  {
    field: 'gold',
    aggFunc: 'sum',
    enableValue: true,
    allowedAggFuncs: ['sum', 'min', 'max'],
  },
  { field: 'silver', aggFunc: 'min', enableValue: true },
  { field: 'bronze', aggFunc: 'max', enableValue: true },
  { field: 'total', aggFunc: 'avg', enableValue: true, minWidth: 200 },
  { field: 'age' },
  { field: 'year' },
  { field: 'date' },
  { field: 'sport' },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    filter: true,
    sortable: true,
    resizable: true,
  },
  autoGroupColumnDef: {
    headerName: 'Athlete',
    field: 'athlete',
    minWidth: 250,
    cellRenderer: 'agGroupCellRenderer'
  },
  sideBar: true,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
