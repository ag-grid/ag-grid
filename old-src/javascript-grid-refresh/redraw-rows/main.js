var columnDefs = [
    {headerName: 'A', field: 'a'},
    {headerName: 'B', field: 'b'},
    {headerName: 'C', field: 'c'},
    {headerName: 'D', field: 'd'},
    {headerName: 'E', field: 'e'},
    {headerName: 'F', field: 'f'}
];


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

var colorIndex = 0;
var colors = ['#000000','#000066','#006600','#660000'];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: createData(16),
    getRowStyle: function() {
        return {
            backgroundColor: colors[colorIndex]
        }
    },
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};



function progressColor() {
    colorIndex++;
    if (colorIndex === colors.length) {
        colorIndex = 0;
    }
}

function redrawAllRows() {
    progressColor();
    gridOptions.api.redrawRows();
}

function redrawTopRows() {
    progressColor();
    var rows = [];
    for (var i = 0; i<8; i++) {
        var row = gridOptions.api.getDisplayedRowAtIndex(i);
        rows.push(row);
    }
    gridOptions.api.redrawRows({rowNodes: rows});
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
