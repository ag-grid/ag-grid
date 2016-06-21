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
    {make: "Seat", model: "Leon", price: 46000},
];

var themeDemoGridOptions = {
    columnDefs: themeDemoColumnDefs,
    rowData: themeDemoRowData
};

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#fresh-demo');
    new agGrid.Grid(eGridDiv, themeDemoGridOptions);

    eGridDiv = document.querySelector('#blue-demo');
    new agGrid.Grid(eGridDiv, themeDemoGridOptions);

    eGridDiv = document.querySelector('#dark-demo');
    new agGrid.Grid(eGridDiv, themeDemoGridOptions);

    eGridDiv = document.querySelector('#bootstrap-demo');
    new agGrid.Grid(eGridDiv, themeDemoGridOptions);

    themeDemoGridOptions.rowHeight = 48;
    eGridDiv = document.querySelector('#material-demo');
    new agGrid.Grid(eGridDiv, themeDemoGridOptions);
});
