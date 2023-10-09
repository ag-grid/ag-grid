import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';

const columnDefsMedalsIncluded: ColDef[] = [
  { field: 'athlete' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
  { field: 'total' },
  { field: 'age' },
  { field: 'country' },
  { field: 'sport' },
  { field: 'year' },
  { field: 'date' },
]

const colDefsMedalsExcluded: ColDef[] = [
  { field: 'athlete' },
  { field: 'age' },
  { field: 'country' },
  { field: 'sport' },
  { field: 'year' },
  { field: 'date' },
]

let api: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefsMedalsIncluded,
  defaultColDef: {
    initialWidth: 100,
    sortable: true,
    resizable: true,
  },
}

function onBtExcludeMedalColumns() {
  api!.setColumnDefs(colDefsMedalsExcluded)
}

function onBtIncludeMedalColumns() {
  api!.setColumnDefs(columnDefsMedalsIncluded)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => api!.setRowData(data))
})
