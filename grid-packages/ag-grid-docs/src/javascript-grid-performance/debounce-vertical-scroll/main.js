var columnDefs = [
    { field: "athlete"},
    { field: "age"},
    { field: "country"},
    { field: "year"},
    { field: "date"},
    { field: "sport"},
    { field: "gold"},
    { field: "silver"},
    { field: "bronze"},
    { field: "total"}
];

var gridOptions = {
    debounceVerticalScrollbar: true,
    defaultColDef: {
        resizable: true
    },
    columnDefs: columnDefs,
    rowData: null
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
