import { Grid, GridOptions, GetRowIdParams, RowDragMoveEvent } from '@ag-grid-community/core'

var immutableStore: any[] = getData();

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'athlete', rowDrag: true },
    { field: 'country' },
    { field: 'year', width: 100 },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
  ],
  defaultColDef: {
    width: 170,
    sortable: true,
    filter: true,
  },
  // this tells the grid we are doing updates when setting new data
  animateRows: true,
  onRowDragMove: onRowDragMove,
  getRowId: getRowId,
  onSortChanged: onSortChanged,
  onFilterChanged: onFilterChanged,
  onGridReady: function onGridReady() {
    // add id to each item, needed for immutable store to work
    immutableStore.forEach(function (data, index) {
      data.id = index
    })

    gridOptions.api!.setRowData(immutableStore)
  },
}

var sortActive = false
var filterActive = false

// listen for change on sort changed
function onSortChanged() {
  var colState = gridOptions.columnApi!.getColumnState() || [];
  sortActive = colState.some(c => c.sort)
  // suppress row drag if either sort or filter is active
  var suppressRowDrag = sortActive || filterActive
  console.log(
    'sortActive = ' +
    sortActive +
    ', filterActive = ' +
    filterActive +
    ', allowRowDrag = ' +
    suppressRowDrag
  )
  gridOptions.api!.setSuppressRowDrag(suppressRowDrag)
}

// listen for changes on filter changed
function onFilterChanged() {
  filterActive = gridOptions.api!.isAnyFilterPresent()
  // suppress row drag if either sort or filter is active
  var suppressRowDrag = sortActive || filterActive
  console.log(
    'sortActive = ' +
    sortActive +
    ', filterActive = ' +
    filterActive +
    ', allowRowDrag = ' +
    suppressRowDrag
  )
  gridOptions.api!.setSuppressRowDrag(suppressRowDrag)
}

function getRowId(params: GetRowIdParams) {
  return params.data.id
}

function onRowDragMove(event: RowDragMoveEvent) {
  var movingNode = event.node
  var overNode = event.overNode

  var rowNeedsToMove = movingNode !== overNode

  if (rowNeedsToMove) {
    // the list of rows we have is data, not row nodes, so extract the data
    var movingData = movingNode.data
    var overData = overNode!.data

    var fromIndex = immutableStore.indexOf(movingData)
    var toIndex = immutableStore.indexOf(overData)

    var newStore = immutableStore.slice()
    moveInArray(newStore, fromIndex, toIndex)

    immutableStore = newStore
    gridOptions.api!.setRowData(newStore)

    gridOptions.api!.clearFocusedCell()
  }

  function moveInArray(arr: any[], fromIndex: number, toIndex: number) {
    var element = arr[fromIndex]
    arr.splice(fromIndex, 1)
    arr.splice(toIndex, 0, element)
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
