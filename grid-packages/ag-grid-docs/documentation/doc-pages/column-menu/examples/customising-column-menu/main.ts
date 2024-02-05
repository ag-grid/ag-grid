import {
  GridApi,
  createGrid,
  ColDef,
  GridOptions,
} from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  { field: 'athlete', minWidth: 200, filter: true, suppressMenu: true },
  { field: 'age', filter: true, floatingFilter: true, suppressMenu: true },
  { field: 'country', minWidth: 200, filter: true, suppressHeaderFilter: true },
  { field: 'year', filter: true, floatingFilter: true, suppressHeaderFilter: true },
  { field: 'sport', minWidth: 200, suppressHeaderContextMenu: true },
  { field: 'gold', suppressMenu: true, suppressHeaderFilter: true },
  { field: 'silver', filter: true, suppressMenu: true, suppressHeaderFilter: true },
  { field: 'bronze', filter: true, floatingFilter: true, suppressMenu: true, suppressHeaderFilter: true },
  { field: 'total', filter: true, suppressMenu: true, suppressHeaderFilter: true, suppressHeaderContextMenu: true },
]

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    columnMenu: 'new',
  },
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data))
})
