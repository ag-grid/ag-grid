
// this example has items declared globally. bad javascript. but keeps the example simple.

var columnDefs = [
    {headerName: "Make", field: "make"},
    {headerName: "Model", field: "model"},
    {headerName: "Price", field: "price"}
];

var rowData = [];

for (var i = 0; i<1000; i++) {
    var model = ['Toyota','Mercedes','Porsche'][i%3];
    rowData.push({make: "Row-"+i, model: model, price: 100*i*13});
}

var gridOptions = {
    rowBuffer: 0,
    columnDefs: columnDefs,
    rowData: rowData,
    onReady: function(event) {
        event.api.sizeColumnsToFit();
    }
};

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    // angularGrid is a global function
    agGridGlobalFunc('#myGrid', gridOptions);
});
