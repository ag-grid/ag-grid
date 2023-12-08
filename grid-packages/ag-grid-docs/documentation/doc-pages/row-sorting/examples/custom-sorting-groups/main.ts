import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  { field: 'athlete', hide: true },
  { field: 'age' },
  { field: 'country', rowGroup: true },
  { field: 'year' },
  { field: 'date' },
  { field: 'sport' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
  { field: 'total' },
]

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefs,

  autoGroupColumnDef: {
    comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
      var res = valueA == valueB ? 0 : valueA > valueB ? 1 : -1
      return res
    },
    field: 'athlete',
    sort: 'asc',
  },
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data))
