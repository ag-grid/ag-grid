
// this example has items declared globally. bad javascript. but keeps the example simple.
var columnDefs = [
    {headerName: "Make", field: "make"},
    {headerName: "Model", field: "model"},
    {headerName: "Price", field: "price"}
];

var rowData = [
    {id: '1', make: "Toyota", model: "Celica", price: 35000},
    {id: '2', make: "Ford", model: "Mondeo", price: 32000},
    {id: '3', make: "Porsche", model: "Boxter", price: 72000}
];

var gridOptions = {
    getRowNodeId: function(data) { return data.id; },
    columnDefs: columnDefs,
    rowData: rowData
};

function setPriceOnToyota() {
    var rowNode = gridOptions.api.getRowNode('1');
    var newPrice = Math.floor(Math.random()*100000);
    rowNode.setDataValue('price', newPrice);
}

function setDataOnFord() {
    var rowNode = gridOptions.api.getRowNode('2');
    var newPrice = Math.floor(Math.random()*100000);
    var newModel = 'T-' + Math.floor(Math.random()*1000);
    var newData = {
        id: 2,
        make: 'Ford',
        model: newModel,
        price: newPrice
    };
    rowNode.setData(newData);
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
});
