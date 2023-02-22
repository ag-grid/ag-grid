import { Grid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'year', rowGroup: true, hide: true },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    resizable: true,
  },
  rowData: getData(),
}

function expandAll() {
  gridOptions.api!.expandAll()
}

function collapseAll() {
  gridOptions.api!.collapseAll()
}

function expandCountries() {
  gridOptions.api!.forEachNode(node => {
    if (node.level === 0) {
      gridOptions.api!.setRowNodeExpanded(node, true);
    }
  });
}

function expandAustralia2000() {
  gridOptions.api!.forEachNode(node => {
    if (node.key === '2000' && node.parent && node.parent.key === 'Australia') {
      gridOptions.api!.setRowNodeExpanded(node, true, true);
    }
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
