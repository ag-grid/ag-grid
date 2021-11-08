var columnDefs = [
    {field: "athlete", hide: true},
    {field: "age"},
    {field: "country", rowGroup: true},
    {field: "year"},
    {field: "date"},
    {field: "sport"},
    {field: "gold"},
    {field: "silver"},
    {field: "bronze"},
    {field: "total"}
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        sortable: true
    },
    autoGroupColumnDef: {
        comparator: function (valueA, valueB, nodeA, nodeB, isInverted) {
            var res = (valueA == valueB) ? 0 : (valueA > valueB) ? 1 : -1;
            return res;
        },
        field: 'athlete',
        sort: 'asc'
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => gridOptions.api.setRowData(data));
});
