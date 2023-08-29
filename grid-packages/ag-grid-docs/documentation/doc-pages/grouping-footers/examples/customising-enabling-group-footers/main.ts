import { Grid, GridOptions, GetGroupIncludeFooterParams } from '@ag-grid-community/core';
import { getData } from "./data";

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'year', rowGroup: true, hide: true },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    sortable: true,
    resizable: true,
  },
  autoGroupColumnDef: {
    minWidth: 300,
  },
  groupIncludeFooter: (params: GetGroupIncludeFooterParams) => {
    const node = params.node;
    if (node && node.level === 1) return true;
    if (node && node.key === 'France') return true;

    return false;
  },
  animateRows: true,
  rowData: getData(),
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
