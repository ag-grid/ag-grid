import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'athlete' },
    { field: 'country' },
    { field: 'sport' },
    { field: 'age', minWidth: 100 },
    { field: 'gold', minWidth: 100 },
    { field: 'silver', minWidth: 100 },
    { field: 'bronze', minWidth: 100 },
  ],
  defaultColDef: {
    flex: 1,
  },
}

function onFilterTextBoxChanged() {
  gridApi!.setGridOption(
    'quickFilterText',
    (document.getElementById('filter-text-box') as HTMLInputElement).value
  )
}

// setup the grid
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
const gridApi: GridApi = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data));
