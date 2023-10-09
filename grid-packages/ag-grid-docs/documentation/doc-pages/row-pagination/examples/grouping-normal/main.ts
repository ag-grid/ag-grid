import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  { field: 'athlete' },
  { field: 'age' },
  { field: 'country', rowGroup: true },
  { field: 'year', rowGroup: true },
  { field: 'date' },
  { field: 'sport', rowGroup: true },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
  { field: 'total' },
]

let api: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefs,
  pagination: true,
  paginationPageSize: 10,
  defaultColDef: {
    editable: true,
    sortable: true,
    resizable: true,
    filter: true,
    flex: 1,
    minWidth: 190,
  },
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => api!.setRowData(data))
})
