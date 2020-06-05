var columnDefs = [
    { field: "country", pivot: true },
    { field: "year", rowGroup: true },
    { field: "sport", rowGroup: true },
    { field: "total", aggFunc: 'sum' },
    { field: "gold", aggFunc: 'sum' },
];

var gridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    },
    pivotMode: true,
    columnDefs: columnDefs,
    onFirstDataRendered: onFirstDataRendered,
    popupParent: document.body
};

function onFirstDataRendered(event) {
    var chartContainer = document.querySelector('#chart');

    var params = {
        chartType: 'groupedColumn',
        chartContainer: chartContainer,
        processChartOptions: function(params) {
            params.options.legend.position = "bottom";
            params.options.navigator.enabled = true;
            params.options.navigator.height = 10;

            return params.options;
        }
    };

    event.api.createPivotChart(params);

    // expand one row for demonstration purposes
    setTimeout(function() { event.api.getDisplayedRowAtIndex(2).setExpanded(true); }, 0);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/wideSpreadOfSports.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
