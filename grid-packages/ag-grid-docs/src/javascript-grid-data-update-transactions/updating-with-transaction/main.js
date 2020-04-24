var rowData = [
    {make: "Toyota", model: "Celica", price: 35000, zombies: 'Elly', style: 'Smooth', clothes: 'Jeans'},
    {make: "Ford", model: "Mondeo", price: 32000, zombies: 'Shane', style: 'Filthy', clothes: 'Shorts'},
    {make: "Porsche", model: "Boxter", price: 72000, zombies: 'Jack', style: 'Dirty', clothes: 'Padded'}
];

var gridOptions = {
    columnDefs: [
        { field: "make" },
        { field: "model" },
        { field: "price" },
        { field: "zombies" },
        { field: "style" },
        { field: "clothes" }
    ],
    defaultColDef: {
      flex: 1,
    },
    rowData: rowData,
    rowSelection: 'multiple',
    animateRows: true,
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

function addItems() {
    var newItems = [createNewRowData(), createNewRowData(), createNewRowData()];
    var res = gridOptions.api.applyTransaction({add: newItems});
    printResult(res);
}

function updateItems() {
    // update the first 5 items
    var itemsToUpdate = [];
    gridOptions.api.forEachNodeAfterFilterAndSort( function(rowNode, index) {
        // only do first 5
        if (index>=2) { return; }

        var data = rowNode.data;
        data.price = Math.floor((Math.random()*20000) + 20000);
        itemsToUpdate.push(data);
    });
    var res = gridOptions.api.applyTransaction({update: itemsToUpdate});
    printResult(res);
}

function onRemoveSelected() {
    var selectedData = gridOptions.api.getSelectedRows();
    var res = gridOptions.api.applyTransaction({remove: selectedData});
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
