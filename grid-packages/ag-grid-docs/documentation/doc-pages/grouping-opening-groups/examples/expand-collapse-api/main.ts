import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";

let api: GridApi;

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
  api!.expandAll()
}

function collapseAll() {
  api!.collapseAll()
}

function expandCountries() {
  api!.forEachNode(node => {
    if (node.level === 0) {
      api!.setRowNodeExpanded(node, true);
    }
  });
}

function expandAustralia2000() {
  api!.forEachNode(node => {
    if (node.key === '2000' && node.parent && node.parent.key === 'Australia') {
      api!.setRowNodeExpanded(node, true, true);
    }
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;
})
