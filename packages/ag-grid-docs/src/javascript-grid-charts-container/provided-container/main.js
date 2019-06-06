var columnDefs = [
    {field: "athlete", width: 150, chartDataType: 'category'},
    {field: "gold", chartDataType: 'series'},
    {field: "silver", chartDataType: 'series'},
    {field: "bronze", chartDataType: 'series'},
    {field: "total", chartDataType: 'series'}
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
    createChartContainer: createChartContainer
};

var chartPanelTemplate
    = '<div class="chart-wrapper ag-theme-balham">' +
        '<div class="chart-wrapper-top">' +
            '<span class="chart-wrapper-title"></span>' +
            '<button class="chart-wrapper-close">Destroy Chart</button>' +
        '</div>' +
        '<div class="chart-wrapper-body"></div>' +
    '</div>';

function createChartContainer(chartRef) {
    var eChart = chartRef.chartElement;

    var eTemp = document.createElement('div');
    eTemp.innerHTML = chartPanelTemplate;
    var eChartWrapper = eTemp.firstChild;

    var eParent = document.querySelector('#myGrid').parentElement;

    eParent.appendChild(eChartWrapper);

    eChartWrapper.querySelector('.chart-wrapper-body').appendChild(eChart);
    eChartWrapper.querySelector('.chart-wrapper-title').innerText = 'Chart Created At ' + new Date();

    eChartWrapper.querySelector('.chart-wrapper-close').addEventListener('click', function() {
        chartRef.destroyChart();
        eParent.removeChild(eChartWrapper);
    });

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
