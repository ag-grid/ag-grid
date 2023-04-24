import { Grid, GridOptions, RowHeightParams } from '@ag-grid-community/core';
import { getData } from "./data";


var swimmingHeight: number;
var groupHeight: number;
var usaHeight: number;

const gridOptions: GridOptions<IOlympicData> = {
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
  rowData: getData(),
  animateRows: true,
  groupDefaultExpanded: 1,
  getRowHeight: getRowHeight,
}

function getRowHeight(params: RowHeightParams<IOlympicData>): number | undefined | null {
  if (params.node.group && groupHeight != null) {
    return groupHeight
  } else if (
    params.data &&
    params.data.country === 'United States' &&
    usaHeight != null
  ) {
    return usaHeight
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

function setUsaHeight(height: number) {
  // this is used next time resetRowHeights is called
  usaHeight = height

  gridOptions.api!.forEachNode(function (rowNode) {
    if (rowNode.data && rowNode.data.country === 'United States') {
      rowNode.setRowHeight(height)
    }
  })
  gridOptions.api!.onRowHeightChanged()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
