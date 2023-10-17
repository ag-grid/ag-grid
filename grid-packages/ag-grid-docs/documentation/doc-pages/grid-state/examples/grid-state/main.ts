import { GridApi, createGrid, GridOptions, GridPreDestroyedEvent } from '@ag-grid-community/core';

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    {
      field: 'athlete',
      minWidth: 150,
      headerCheckboxSelection: true,
      checkboxSelection: true,
    },
    { field: 'age', maxWidth: 90 },
    { field: 'country', minWidth: 150 },
    { field: 'year', maxWidth: 90 },
    { field: 'date', minWidth: 150 },
    { field: 'sport', minWidth: 150 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    sortable: true,
    resizable: true,
    filter: true,
    enableRowGroup: true,
    enablePivot: true,
    enableValue: true,
  },
  enableRangeSelection: true,
  sideBar: true,
  pagination: true,
  rowSelection: 'multiple',
  suppressRowClickSelection: true,
  suppressColumnMoveAnimation: true,
  onGridPreDestroyed: onGridPreDestroyed
}

function onGridPreDestroyed(event: GridPreDestroyedEvent<IOlympicData>): void {
  console.log('Grid state on destroy (can be persisted)', event.state);
}

function reloadGrid() {
  const state = gridApi.getState();

  gridApi.destroy();

  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;

  gridOptions.initialState = state;

  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data) => gridApi.setRowData(data))
}

function printState() {
  console.log('Grid state', gridApi.getState());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridApi!.setRowData(data))
})
