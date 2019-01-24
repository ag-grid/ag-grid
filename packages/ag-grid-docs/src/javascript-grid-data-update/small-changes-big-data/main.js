var columnDefs = [
    { field: 'group1', enableRowGroup: true, rowGroup: true, hide: true, },
    { field: 'group2', enableRowGroup: true, rowGroup: true, hide: true, },
    { field: "id", headerName: "ID" },
    { field: "name" },
    { field: 'value', enableCellChangeFlash: true,
        aggFunc: myAggFunc,
        sort: 'asc', comparator: myComparator,
        filter: MyFilter
    }
];

var aggCallCount;
var compareCallCount;
var filterCallCount;

function myAggFunc(values) {
    aggCallCount++;

    var total = 0;
    for (var i = 0; i<values.length; i++) {
        total += values[i];
    }
    return total;
}

function myComparator(a, b) {
    compareCallCount++;
    return a - b;
}

function MyFilter() {}

MyFilter.prototype.init = function() {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = 'This is a dummy filter';
};

MyFilter.prototype.getGui = function() {
    return this.eGui;
};

MyFilter.prototype.setModel = function(model) {
    console.log('setting filter model', model);
};

MyFilter.prototype.isFilterActive = function(model) {
    return true;
};

MyFilter.prototype.doesFilterPass = function(params) {
    filterCallCount++;
    return true;
};


function isFirstColumn(params) {
    let displayedColumns = params.columnApi.getAllDisplayedColumns();
    let thisIsFirstColumn = displayedColumns[0] === params.column;
    return thisIsFirstColumn;
}

var defaultColDef = {
    filter: true,
    sortable: true,
    resizable: true
};

function getRowNodeId(data) {
    return data.id;
}

function onBtDuplicate() {
    // get the first child of the
    var selectedList = gridOptions.api.getSelectedNodes();
    if (!selectedList || selectedList.length===0) {
        console.log('No rows selected!');
        return;
    }

    rowData = rowData.slice();
    selectedList.forEach( function(rowNode) {
        var oldData = rowNode.data;
        idCounter++;
        var newItem = createDataItem(idCounter, 'Thing ' + idCounter, oldData.group1, oldData.group2, oldData.value);
        rowData.push(newItem);
    });

    timeSetRowData('Update');
}

function onBtUpdate() {
    // get the first child of the
    var selectedList = gridOptions.api.getSelectedNodes();
    if (!selectedList || selectedList.length===0) {
        console.log('No rows selected!');
        return;
    }

    rowData = rowData.slice();
    selectedList.forEach( function(rowNode) {
        var oldData = rowNode.data;
        var newItem = createDataItem(oldData.id, oldData.name, oldData.group1, oldData.group2, Math.floor(Math.random() * 100));
        var index = rowData.indexOf(oldData);
        rowData[index] = newItem;
    });

    timeSetRowData('Update');
}

function onBtDelete() {

    // get the first child of the
    var selectedList = gridOptions.api.getSelectedNodes();
    if (!selectedList || selectedList.length===0) {
        console.log('No rows selected!');
        return;
    }

    var selectedMap = {};
    selectedList.forEach( function(item) {selectedMap[item.id] = true; } );

    rowData = rowData.filter( function(item) {
        return !selectedMap[item.id];
    });

    timeSetRowData('Delete');
}

function timeSetRowData(name) {
    aggCallCount = 0;
    compareCallCount = 0;
    filterCallCount = 0;
    var start = new Date().getTime();
    gridOptions.api.setRowData(rowData);
    var end = new Date().getTime();
    console.log(name + ' finished in ' + (end-start) + 'ms, aggCallCount = ' + aggCallCount + ', compareCallCount = '
        + compareCallCount + ', filterCallCount = ' + filterCallCount);
}

var gridOptions = {
    defaultColDef: defaultColDef,
    columnDefs: columnDefs,
    getRowNodeId: getRowNodeId,
    deltaRowDataMode: true,
    rowSelection: 'multiple',
    groupSelectsChildren: true,
    animateRows: true,
    suppressMaintainUnsortedOrder: true,
    suppressRowClickSelection: true,
    autoGroupColumnDef: {
        checkboxSelection: true
    }
};

var rowData = [];

function createData() {
    var nextGroup = 0;
    for (let i = 0; i < 10000; i++) {
        if (i % 2 === 0) {
            nextGroup++;
        }
        var group1 = 'Group-' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.substr(i%26, 1);
        var group2 = 'Group-' + Math.round(i/1000);
        idCounter++;
        rowData.push(createDataItem(idCounter, 'Thing ' + idCounter, group1, group2, Math.floor(Math.random() * 100)));
    }
}

var idCounter = 0;

function createDataItem(id, name, group1, group2, value) {
    return {
        id: id,
        name: name,
        group1: group1,
        group2: group2,
        value: value
    };
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
    gridOptions.api.setFilterModel({
        value: ''
    });
    createData();
    timeSetRowData('Initial');
});
