var columnDefs = [
    { field: 'group1', enableRowGroup: true, rowGroup: true, hide: true, },
    { field: 'group2', enableRowGroup: true, rowGroup: true, hide: true, },
    { field: "city",
        width: 150,
        sort: 'asc',
        comparator: myComparator
    },
    { field: 'value', enableCellChangeFlash: true,
        width: 150,
        aggFunc: myAggFunc,
        filter: MyFilter
    }
];

var aggCallCount;
var compareCallCount;
var filterCallCount;

var CITIES = ['Tokyo','Jakarta','Delhi','Manila','Seoul','Shanghai','Mumbai','New York',
                'Beijing','Sao Paulo','Mexico City','Guangzhou','Dhaka','Osaka-Kobe-Kyoto',
                'Moscow','Cairo','Bangkok','Los Angeles','Buenos Aires'];

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
    return a < b ? -1 : 1;
}

function MyFilter() {}

MyFilter.prototype.init = function(params) {
    this.valueGetter = params.valueGetter;
    this.filterValue = null;

    this.eGui = document.createElement('div');
    this.eGui.innerHTML = '<div>Greater Than: <input type="text"/></div>';
    this.eInput = this.eGui.querySelector('input');
    var that = this;
    this.eInput.addEventListener('input', function() {
        that.getValueFromInput();
        params.filterChangedCallback();
    });
};

MyFilter.prototype.getGui = function() {
    return this.eGui;
};

MyFilter.prototype.getValueFromInput = function() {
    let value = parseInt(this.eInput.value);
    this.filterValue = isNaN(value) ? null : value;
};

MyFilter.prototype.setModel = function(model) {
    this.eInput.value = model.value;
    this.getValueFromInput();
};

MyFilter.prototype.isFilterActive = function() {
    return this.filterValue !== null;
};

MyFilter.prototype.doesFilterPass = function(params) {
    filterCallCount++;

    var value = this.valueGetter(params);
    return value > this.filterValue;
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
        var newItem = createDataItem(idCounter, oldData.name, oldData.group1, oldData.group2, oldData.city, oldData.value);
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
        var newValue = Math.floor(Math.random() * 100) + 10;
        var newItem = createDataItem(oldData.id, oldData.name, oldData.group1, oldData.group2, oldData.city, newValue);
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

function onBtClearSelection() {
    gridOptions.api.deselectAll();
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
    suppressAggAtRootLevel: true,
    suppressRowClickSelection: true,
    autoGroupColumnDef: {
        field: 'name',
        cellRendererParams: { checkbox: true }
    }
};

var rowData = [];

function letter(i) {
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.substr(i, 1);
}

function randomLetter() {
    return letter(Math.floor(Math.random()*26 + 1));
}

function createData() {
    var nextGroup = 0;
    for (let i = 0; i < 10000; i++) {
        if (i % 2 === 0) {
            nextGroup++;
        }
        var name = randomLetter() + randomLetter();
        var city = CITIES[i%CITIES.length];
        var group1 = 'Group-' + letter(i%26);
        var group2 = 'Group-' + Math.round(i/1000);
        var value = Math.floor(Math.random() * 100) + 10; // between 10 and 110
        idCounter++;
        rowData.push(createDataItem(idCounter, name, group1, group2, city, value));
    }
}

var idCounter = 0;

function createDataItem(id, name, group1, group2, city, value) {
    return {
        id: id,
        name: name,
        city: city,
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
        value: {value: '5'}
    });
    createData();
    timeSetRowData('Initial');

    setTimeout( function() {
        gridOptions.api.getDisplayedRowAtIndex(4).setExpanded(true);
    }, 1000);
    setTimeout( function() {
        gridOptions.api.getDisplayedRowAtIndex(7).setExpanded(true);
    }, 1400);
});
