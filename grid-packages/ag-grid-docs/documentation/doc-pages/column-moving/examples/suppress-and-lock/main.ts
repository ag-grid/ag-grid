import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    {
      field: 'athlete',
      suppressMovable: true,
      cellClass: 'suppress-movable-col',
    },
    { field: 'age', lockPosition: 'left', cellClass: 'locked-col' },
    { field: 'country' },
    { field: 'year' },
    { field: 'total', lockPosition: 'right', cellClass: 'locked-col' },
  ],
  defaultColDef: {
    flex: 1,
    lockPinned: true, // Dont allow pinning for this example
  },
  suppressDragLeaveHidesColumns: true,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
