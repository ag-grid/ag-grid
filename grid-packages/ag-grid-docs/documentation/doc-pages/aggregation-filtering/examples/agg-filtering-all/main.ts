import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'athlete' },
    { field: 'year' },
    { field: 'total', aggFunc: 'sum', filter: 'agNumberColumnFilter', floatingFilter: true },
  ],
  defaultColDef: {
    flex: 1,
    resizable: true,
  },
  groupDefaultExpanded: -1,
  groupAggFiltering: true,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  gridOptions.api!.setRowData(getData());
})
