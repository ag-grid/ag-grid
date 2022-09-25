import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', enableRowGroup: true, rowGroup: true, hide: true },
    { field: 'year', enableRowGroup: true, rowGroup: true, hide: true },
    { field: 'athlete', minWidth: 180 },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
    { field: 'total', aggFunc: 'sum' },
  ],
  defaultColDef: {
    sortable: true,
    flex: 1,
    minWidth: 150,
  },
  autoGroupColumnDef: {
    sort: 'asc',
    minWidth: 200,
  },
  rowGroupPanelSuppressSort: true,
  rowGroupPanelShow: 'always',
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
