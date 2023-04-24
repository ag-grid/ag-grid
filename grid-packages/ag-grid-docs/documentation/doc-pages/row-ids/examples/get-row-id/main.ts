import { Grid, GridOptions, ColDef, GetRowIdParams } from '@ag-grid-community/core'


const columnDefs: ColDef[] = [
  { headerName: "Row ID", valueGetter: 'node.id' },
  { field: "make" },
  { field: "model" },
  { field: "price" }
];

// specify the data
const rowData = [
  { id: 'c1', make: "Toyota", model: "Celica", price: 35000 },
  { id: 'c2', make: "Ford", model: "Mondeo", price: 32000 },
  { id: 'c8', make: "Porsche", model: "Boxster", price: 72000 },
  { id: 'c4', make: "BMW", model: "M50", price: 60000 },
  { id: 'c14', make: "Aston Martin", model: "DBX", price: 190000 }
];

// let the grid know which columns and what data to use
const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  rowData: rowData,
  getRowId: (params: GetRowIdParams) => params.data.id
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
});
