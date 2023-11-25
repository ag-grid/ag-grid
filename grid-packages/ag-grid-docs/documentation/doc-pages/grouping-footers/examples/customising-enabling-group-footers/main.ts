import { GridApi, createGrid, GridOptions, GetGroupIncludeFooterParams, FirstDataRenderedEvent } from '@ag-grid-community/core';

let gridApi: GridApi;

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
  onFirstDataRendered: (params: FirstDataRenderedEvent) => {
    params.api.forEachNode((node) => {
      if (node.key === 'France' || node.key === 'South Korea') {
        params.api.setRowNodeExpanded(node, true);
      }
    });
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data))
})
