import { Grid, GridOptions, ColDef } from '@ag-grid-community/core'


var columnDefs: ColDef[] = [
  {field: "make"},
  {field: "model"},
  {field: "price"}
];
    
// specify the data
var rowData = [
  {id: 'car-t', make: "Toyota", model: "Celica", price: 35000},
  {id: 'car-f', make: "Ford", model: "Mondeo", price: 32000},
  {id: 'car-p', make: "Porsche", model: "Boxter", price: 72000},
  {id: 'car-b', make: "BMW", model: "M50", price: 60000},
  {id: 'car-a', make: "Aston Martin", model: "DBX", price: 190000}
];

// let the grid know which columns and what data to use
var gridOptions: GridOptions = {
  columnDefs: columnDefs,
  rowData: rowData,
  getRowKey: item => item.id,
  rowSelection: 'single',
  onGridReady: params => {
    const carF = params.api.getRowNode('car-f')!;
    carF.setSelected(true);
  }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
});
