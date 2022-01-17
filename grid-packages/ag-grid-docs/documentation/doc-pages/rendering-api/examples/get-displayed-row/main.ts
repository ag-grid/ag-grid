import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'athlete', minWidth: 180 },
    { field: 'age' },
    { field: 'country', minWidth: 150 },
    { headerName: 'Group', valueGetter: 'data.country.charAt(0)' },
    { field: 'year' },
    { field: 'date', minWidth: 150 },
    { field: 'sport', minWidth: 180 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
  },
  pagination: true,
  paginationAutoPageSize: true,
}

function getDisplayedRowAtIndex() {
  var rowNode = gridOptions.api!.getDisplayedRowAtIndex(0)!
  console.log('getDisplayedRowAtIndex(0) => ' + rowNode.data.athlete + ' ' + rowNode.data.year)
}

function getDisplayedRowCount() {
  var count = gridOptions.api!.getDisplayedRowCount()
  console.log('getDisplayedRowCount() => ' + count)
}

function printAllDisplayedRows() {
  var count = gridOptions.api!.getDisplayedRowCount()
  console.log('## printAllDisplayedRows')
  for (var i = 0; i < count; i++) {
    var rowNode = gridOptions.api!.getDisplayedRowAtIndex(i)!
    console.log('row ' + i + ' is ' + rowNode.data.athlete)
  }
}

function printPageDisplayedRows() {
  var rowCount = gridOptions.api!.getDisplayedRowCount()
  var lastGridIndex = rowCount - 1
  var currentPage = gridOptions.api!.paginationGetCurrentPage()
  var pageSize = gridOptions.api!.paginationGetPageSize()
  var startPageIndex = currentPage * pageSize
  var endPageIndex = (currentPage + 1) * pageSize - 1

  if (endPageIndex > lastGridIndex) {
    endPageIndex = lastGridIndex
  }

  console.log('## printPageDisplayedRows')
  for (var i = startPageIndex; i <= endPageIndex; i++) {
    var rowNode = gridOptions.api!.getDisplayedRowAtIndex(i)!
    console.log('row ' + i + ' is ' + rowNode.data.athlete)
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {
      gridOptions.api!.setRowData(data.slice(0, 100))
    })
})
