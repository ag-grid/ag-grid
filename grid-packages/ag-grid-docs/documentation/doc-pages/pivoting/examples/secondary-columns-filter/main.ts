import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', rowGroup: true },
    { field: 'athlete', rowGroup: true },
    { field: 'year', pivot: true },
    { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
    { field: 'silver', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
    { field: 'bronze', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    floatingFilter: true,
  },
  pivotMode: true,
}

// setup the grid
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
  .then(response => response.json())
  .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data))
