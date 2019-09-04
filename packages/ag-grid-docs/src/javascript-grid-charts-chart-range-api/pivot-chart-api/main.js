var columnDefs = [
    { field: "country", pivot: true },
    { field: "year", rowGroup: true },
    { field: "sport", rowGroup: true },
    { field: "total", aggFunc: 'sum' },
    { field: "gold", aggFunc: 'sum' },
];

var gridOptions = {
    defaultColDef: {
        sortable: true,
        resizable: true
    },
    pivotMode: true,
    columnDefs,
    onFirstDataRendered,
};

function onFirstDataRendered(event) {
    var chartContainer = document.querySelector('#chart');

    var params = {
        chartType: 'groupedColumn',
        chartContainer,
        processChartOptions: function(params) {
            params.options.legendPosition = "bottom";
            
            return params.options;
        }
    };

    event.api.createPivotChart(params);

    // expand one row for demonstration purposes
    setTimeout(function() { params.api.getDisplayedRowAtIndex(2).setExpanded(true); }, 0);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like jQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/wideSpreadOfSports.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});