var columnDefs = [
    {field: 'a'},
    {field: 'b'},
    {field: 'c'},
    {field: 'd'},
    {field: 'e'}
];

var rowData = [
    {a: 1, b: 1, c: 1, d: 1, e: 1},
    {a: 2, b: 2, c: 2, d: 2, e: 2}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});