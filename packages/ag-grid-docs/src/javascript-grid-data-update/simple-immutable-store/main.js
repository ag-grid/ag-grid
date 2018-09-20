var columnDefs = [
    // these are the row groups, so they are all hidden (they are showd in the group column)
    {headerName: 'Symbol', field: 'symbol'},
    {headerName: 'Price', field: 'price'},
    {headerName: 'Group', field: 'group'}
];

function getInitialData() {
    var data = [];
    for (var i = 0; i < 10; i++) {
        data.push(createItem());
    }

    return data;
}

var immutableStore;

function addFiveItems(append) {
    var newStore = immutableStore.slice();
    for (var i = 0; i < 5; i++) {
        var newItem = createItem();
        if (append) {
            newStore.push(newItem);
        } else {
            newStore.splice(0,0,newItem);
        }
    }
    immutableStore = newStore;
    gridOptions.api.setRowData(immutableStore);
}

function removeSelected() {
    var selectedRowNodes = gridOptions.api.getSelectedNodes();
    var selectedIds = selectedRowNodes.map(function(rowNode) {
        return rowNode.id;
    });
    immutableStore = immutableStore.filter(function(dataItem) {
        return selectedIds.indexOf(dataItem.symbol) < 0;
    });
    gridOptions.api.setRowData(immutableStore);
}

function setSelectedToGroup(newGroup) {
    var selectedRowNodes = gridOptions.api.getSelectedNodes();
    var selectedIds = selectedRowNodes.map(function(rowNode) {
        return rowNode.id;
    });
    immutableStore = immutableStore.map(function(dataItem) {
        var itemSelected = selectedIds.indexOf(dataItem.symbol) >= 0;
        if (itemSelected) {
            return {
                // symbol and price stay the same
                symbol: dataItem.symbol,
                price: dataItem.price,
                // group gets the group
                group: newGroup
            };
        } else {
            return dataItem;
        }
    });
    gridOptions.api.setRowData(immutableStore);
}

function updatePrices() {
    var newStore = [];
    immutableStore.forEach(function(item) {
        newStore.push({
            // use same symbol as last time, this is the unique id
            symbol: item.symbol,
            // group also stays the same
            group: item.group,
            // add random price
            price: Math.floor(Math.random() * 100)
        });
    });
    immutableStore = newStore;
    gridOptions.api.setRowData(immutableStore);
}

function filter(list, callback) {
    var filteredList = [];
    list.forEach(function(item) {
        if (callback(item)) {
            filteredList.push(item);
        }
    });
    return filteredList;
}

function createItem() {
    var item = {
        group: 'A',
        symbol: createUniqueRandomSymbol(),
        price: Math.floor(Math.random() * 100)
    };
    return item;
}

function onGroupingEnabled(enabled) {
    setGroupingEnabled(enabled, gridOptions.columnApi);
}

function setGroupingEnabled(enabled, columnApi) {
    if (enabled) {
        columnApi.setRowGroupColumns(['group']);
        columnApi.setColumnVisible('group', false);
        columnApi.setColumnVisible('symbol', false);
    } else {
        columnApi.setRowGroupColumns([]);
        columnApi.setColumnVisible('group', true);
        columnApi.setColumnVisible('symbol', true);
    }
    setItemVisible('groupingOn', !enabled);
    setItemVisible('groupingOff', enabled);
}

function setItemVisible(id, visible) {
    var element = document.querySelector('#' + id);
    element.style.display = visible ? null : 'none';
}

// creates a unique symbol, eg 'ADG' or 'ZJD'
function createUniqueRandomSymbol() {
    var symbol;
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    var isUnique = false;
    while (!isUnique) {
        symbol = '';
        // create symbol
        for (var i = 0; i < 3; i++) {
            symbol += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        // check uniqueness
        isUnique = true;
        immutableStore.forEach(function(oldItem) {
            if (oldItem.symbol === symbol) {
                isUnique = false;
            }
        });
    }

    return symbol;
}

function reverseItems() {
    immutableStore.reverse();
    gridOptions.api.setRowData(immutableStore);
}

var gridOptions = {
    deltaRowDataMode: true,
    statusBar: {
        items: [
            { component: 'agAggregationComponent' }
        ]
    },
    columnDefs: columnDefs,
    animateRows: true,
    enableColResize: true,
    rowSelection: 'multiple',
    enableRangeSelection: true,
    autoGroupColumnDef: {
        headerName: 'Symbol',
        cellRenderer:'agGroupCellRenderer',
        field: 'symbol'
    },
    groupDefaultExpanded: 1,
    enableSorting: true,
    rowData: immutableStore,
    getRowNodeId: function(data) {
        return data.symbol;
    },
    onGridReady: function(params) {
        immutableStore = [];
        immutableStore = getInitialData();
        params.api.setRowData(immutableStore);
        setGroupingEnabled(false, params.columnApi);
    }
};

// after page is loaded, create the grid.
document.addEventListener('DOMContentLoaded', function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
});
