import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
      { field: 'country', rowGroup: true, enableRowGroup: true },
      { field: 'year', pivot: true, enablePivot: true },
      { field: 'date' },
      { field: 'sport', enablePivot: true, },
      { field: 'gold', aggFunc: 'sum', enableValue: true, },
      { field: 'silver', enableValue: true, },
      { field: 'bronze', enableValue: true },
    ],
    defaultColDef: {
      flex: 1,
      minWidth: 150,
    },
    autoGroupColumnDef: {
      minWidth: 200,
    },
    sideBar: 'columns',
    pivotMode: true,
    removePivotHeaderRowWhenSingleValueColumn: true,
  }

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data))
