import { GridApi, createGrid, GridOptions, ICellRendererParams } from '@ag-grid-community/core';

let api: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'sport', rowGroup: true, hide: true },
    { field: 'country', rowGroup: true, hide: true },
    { field: 'athlete', minWidth: 250 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    filter: true,
    floatingFilter: true,
    resizable: true,
  },
  groupDisplayType: 'groupRows',
  animateRows: true,
  sideBar: 'filters',
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {
      api!.setRowData(data)
    })
})
