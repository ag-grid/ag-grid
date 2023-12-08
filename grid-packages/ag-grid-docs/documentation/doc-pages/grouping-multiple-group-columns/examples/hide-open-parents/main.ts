import { GridApi, createGrid, GridOptions, ValueGetterParams } from '@ag-grid-community/core';

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true },
    {
      headerName: 'Year',
      valueGetter: 'data.year',
      rowGroup: true,
      hide: true,
    },

    { field: 'athlete', minWidth: 200 },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
    { field: 'total', aggFunc: 'sum' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    filter: true,
  },
  autoGroupColumnDef: {
    minWidth: 200,
    filterValueGetter: (params: ValueGetterParams) => {
      if (params.node) {
        var colGettingGrouped = params.colDef.showRowGroup + ''
        return params.api.getValue(colGettingGrouped, params.node)
      }
    },
  },
  groupHideOpenParents: true,
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data))
