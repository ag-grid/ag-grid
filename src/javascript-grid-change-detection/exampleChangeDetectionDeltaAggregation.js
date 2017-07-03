var columnDefs = [
    {field: 'topGroup', rowGroup: true, hide: true},
    {field: 'group', rowGroup: true, hide: true},
    {headerName: 'ID',field: 'id', cellClass: 'number-cell'},
    {headerName: 'Value Getter A', field: 'a', type: 'valueColumn', valueGetter: sharedValueGetter},
    {headerName: 'Value Getter B', field: 'b', type: 'valueColumn', valueGetter: sharedValueGetter},
    {headerName: 'Normal C', field: 'c', type: 'valueColumn'},
    {headerName: 'Normal D', field: 'd', type: 'valueColumn'},
    {headerName: 'Normal E', field: 'e', type: 'valueColumn'},
    {headerName: 'Normal F', field: 'f', type: 'valueColumn'},
    {headerName: 'Total',
        type: 'totalColumn',
        // we use getValue() instead of data.a so that it gets the aggregated values at the group level
        valueGetter: 'getValue("a") + getValue("b") + getValue("c") + getValue("d") + getValue("e") + getValue("f")'}
];

var callCount = 0;
var rowIdCounter = 0;

var rowData = createRowData();

function sharedValueGetter(params) {
    var field = params.colDef.field;
    var result = params.data[field];
    console.log('callCount='+ callCount+ ', valueGetter:('+field+','+params.node.id+')='+result);
    callCount++;
    return result;
}

function createRowData() {
    var result = [];
    for (var i = 1; i<=2; i++) {
        for (var j = 1; j <= 5; j++) {
            for (var k = 1; k <= 3; k++) {
                var rowDataItem = createRowItem(i,j,k);
                result.push(rowDataItem);
            }
        }
    }
    return result;
}

function createRowItem(i,j,k) {
    var rowDataItem = {
        topGroup: i === 1 ? 'Top' : 'Bottom',
        group: 'Group ' + j,
        id: rowIdCounter++,
        a: (j * k * 863) % 100,
        b: (j * k * 811) % 100,
        c: (j * k * 743) % 100,
        d: (j * k * 677) % 100,
        e: (j * k * 619) % 100,
        f: (j * k * 571) % 100
    };
    return rowDataItem;
}

var gridOptions = {
    columnDefs: columnDefs,
    columnTypes: {
        valueColumn: { editable: true, aggFunc: 'sum', valueParser: 'Number(newValue)', cellClass: 'number-cell',
            cellRenderer: 'animateShowChange', filter: 'number'},
        totalColumn: { cellRenderer: 'animateShowChange', cellClass: 'number-cell'}
    },
    groupDefaultExpanded: 1,
    rowData: rowData,
    suppressAggFuncInHeader: true,
    animateRows: true,
    enableSorting: true,
    getRowNodeId: function(rowData) {
        return rowData.id;
    },
    onCellValueChanged: function() {
        resetCallCount();
    },
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
        resetCallCount();
    }
};

function resetCallCount() {
    callCount = 0;
    console.log('=========== RESET CALL COUNT =============== time = ' + new Date());
}

function updateOneRecord() {
    resetCallCount();

    var rowNodeToUpdate = pickExistingRowNodeAtRandom();

    var randomValue = createRandomNumber();
    var randomColumnId = pickRandomColumn();

    console.log('updating ' + randomColumnId + ' to ' + randomValue + ' on ', rowNodeToUpdate.data);
    rowNodeToUpdate.setDataValue(randomColumnId, randomValue);
}

function pickRandomColumn() {
    var letters = ['a','b','c','d','e','f'];
    var randomIndex = Math.floor(Math.random()*letters.length);
    return letters[randomIndex];
}

function createRandomNumber() {
    return Math.floor(Math.random() * 100);
}

function pickExistingRowItemAtRandom() {
    var rowNode = pickExistingRowNodeAtRandom();
    return rowNode ? rowNode.data : null;
}

function pickExistingRowNodeAtRandom() {
    var allItems = [];
    gridOptions.api.forEachLeafNode(function(rowNode) {
        allItems.push(rowNode);
    });

    if (allItems.length===0) { return; }
    var result = allItems[Math.floor(Math.random() * allItems.length)];

    return result;
}

function updateUsingTransaction() {
    resetCallCount();

    var itemToUpdate = pickExistingRowItemAtRandom();
    if (!itemToUpdate) { return; }

    console.log('updating - before', itemToUpdate);

    itemToUpdate[pickRandomColumn()] = createRandomNumber();
    itemToUpdate[pickRandomColumn()] = createRandomNumber();

    var transaction = {
        update: [itemToUpdate]
    };

    console.log('updating - after', itemToUpdate);

    gridOptions.api.updateRowData(transaction);
}

function removeUsingTransaction() {
    resetCallCount();

    var itemToRemove = pickExistingRowItemAtRandom();
    if (!itemToRemove) { return; }

    var transaction = {
        remove: [itemToRemove]
    };

    console.log('removing', itemToRemove);

    gridOptions.api.updateRowData(transaction);
}

function addUsingTransaction() {
    resetCallCount();

    var i = Math.floor(Math.random() * 2);
    var j = Math.floor(Math.random() * 5);
    var k = Math.floor(Math.random() * 3);
    var newItem = createRowItem(i,j,k);

    var transaction = {
        add: [newItem]
    };

    console.log('adding', newItem);

    gridOptions.api.updateRowData(transaction);
}

function changeGroupUsingTransaction() {
    resetCallCount();

    var itemToUpdate = pickExistingRowItemAtRandom();
    if (!itemToUpdate) { return; }

    itemToUpdate.topGroup = (itemToUpdate.topGroup==='Top') ? 'Bottom' : 'Top';

    var transaction = {
        update: [itemToUpdate]
    };

    console.log('updating', itemToUpdate);

    gridOptions.api.updateRowData(transaction);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
