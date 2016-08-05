var columnDefs = [
    {headerName: "Make", field: "make"},
    {headerName: "Model", field: "model"},
    {headerName: "Price", field: "price"}
];

var rowData = [
    {make: "Toyota", model: "Celica", price: 35000},
    {make: "Ford", model: "Mondeo", price: 32000},
    {make: "Porsche", model: "Boxter", price: 72000}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    rowSelection: 'multiple'
};

var newCount = 1;

function createNewRowData() {
    var newData = {
        make: "Toyota " + newCount,
        model: "Celica " + newCount,
        price: 35000 + (newCount * 17)
    };
    newCount++;
    return newData;
}

function onAddRow() {
    var newItem = createNewRowData();
    gridOptions.api.addItems([newItem]);
}

function onInsertRowAt2() {
    var newItem = createNewRowData();
    gridOptions.api.insertItemsAtIndex(2, [newItem]);
}

function onRemoveSelected() {
    var selectedNodes = gridOptions.api.getSelectedNodes();
    gridOptions.api.removeItems(selectedNodes);
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
});
