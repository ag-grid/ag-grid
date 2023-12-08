import { GridApi, createGrid, GridOptions, ICellRendererParams } from '@ag-grid-community/core';

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'year', rowGroup: true, hide: true },
    {
      field: 'athlete',
      minWidth: 250,
      cellRenderer: (params: ICellRendererParams) => {
        return `<span style="margin-left: 60px">${params.value}</span>`
      },
    },
    { field: 'sport', minWidth: 200 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
  },
  groupDisplayType: 'groupRows',
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then(function (data) {
    gridApi.setGridOption('rowData', data)
  })
