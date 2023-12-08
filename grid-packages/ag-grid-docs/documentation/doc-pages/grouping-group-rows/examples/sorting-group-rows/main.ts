import { GridApi, createGrid, GridOptions, ICellRendererParams } from '@ag-grid-community/core';

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true, sortable: true },
    { field: 'year', rowGroup: true, hide: true, sortable: true },
    { field: 'athlete', minWidth: 250, },
    { field: 'sport', minWidth: 200 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    sortable: false,
  },
  groupDisplayType: 'groupRows',
  rowGroupPanelShow: 'always',
  groupDefaultExpanded: 1,
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then(function (data) {
    gridApi.setGridOption('rowData', data)
  })
