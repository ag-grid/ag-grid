var gridOptions = {
    columnDefs: [
        { headerName: "A", field: 'a' },
        { headerName: "B", field: 'b' },
        { headerName: "£A", field: 'a', valueFormatter: currencyFormatter },
        { headerName: "£B", field: 'b', valueFormatter: currencyFormatter },
        { headerName: "(A)", field: 'a', valueFormatter: bracketsFormatter },
        { headerName: "(B)", field: 'b', valueFormatter: bracketsFormatter },
    ],
    defaultColDef: {
        flex: 1,
        cellClass: 'number-cell',
        resizable: true,
    },
    rowData: createRowData()
};

function bracketsFormatter(params) {
    return '(' + params.value + ')';
}

function currencyFormatter(params) {
    return '£' + formatNumber(params.value);
}

function formatNumber(number) {
    // this puts commas into the number eg 1000 goes to 1,000,
    // i pulled this from stack overflow, i have no idea how it works
    return Math.floor(number).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function createRowData() {
    var rowData = [];

    for (var i = 0; i<100; i++) {
        rowData.push({
            a: Math.floor(((i + 2) * 173456) % 10000),
            b: Math.floor(((i + 7) * 373456) % 10000),
        });
    }

    return rowData;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
