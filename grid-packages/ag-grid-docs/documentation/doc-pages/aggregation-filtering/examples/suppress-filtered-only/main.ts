import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'athlete' },
    { field: 'year', filter: 'agNumberColumnFilter', floatingFilter: true },
    { field: 'total', aggFunc: 'sum' },
  ],
  defaultColDef: {
    flex: 1,
    resizable: true,
  },
  groupDefaultExpanded: -1,
  suppressAggFilteredOnly: true,
  rowData: getData(),
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
