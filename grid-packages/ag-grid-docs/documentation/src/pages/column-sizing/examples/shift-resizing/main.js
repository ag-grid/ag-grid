var columnDefs = [
    { field: "athlete", width: 150 },
    { field: "age", width: 90 },
    { field: "country", width: 150 },
    { field: "year", width: 90 },
    { field: "date", width: 110 },
    { field: "sport", width: 150 },
    { field: "gold", width: 100 },
    { field: "silver", width: 100 },
    { field: "bronze", width: 100 },
    { field: "total", width: 100 }
];

var gridOptions = {
    defaultColDef: {
        resizable: true
    },
    columnDefs: columnDefs,
    rowData: null,
    colResizeDefault: 'shift'
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
