
// this example has items declared globally. bad javascript. but keeps the example simple.
var columnDefs = [
    {headerName: "Make", field: "make"},
    {headerName: "Model", field: "model"},
    {headerName: "Price", field: "price", filter: 'agNumberColumnFilter'}
];

var rowData = [
    {id: 'aa', make: "Toyota", model: "Celica", price: 35000},
    {id: 'bb', make: "Ford", model: "Mondeo", price: 32000},
    {id: 'cc', make: "Porsche", model: "Boxter", price: 72000},
    {id: 'dd', make: "BMW", model: "5 Series", price: 59000},
    {id: 'ee', make: "Dodge", model: "Challanger", price: 35000},
    {id: 'ff', make: "Mazda", model: "MX5", price: 28000},
    {id: 'gg', make: "Horse", model: "Outside", price: 99000}
];

var gridOptions = {
    defaultColDef: {
        editable: true
    },
    enableSorting: true,
    enableFilter: true,
    animateRows: true,
    getRowNodeId: function(data) { return data.id; },
    columnDefs: columnDefs,
    rowData: rowData
};

function updateSort() {
    gridOptions.api.refreshClientSideRowModel('sort');
}

function updateFilter() {
    gridOptions.api.refreshClientSideRowModel('filter');
}

function setPriceOnToyota() {
    var rowNode = gridOptions.api.getRowNode('aa');
    var newPrice = Math.floor(Math.random()*100000);
    rowNode.setDataValue('price', newPrice);
}

function setDataOnFord() {
    var rowNode = gridOptions.api.getRowNode('bb');
    var newPrice = Math.floor(Math.random()*100000);
    var newModel = 'T-' + Math.floor(Math.random()*1000);
    var newData = {
        id: 'bb',
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
