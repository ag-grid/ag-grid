import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';

let api: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    {
      field: 'country',
      rowGroup: true,
      enableRowGroup: true,
      hide: true,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'year',
      rowGroup: true,
      enableRowGroup: true,
      hide: true
    },
    { field: 'sport', enableRowGroup: true },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: true,
  },
  autoGroupColumnDef: {
    minWidth: 200,
    filter: 'agGroupColumnFilter',
  },
  animateRows: true,
  rowGroupPanelShow: 'always',
  groupDisplayType: 'multipleColumns',
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => api!.setRowData(data))
})
