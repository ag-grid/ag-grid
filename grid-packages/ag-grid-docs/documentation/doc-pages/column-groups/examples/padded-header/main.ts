import { GridApi, createGrid, ColDef, ColGroupDef, GridOptions } from '@ag-grid-community/core';

const columnDefs: (ColDef | ColGroupDef)[] = [
  {
    headerName: 'Athlete Details',
    children: [
      { field: 'athlete' },
      { field: 'country' },
    ],
  },
  {
    field: 'age',
    width: 90,
    suppressSpanHeaderHeight: true
  }
]

let api: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    sortable: true,
    resizable: true,
    filter: true,
  },
  // debug: true,
  columnDefs: columnDefs,
  rowData: null,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => api!.setRowData(data))
})
