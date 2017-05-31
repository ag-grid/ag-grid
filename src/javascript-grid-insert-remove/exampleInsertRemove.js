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
    animateRows: true,
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

function clearData() {
    gridOptions.api.setRowData([]);
}

function onAddRow() {
    var newItem = createNewRowData();
    gridOptions.api.updateRowData({add: [newItem]});
}

function addItems() {
    var newItems = [createNewRowData(), createNewRowData(), createNewRowData()];
    gridOptions.api.updateRowData({add: newItems});
}

function updateItems() {
    // update the first 5 items
    var itemsToUpdate = [];
    gridOptions.api.forEachNodeAfterFilterAndSort( function(rowNode, index) {
        // only do first 5
        if (index>=5) { return; }

        var data = rowNode.data;
        data.price = Math.floor((Math.random()*20000) + 20000);
        itemsToUpdate.push(data);
    });
    gridOptions.api.updateRowData({update: itemsToUpdate});
}

function onInsertRowAt2() {
    var newItem = createNewRowData();
    gridOptions.api.updateRowData({add: [newItem], addIndex: 2});
}

function onRemoveSelected() {
    var selectedData = gridOptions.api.getSelectedRows();
    gridOptions.api.updateRowData({remove: selectedData});
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
});
