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
    var res = gridOptions.api.updateRowData({add: [newItem]});
    printResult(res);
}

function addItems() {
    var newItems = [createNewRowData(), createNewRowData(), createNewRowData()];
    var res = gridOptions.api.updateRowData({add: newItems});
    printResult(res);
}

function addItemsAtIndex() {
    var newItems = [createNewRowData(), createNewRowData(), createNewRowData()];
    var res = gridOptions.api.updateRowData({add: newItems, addIndex: 2});
    printResult(res);
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
    var res = gridOptions.api.updateRowData({update: itemsToUpdate});
    printResult(res);
}

function onInsertRowAt2() {
    var newItem = createNewRowData();
    var res = gridOptions.api.updateRowData({add: [newItem], addIndex: 2});
    printResult(res);
}

function onRemoveSelected() {
    var selectedData = gridOptions.api.getSelectedRows();
    var res = gridOptions.api.updateRowData({remove: selectedData});
    printResult(res);
}

function printResult(res) {
    console.log('---------------------------------------')
    if (res.add) {
        res.add.forEach( function(rowNode) {
            console.log('Added Row Node', rowNode);
        });
    }
    if (res.remove) {
        res.remove.forEach( function(rowNode) {
            console.log('Removed Row Node', rowNode);
        });
    }
    if (res.update) {
        res.update.forEach( function(rowNode) {
            console.log('Updated Row Node', rowNode);
        });
    }
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
});
