import { GridApi, createGrid, GridOptions, IMultiFilterParams } from '@ag-grid-community/core';
import { YearFilter } from "./YearFilter_typescript";
import { YearFloatingFilter } from "./YearFloatingFilter_typescript";

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'athlete', filter: 'agMultiColumnFilter' },
    { field: 'sport', filter: 'agMultiColumnFilter' },
    {
      field: 'year',
      filter: 'agMultiColumnFilter',
      filterParams: {
        filters: [
          {
            filter: YearFilter,
            floatingFilterComponent: YearFloatingFilter,
          },
          {
            filter: 'agNumberColumnFilter',
          },
        ],
      } as IMultiFilterParams,
    },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 200,
    floatingFilter: true,
    menuTabs: ['filterMenuTab'],
  }
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data))
