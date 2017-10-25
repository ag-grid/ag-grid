var columnDefs = [
    {headerName: 'A', field: 'a'},
    {headerName: 'B', field: 'b'},
    {headerName: 'C', field: 'c'},
    {headerName: 'D', field: 'd'},
    {headerName: 'E', field: 'e'},
    {headerName: 'F', field: 'f'}
];

// placing in 13 rows, so there are exactly enough rows to fill the grid, makes
// the row animation look nice when you see all the rows
var data = [];
var topRowData = [];
var bottomRowData = [];

function createData(count) {
    var result = [];
    for (var i = 1; i <= count; i++) {
        result.push({
            a: (i * 863) % 100,
            b: (i * 811) % 100,
            c: (i * 743) % 100,
            d: (i * 677) % 100,
            e: (i * 619) % 100,
            f: (i * 571) % 100
        });
    }
    return result;
}

var gridOptions = {
    columnDefs: columnDefs,
    rowData: [],
    pinnedTopRowData: [],
    pinnedBottomRowData: [ ],
    enableCellChangeFlash: true,
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
        // placing in 13 rows, so there are exactly enough rows to fill the grid, makes
        // the row animation look nice when you see all the rows
        data = createData(14);
        topRowData = createData(2);
        bottomRowData = createData(2);
        params.api.setRowData(data);
        params.api.setPinnedTopRowData(topRowData);
        params.api.setPinnedBottomRowData(bottomRowData);
    }
};

function isForceRefreshSelected() {
    return document.querySelector('#forceRefresh').checked;
}

function scrambleAndRefreshAll() {
    scramble();
    var params = {
        force: isForceRefreshSelected()
    };
    gridOptions.api.refreshCells(params);
}

function scrambleAndRefreshLeftToRight() {
    scramble();

    ['a', 'b', 'c', 'd', 'e', 'f'].forEach(function(col, index) {
        var millis = index * 100;
        var params = {
            force: isForceRefreshSelected(),
            columns: [col]
        };
        callRefreshAfterMillis(params, millis, gridOptions.api);
    });
}

function scrambleAndRefreshTopToBottom() {
    scramble();

    var frame = 0;
    var i;
    var rowNode;

    for (i = 0; i < gridOptions.api.getPinnedTopRowCount(); i++) {
        rowNode = gridOptions.api.getPinnedTopRow(i);
        refreshRow(rowNode);
    }

    for (i = 0; i < gridOptions.api.getDisplayedRowCount(); i++) {
        rowNode = gridOptions.api.getDisplayedRowAtIndex(i);
        refreshRow(rowNode);
    }

    for (i = 0; i < gridOptions.api.getPinnedBottomRowCount(); i++) {
        rowNode = gridOptions.api.getPinnedBottomRow(i);
        refreshRow(rowNode);
    }

    function refreshRow(rowNode) {
        var millis = frame++ * 100;
        var rowNodes = [rowNode]; // params needs an array
        var params = {
            force: isForceRefreshSelected(),
            rowNodes: rowNodes
        };
        callRefreshAfterMillis(params, millis, gridOptions.api);
    }
}

function callRefreshAfterMillis(params, millis, gridApi) {
    setTimeout(function() {
        gridApi.refreshCells(params);
    }, millis);
}

function scramble() {
    data.forEach(scrambleItem);
    topRowData.forEach(scrambleItem);
    bottomRowData.forEach(scrambleItem);
}

function scrambleItem(item) {
    ['a', 'b', 'c', 'd', 'e', 'f'].forEach(function(colId) {
        // skip 50% of the cells so updates are random
        if (Math.random() > 0.5) {
            return;
        }
        item[colId] = Math.floor(Math.random() * 100);
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
