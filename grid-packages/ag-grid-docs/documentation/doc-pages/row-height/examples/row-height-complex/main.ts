import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'latinText', width: 350, wrapText: true },
    { field: 'athlete' },
    { field: 'country' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  rowHeight: 120,
  defaultColDef: {
    width: 170,
    editable: true,
    filter: true,
  },
}
var latinText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then(function (data) {
    data.forEach(function (dataItem: any) {
      dataItem.latinText = latinText
    })

    // now set the data into the grid
    gridApi.setGridOption('rowData', data)
  })
