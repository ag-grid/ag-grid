var themeDemoColumnDefs = [
    {headerName: "Make", field: "make"},
    {headerName: "Model", field: "model"},
    {headerName: "Price", field: "price"}
];

var themeDemoRowData = [
    {make: "Toyota", model: "Celica", price: 35000},
    {make: "Ford", model: "Mondeo", price: 32000},
    {make: "Porsche", model: "Boxter", price: 72000},
    {make: "Honda", model: "CRV", price: 55000},
    {make: "Seat", model: "Leon", price: 46000}
];

var themeDemoGridOptions = {
    columnDefs: themeDemoColumnDefs,
    rowData: themeDemoRowData,
    onGridReady: function(params) {
        // setTimeout( function() {
            params.api.sizeColumnsToFit();
        // }, 3000);
    }
};

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {

    ['#fresh-demo','#blue-demo','#dark-demo','#bootstrap-demo','#material-demo'].forEach( function(gridId) {
        var eGridDiv = document.querySelector(gridId);
        if (gridId==='#material-demo') {
            themeDemoGridOptions.rowHeight = 48;
        }
        new agGrid.Grid(eGridDiv, themeDemoGridOptions);
    });

});
