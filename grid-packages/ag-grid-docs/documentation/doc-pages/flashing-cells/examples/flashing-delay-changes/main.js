function createRowData() {
    var rowData = [];

    for (var i = 0; i<20; i++) {
        rowData.push({
            a: Math.floor( ( (i + 323) * 25435) % 10000),
            b: Math.floor( ( (i + 323) * 23221) % 10000),
            c: Math.floor( ( (i + 323) * 468276) % 10000),
            d: 0,
            e: 0,
            f: 0
        });
    }

    return rowData;
}

function formatNumber(number) {
    // this puts commas into the number eg 1000 goes to 1,000,
    // i pulled this from stack overflow, i have no idea how it works
    return Math.floor(number).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

var gridOptions = {
    columnDefs: [
        {field: 'a'},
        {field: 'b'},
        {field: 'c'},
        {field: 'd'},
        {field: 'e'},
        {field: 'f'}
    ],
    defaultColDef: {
        flex: 1,
        cellClass: 'align-right',
        enableCellChangeFlash: true,
        resizable: true,
        valueFormatter: function (params) {
            return formatNumber(params.value);
        }
    },
    rowData: createRowData(),
    cellFlashDelay: 2000,
    cellFadeDelay: 500
};

function onUpdateSomeValues() {
    var rowCount = gridOptions.api.getDisplayedRowCount();
    // pick 20 cells at random to update
    for (var i = 0; i < 20; i++) {
        var row = Math.floor(Math.random() * rowCount);
        var rowNode = gridOptions.api.getDisplayedRowAtIndex(row);
        var col = ['a','b','c','d','e','f'][i%6];
        rowNode.setDataValue(col, Math.floor(Math.random() * 10000));
    }
}

function onFlashTwoRows() {
    // pick fourth and fifth row at random
    var rowNode1 = gridOptions.api.getDisplayedRowAtIndex(4);
    var rowNode2 = gridOptions.api.getDisplayedRowAtIndex(5);
    // flash whole row, so leave column selection out
    gridOptions.api.flashCells({rowNodes: [rowNode1, rowNode2], flashDelay: 3000, fadeDelay: 2000 });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
