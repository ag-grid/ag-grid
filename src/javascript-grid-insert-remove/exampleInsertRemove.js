var columnDefs = [
    {headerName: "Make", field: "make"},
    {headerName: "Model", field: "model"},
    {headerName: "Price", field: "price"},
    {headerName: "Zombies", field: "zombies"},
    {headerName: "Style", field: "style"},
    {headerName: "Clothes", field: "clothes"}
];

var rowData = [
    {make: "Toyota", model: "Celica", price: 35000, zombies: 'Elly', style: 'Smooth', clothes: 'Jeans'},
    {make: "Ford", model: "Mondeo", price: 32000, zombies: 'Shane', style: 'Filthy', clothes: 'Shorts'},
    {make: "Porsche", model: "Boxter", price: 72000, zombies: 'Jack', style: 'Dirty', clothes: 'Padded'}
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
        price: 35000 + (newCount * 17),
        zombies: 'Headless',
        style: 'Little',
        clothes: 'Airbag'
    };
    newCount++;
    return newData;
}

function getRowData() {
    var rowData = [];
    gridOptions.api.forEachNode( function(node) {
        rowData.push(node.data);
    });
    console.log('Row Data:');
    console.log(rowData);
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
