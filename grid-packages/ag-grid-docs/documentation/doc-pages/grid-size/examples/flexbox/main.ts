import { GridApi, createGrid, GridOptions, GridReadyEvent } from '@ag-grid-community/core';

var rowData = [
  { make: 'Toyota', model: 'Celica', price: 35000 },
  { make: 'Ford', model: 'Mondeo', price: 32000 },
  { make: 'Porsche', model: 'Boxster', price: 72000 },
]

let api: GridApi;

// let the grid know which columns and what data to use
const gridOptions: GridOptions = {
  columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],

  rowData: rowData,

  onGridReady: (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit()

    window.addEventListener('resize', function () {
      setTimeout(function () {
        params.api.sizeColumnsToFit()
      })
    })
  },
}

document.addEventListener('DOMContentLoaded', function () {
  var eGridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(eGridDiv, gridOptions);;
  api!.sizeColumnsToFit()
})
