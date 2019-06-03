var columnDefs = [
    {field: "athlete", width: 150, enableRowGroup: true},
    {field: "gold", enableValue: true},
    {field: "silver", enableValue: true},
    {field: "bronze", enableValue: true},
    {field: "total", enableValue: true}
];

var gridOptions = {
    defaultColDef: {
        width: 100,
        resizable: true
    },
    popupParent: document.body,
    columnDefs: columnDefs,
    enableRangeSelection: true,
    enableCharts: true,
    processChartOptions: processChartOptions
};

function processChartOptions(params) {
    var options = params.options;

    switch (params.type) {
        case 'groupedBar':
            options.legendPosition = 'bottom';
            break;
        case 'stackedBar':
            options.legendPosition = 'bottom';
            break;
        case 'pie':
            options.legendPosition = 'top';
            break;
        case 'doughnut':
            options.legendPosition = 'right';
            break;
        case 'line':
            options.legendPosition = 'left';
            break;
    }

    return options;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/wideSpreadOfSports.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});