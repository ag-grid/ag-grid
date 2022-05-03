import { Grid, GridOptions, ValueGetterParams } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    {
      headerName: 'Country',
      showRowGroup: 'country',
      cellRenderer: 'agGroupCellRenderer',
      minWidth: 200,
    },
    {
      headerName: 'Year',
      valueGetter: (params: ValueGetterParams) => {
        if (params.data) {
          return params.data.year
        }
      },
      showRowGroup: 'year',
      cellRenderer: 'agGroupCellRenderer',
    },
    { field: 'athlete', minWidth: 200 },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
    { field: 'total', aggFunc: 'sum' },

    { field: 'country', rowGroup: true, hide: true },
    { field: 'year', rowGroup: true, hide: true },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    sortable: true,
    resizable: true,
  },
  groupDisplayType: 'custom',
  groupHideOpenParents: true,
  enableRangeSelection: true,
  animateRows: true,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
