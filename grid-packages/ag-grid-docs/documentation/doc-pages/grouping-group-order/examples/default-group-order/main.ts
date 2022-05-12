import { Grid, GridOptions, InitialGroupOrderComparatorParams } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'year' },
    { field: 'sport', rowGroup: true, hide: true },
    { field: 'athlete', minWidth: 200 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
    { field: 'age' },
    { field: 'date', minWidth: 140 },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    resizable: true,
    sortable: true,
  },
  autoGroupColumnDef: {
    minWidth: 200,
  },
  groupDisplayType: 'groupRows',
  initialGroupOrderComparator: (params: InitialGroupOrderComparatorParams) => {
    const a = params.nodeA.key || ''
    const b = params.nodeB.key || ''
    return a < b ? -1 : a > b ? 1 : 0
  },
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
