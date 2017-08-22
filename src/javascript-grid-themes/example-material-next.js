var columnDefs = [
    { 
        headerName: "A group", 
        children: [
            {headerName: "Make", field: "make", filter: "text", cellEditor: 'text', editable: true, checkboxSelection: true, headerCheckboxSelection: true, rowGroup: true  },
            {headerName: "Car Model", columnGroupShow: 'open', field: "model", filter: "set", editable: true, cellEditor: 'richSelect', cellEditorParams: { cellHeight: 48, values:  [ 'Mondeo', 'Celica', '(other)' ] }, rowGroup: true },
            {headerName: "Date", columnGroupShow: 'open', field: "done", filter: "date", editable: true, cellEditor: 'largeText' },
            {headerName: "Price", field: "price", type: "numericColumn", filter: "number", filterParams: { applyButton: true, clearButton: true } },
        ]
    }
];

// specify the data
var rowData = [
    {make: "Toyota", model: "Celica", price: 35000, done: new Date()},
    {make: "Ford", model: "Mondeo", price: 32000, done: new Date()},
    {make: "Toyota", model: "Celica", price: 35000, done: new Date()},
    {make: "Ford", model: "Mondeo", price: 32000, done: new Date()},
    {make: "Toyota", model: "Celica", price: 35000, done: new Date()},
    {make: "Ford", model: "Mondeo", price: 32000, done: new Date()},
    {make: "Toyota", model: "Celica", price: 35000, done: new Date()},
    {make: "Ford", model: "Mondeo", price: 32000, done: new Date()},
    {make: "Toyota", model: "Celica", price: 35000, done: new Date()},
    {make: "Ford", model: "Mondeo", price: 32000, done: new Date()},
    {make: "Toyota", model: "Celica", price: 35000, done: new Date()},
    {make: "Ford", model: "Mondeo", price: 32000, done: new Date()},
    {make: "Toyota", model: "Celica", price: 35000, done: new Date()},
    {make: "Ford", model: "Mondeo", price: 32000, done: new Date()},
    {make: "Toyota", model: "Celica", price: 35000, done: new Date()},
    {make: "Ford", model: "Mondeo", price: 32000, done: new Date()},
    {make: "Toyota", model: "Celica", price: 35000, done: new Date()},
    {make: "Ford", model: "Mondeo", price: 32000, done: new Date()},
    {make: "Porsche", model: "Boxter", price: 72000, done: new Date()}
];

// let the grid know which columns and what data to use
var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    enableColResize: true,
    enableSorting: true,
    pagination: true,
    paginationPageSize: 5,
    rowHoverClass: true,
    enableFilter: true,
    floatingFilter: true,
    enableRangeSelection: true,
    rowGroupPanelShow: 'always',
    localeText: {
        clearFilter: 'clear', 
        applyFilter: 'apply'
    }
};

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {

    // lookup the container we want the Grid to use
    var eGridDiv = document.querySelector('#myGrid');

    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, gridOptions);
});

