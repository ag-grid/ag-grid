var columnDefs = [
    {headerName: "Make", field: "make"},
    {headerName: "Model", field: "model"},
    {headerName: "Price", field: "price", filter: "number"}
];

var rowData = [
    {make: "Toyota", model: "Celica", price: 35000},
    {make: "Ford", model: "Mondeo", price: 32000},
    {make: "Ford", model: "Focus", price: 27000},
    {make: "BMW", model: "M5", price: 38000},
    {make: "Phantom", model: "Speed Car", price: 120000},
    {make: "Porsche", model: "Boxter", price: 72000},
    {make: "Toyota", model: "Celica", price: 35000},
    {make: "Ford", model: "Mondeo", price: 32000},
    {make: "Ford", model: "Focus", price: 27000},
    {make: "BMW", model: "M5", price: 38000},
    {make: "Phantom", model: "Speed Car", price: 120000},
    {make: "Porsche", model: "Boxter", price: 72000},
    {make: "Porsche", model: "Boxter", price: 72000},
    {make: "Porsche", model: "Boxter", price: 72000},
    {make: "Porsche", model: "Boxter", price: 72000},
    {make: "Porsche", model: "Boxter", price: 72000}
];

var gridOptions = {
    columnDefs: columnDefs,
    enableColResize: true, //one of [true, false]
    enableSorting: true, //one of [true, false]
    enableFilter: true, //one of [true, false]
    rowSelection: "single",
    domLayout: "forPrint"
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
    gridOptions.api.setRowData(rowData);
});