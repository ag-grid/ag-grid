// this example has items declared globally. bad javascript. but keeps the example simple.

var columnDefs = [
    {headerName: "Make", field: "make", editable: true},
    {headerName: "Model", field: "model", editable: true},
    {headerName: "Price", field: "price", editable: true}
];

var rowData = [];
for (var i = 0; i<10; i++) {
    rowData.push({make: "Toyota", model: "Celica", price: 35000 + (i * 1000)});
    rowData.push({make: "Ford", model: "Mondeo", price: 32000 + (i * 1000)});
    rowData.push({make: "Porsche", model: "Boxter", price: 72000 + (i * 1000)});
}

var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    editType: 'fullRow',
    onCellFocused: function(event) {
        console.log('onCellFocused: rowIndex = ' + event.rowIndex + ', column = ' + event.column.getId());
    }
};

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
});
