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
var rowData = createData(16);
var topRowData = createData(2);
var bottomRowData = createData(2);

function createData(count) {
    var result = [];
    for (var i = 1; i<=count; i++) {
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
    rowData: rowData,
    floatingTopRowData: topRowData,
    floatingBottomRowData: bottomRowData,
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

function isFlashCellsSelected() {
    return document.querySelector('#flashCells').checked;
}

function isForceRefreshSelected() {
    return document.querySelector('#forceRefresh').checked;
}

function scrambleAndRefreshAll() {
    scramble();
    var params = {
        flash: isFlashCellsSelected(),
        forceRefresh: isForceRefreshSelected()
    };
    gridOptions.api.refreshCells(params);
}

function scrambleAndRefreshLeftToRight() {
    scramble();

    ['a','b','c','d','e','f'].forEach( function(col, index) {
        var millis = index * 100;
        var params = {
            flash: isFlashCellsSelected(),
            forceRefresh: isForceRefreshSelected(),
            columns: [col]
        };
        callRefreshAfterMillis(params, millis);
    });
}

function scrambleAndRefreshTopToBottom() {
    scramble();

    var frame = 0;
    var i;
    var rowNode;

    for (i = 0; i<gridOptions.api.getFloatingTopRowCount(); i++) {
        rowNode = gridOptions.api.getFloatingTopRow(i);
        refreshRow(rowNode);
    }

    for (i = 0; i<gridOptions.api.getDisplayedRowCount(); i++) {
        rowNode = gridOptions.api.getDisplayedRowAtIndex(i);
        refreshRow(rowNode);
    }

    for (i = 0; i<gridOptions.api.getFloatingBottomRowCount(); i++) {
        rowNode = gridOptions.api.getFloatingBottomRow(i);
        refreshRow(rowNode);
    }

    function refreshRow(rowNode) {
        var millis = frame++ * 100;
        var rowNodes = [rowNode]; // params needs an array
        var params = {
            flash: isFlashCellsSelected(),
            forceRefresh: isForceRefreshSelected(),
            rowNodes: rowNodes
        };
        callRefreshAfterMillis(params, millis);
    }
}

function callRefreshAfterMillis(params, millis) {
    setTimeout( function() {
        gridOptions.api.refreshCells(params);
    }, millis);
}

function scramble() {
    rowData.forEach(scrambleItem);
    topRowData.forEach(scrambleItem);
    bottomRowData.forEach(scrambleItem);
}

function scrambleItem(item) {
    ['a','b','c','d','e','f'].forEach( function(colId) {
        // skip 50% of the cells so updates are random
        if (Math.random() > .5) { return; }
        item[colId] = Math.floor(Math.random() * 100);
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
