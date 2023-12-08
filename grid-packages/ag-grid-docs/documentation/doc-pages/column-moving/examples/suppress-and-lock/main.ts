import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    {
      field: 'athlete',
      suppressMovable: true,
      cellClass: 'suppress-movable-col',
    },
    { field: 'age', lockPosition: 'left', cellClass: 'locked-col' },
    { field: 'country' },
    { field: 'year' },
    { field: 'total', lockPosition: 'right', cellClass: 'locked-col' },
  ],
  defaultColDef: {
    flex: 1,
    lockPinned: true, // Dont allow pinning for this example
  },
  suppressDragLeaveHidesColumns: true,
}

// setup the grid
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data))
