import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';
import { MedalCellRenderer } from "./medalCellRenderer_typescript";
import { TotalValueRenderer } from "./totalValueRenderer_typescript";

const columnDefs: ColDef[] = [
  { field: 'athlete' },
  { field: 'year', minWidth: 60 },
  { field: 'gold', cellRenderer: MedalCellRenderer },
  { field: 'silver', cellRenderer: MedalCellRenderer },
  { field: 'bronze', cellRenderer: MedalCellRenderer },
  { field: 'total', minWidth: 190, cellRenderer: TotalValueRenderer },
]

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefs,
  defaultColDef: {
    editable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
  },
}

// setup the grid
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then((data: IOlympicData[]) => {
    gridApi.setGridOption('rowData', data)
  })
