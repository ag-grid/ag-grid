var columnDefs = [
    // different ways to define 'categories'
    {field: "athlete", width: 150, chartDataType: 'category'},
    {field: "age", enableRowGroup: true, sort: 'asc'},
    {field: "sport"},

    // excludes year from charts
    {field: "year", chartDataType: 'excluded'},

    // different ways to define 'series'
    {field: "gold", enableValue: true},
    {field: "silver", chartDataType: 'series'},
    {field: "bronze"}
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
    processChartOptions: function (params) {
        var opt = params.options;

        opt.title = {text: "Medals by Age"};
        opt.legendPosition = 'bottom';

        if (params.type === 'groupedBar') {
            opt.xAxis.labelRotation = 0;
        }

        opt.seriesDefaults.tooltipRenderer = function (params) {
            var value = params.datum[params.yField];
            return `<b>${params.yField}</b>: ${value}`;
        };

        return opt;
    },
    onFirstDataRendered: onFirstDataRendered
};

function onFirstDataRendered(params) {
    var chartRangeParams = {
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 79,
            columns: ['age', 'gold', 'silver', 'bronze']
        },
        chartType: 'groupedBar',
        chartContainer: document.querySelector('#myChart'),
        aggregate: true
    };

    params.api.chartRange(chartRangeParams);
}
// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/wideSpreadOfSports.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
