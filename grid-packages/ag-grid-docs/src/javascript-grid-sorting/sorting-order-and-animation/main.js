var columnDefs = [
    { field: "athlete", sortingOrder: ['asc', 'desc'] },
    { field: "age", width: 90, sortingOrder: ['desc', 'asc'] },
    { field: "country", sortingOrder: ['desc', null] },
    { field: "year", width: 90, sortingOrder: ['asc'] },
    { field: "date" },
    { field: "sport" },
    { field: "gold" },
    { field: "silver" },
    { field: "bronze" },
    { field: "total" }
];

var gridOptions = {
    defaultColDef: {
        width: 170,
        sortable: true
    },
    columnDefs: columnDefs,
    rowData: null,
    animateRows: true,
    sortingOrder: ['desc', 'asc', null]
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
