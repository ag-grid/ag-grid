import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';

import { UpdateCellRenderer } from './updateCellRenderer_typescript';
import { MedalCellRenderer } from './medalCellRenderer_typescript';

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'athlete' },
    { field: 'year' },
    { field: 'gold', cellRenderer: MedalCellRenderer },
    { field: 'silver', cellRenderer: MedalCellRenderer },
    { field: 'bronze', cellRenderer: MedalCellRenderer },
    { cellRenderer: UpdateCellRenderer },
  ],
  rowData: null,
  defaultColDef: {
    flex: 1,
    minWidth: 100,
  },
}

// setup the grid
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
  .then(response => response.json())
  .then((data: IOlympicData[]) => {
    gridApi.setGridOption('rowData', data)
  })
