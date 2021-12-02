import { GridOptions, RowHeightParams } from '@ag-grid-community/core'

var swimmingHeight: number;
var groupHeight: number;
var russiaHeight: number;

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', rowGroup: true },
    { field: 'athlete' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  animateRows: true,
  getRowHeight: getRowHeight,
}

function getRowHeight(params: RowHeightParams) {
  if (params.node.group && groupHeight != null) {
    return groupHeight
  } else if (
    params.data &&
    params.data.country === 'Russia' &&
    russiaHeight != null
  ) {
    return russiaHeight
  } else if (
    params.data &&
    params.data.sport === 'Swimming' &&
    swimmingHeight != null
  ) {
    return swimmingHeight
  }
}

function setSwimmingHeight(height: number) {
  swimmingHeight = height
  gridOptions.api!.resetRowHeights()
}

function setGroupHeight(height: number) {
  groupHeight = height
  gridOptions.api!.resetRowHeights()
}

function setRussiaHeight(height: number) {
  // this is used next time resetRowHeights is called
  russiaHeight = height

  gridOptions.api!.forEachNode(function (rowNode) {
    if (rowNode.data && rowNode.data.country === 'Russia') {
      rowNode.setRowHeight(height)
    }
  })
  gridOptions.api!.onRowHeightChanged()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
