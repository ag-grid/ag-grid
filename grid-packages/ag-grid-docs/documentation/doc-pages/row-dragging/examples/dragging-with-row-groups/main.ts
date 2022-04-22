import { Grid, GridOptions, RowDragCallbackParams, RowDragEndEvent } from '@ag-grid-community/core'

var rowDrag = function (params: RowDragCallbackParams) {
  // only rows that are NOT groups should be draggable
  return !params.node.group
}

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'athlete', rowDrag: rowDrag },
    { field: 'country', rowGroup: true },
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
  animateRows: true,
  groupDefaultExpanded: 1,
  onRowDragMove: onRowDragMove,
  onGridReady: (params) => {
    gridOptions.api!.setRowData(getData())
  },
}

function onRowDragMove(event: RowDragEndEvent) {
  var movingNode = event.node!
  var overNode = event.overNode!

  // find out what country group we are hovering over
  var groupCountry
  if (overNode.group) {
    // if over a group, we take the group key (which will be the
    // country as we are grouping by country)
    groupCountry = overNode.key
  } else {
    // if over a non-group, we take the country directly
    groupCountry = overNode.data.country
  }

  var needToChangeParent = movingNode.data.country !== groupCountry

  if (needToChangeParent) {
    var movingData = movingNode.data
    movingData.country = groupCountry
    gridOptions.api!.applyTransaction({
      update: [movingData],
    })
    gridOptions.api!.clearFocusedCell()
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
