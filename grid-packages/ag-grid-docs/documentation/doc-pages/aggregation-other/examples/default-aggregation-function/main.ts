import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', rowGroup: true, enableRowGroup: true, hide: true },
    {
        field: 'gold',
        // allows column to be dragged to the 'Values` section of the Columns Tool Panel
        enableValue: true,
        // use 'avg' as the default agg func instead of 'sum'
        defaultAggFunc: 'avg',
    },
    { field: 'silver', enableValue: true, defaultAggFunc: 'mySum' },
    { field: 'bronze', enableValue: true },
  ],
  aggFuncs: {
    'mySum': params => {
      let sum = 0;
      params.values.forEach(value => sum += value);
      return sum;
    }
  },
  defaultColDef: {
    flex: 1
  },
  autoGroupColumnDef: {
    minWidth: 180,
  },
  sideBar: 'columns',
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data))
