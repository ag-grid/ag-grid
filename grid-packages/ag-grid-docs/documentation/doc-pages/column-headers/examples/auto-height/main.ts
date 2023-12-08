import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  { field: 'athlete', headerName: 'The full Name of the athlete' },
  { field: 'age', headerName: 'The number of Years since the athlete was born', initialWidth: 120 },
  { field: 'country', headerName: 'The Country the athlete was born in' },
  { field: 'sport', headerName: 'The Sport the athlete participated in'},
  { field: 'total', headerName: 'The Total number of medals won by the athlete'},
]

const gridOptions: GridOptions = {
  defaultColDef: {
    initialWidth: 200,
    wrapHeaderText: true,
    autoHeaderHeight: true,
  },
  columnDefs: columnDefs,
}

// setup the grid
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then(data => gridApi.setGridOption('rowData', data))
