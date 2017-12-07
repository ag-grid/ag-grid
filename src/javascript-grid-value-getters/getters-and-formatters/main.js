var columnDefs = [
    {headerName: "Number", field: "number", cellClass: 'number-cell'},
    {headerName: "Formatted", field: "number", valueFormatter: currencyFormatter, cellClass: 'number-cell'},
    {headerName: "A", field: 'a', valueFormatter: currencyFormatter, cellClass: 'number-cell'},
    {headerName: "B", field: 'b', valueFormatter: currencyFormatter, cellClass: 'number-cell'},
    {headerName: "A + B", colId: 'a&b', valueFormatter: currencyFormatter, cellClass: 'number-cell',
        valueGetter: function aPlusBValueGetter(params) {
            return params.data.a + params.data.b;
        }},
    {headerName: "Chain", valueFormatter: currencyFormatter, cellClass: 'number-cell',
        valueGetter: function chainValueGetter(params) {
            return params.getValue('a&b') * 1000;
        }},
    {headerName: "Const",
        valueGetter: function() {
        return 'Const';
    }}
];

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

    var words = ['One', 'Apple', 'Moon', 'Sugar', 'Grid', 'Banana', 'Sunshine', 'Stars', 'Black', 'White', 'Salt', 'Beach'];

    for (var i = 0; i<100; i++) {
        var randomWords = words[i % words.length] + ' ' + words[i*17 % words.length];
        rowData.push({
            number: Math.floor(((i+2) * 173456) % 10000),
            a: Math.floor(i%4),
            b: Math.floor(i%7)
        });
    }

    return rowData;
}

var gridOptions = {
    columnDefs: columnDefs,
    rowData: createRowData(),
    enableColResize: true,
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
