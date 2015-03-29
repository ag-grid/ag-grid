
// this example has items declared globally. bad javascript. but keeps the example simple.

var columnDefs = [
    {displayName: "Make", field: "make"},
    {displayName: "Model", field: "model"},
    {displayName: "Price", field: "price"}
];

var rowData = [
    {make: "Toyota", model: "Celica", price: 35000},
    {make: "Ford", model: "Mondeo", price: 32000},
    {make: "Porsche", model: "Boxter", price: 72000}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    dontUseScrolls: true // because so little data, no need to use scroll bars
};

// wait for the document to be loaded, otherwise
// Angular Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    // angularGrid is a global function
    angularGrid('#myGrid', gridOptions);
});
