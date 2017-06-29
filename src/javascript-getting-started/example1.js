var gridOptions = {
    columnTypes: {
        "default": {width: 100}
    },
    columnDefs: [
        {headerName: "Make", field: "make", type: "default"},
        {headerName: "Model", field: "model", type: "default"},
        {headerName: "Price", field: "price"}
    ],
    rowData: [
        {make: "Toyota", model: "Celica", price: 35000},
        {make: "Ford", model: "Mondeo", price: 32000},
        {make: "Porsche", model: "Boxter", price: 72000}
    ]
};

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function () {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
});
