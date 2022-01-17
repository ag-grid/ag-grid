import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    {
      headerName: 'Athlete',
      field: 'athlete',
      minWidth: 180,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection: true,
    },
    { field: 'age' },
    { field: 'country', minWidth: 150 },
    { field: 'year' },
    { field: 'date', minWidth: 150 },
    { field: 'sport', minWidth: 150 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    resizable: true,
  },
  suppressRowClickSelection: true,
  rowSelection: 'multiple',
}

function onQuickFilterChanged() {
  gridOptions.api!.setQuickFilter((document.getElementById('quickFilter') as HTMLInputElement).value)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
