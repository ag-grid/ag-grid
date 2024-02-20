import { GridApi, createGrid, ColDef, GridOptions, GetMainMenuItemsParams } from '@ag-grid-community/core';
import { MenuItem } from './menuItem_typescript';

const columnDefs: ColDef[] = [
  { field: 'athlete'},
  { field: 'country' },
  { field: 'sport' },
  { field: 'year'},
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
]

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    filter: true,
    menuTabs: ['generalMenuTab'],
  },
  columnDefs: columnDefs,
  rowData: null,
  getMainMenuItems: (params: GetMainMenuItemsParams) => {
    return [
      ...params.defaultItems,
      'separator',
      {
        name: 'Filter',
        menuItem: MenuItem,
        menuItemParams: {
          column: params.column
        }
      }
    ];
  },
  suppressMenuHide: true,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => {
      gridApi!.setGridOption('rowData', data)
    })
})
