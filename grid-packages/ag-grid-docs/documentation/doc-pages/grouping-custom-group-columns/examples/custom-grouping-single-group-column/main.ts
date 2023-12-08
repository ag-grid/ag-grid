import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    // one column for showing the groups
    {
      headerName: 'Group',
      cellRenderer: 'agGroupCellRenderer',
      showRowGroup: true,
      minWidth: 210,
    },

    // the first group column
    { field: 'country', rowGroup: true, hide: true },
    { field: 'year', rowGroup: true, hide: true },

    { field: 'athlete', minWidth: 200 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
  ],
  defaultColDef: {
    flex: 1,
  },
  groupDisplayType: 'custom',
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data))
