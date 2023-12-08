import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    {
      headerName: 'Group A',
      children: [
        { field: 'athlete', minWidth: 200 },
        { field: 'country', minWidth: 200 },
      ],
    },
    {
      headerName: 'Group B',
      children: [
        { field: 'sport', minWidth: 150 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
      ],
    },
  ],
  defaultColDef: {
    filter: true,
    minWidth: 100,
    flex: 1,
  },
}

function onBtExport() {
  gridApi!.exportDataAsExcel()
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
  .then(response => response.json())
  .then(function (data) {
    gridApi.setGridOption('rowData', data)
  })
