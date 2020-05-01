var columnDefs = [
    { field: "athlete", width: 150, chartDataType: 'category' },
    { field: "gold", chartDataType: 'series' },
    { field: "silver", chartDataType: 'series' },
    { field: "bronze", chartDataType: 'series' },
    { field: "total", chartDataType: 'series' }
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
    columnDefs: columnDefs,
    enableRangeSelection: true,
    enableCharts: true,
    createChartContainer: createChartContainer,
    processChartOptions: function(params) {
        params.options.seriesDefaults.tooltip.renderer = function(params) {
            var titleStyle = params.color ? ' style="color: white; background-color:' + params.color + '"' : '';
            var title = params.title ? '<div class="ag-chart-tooltip-title"' + titleStyle + '>' + params.title + '</div>' : '';
            var value = params.datum[params.yKey].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            return title + '<div class="ag-chart-tooltip-content" style="text-align: center">' + value + '</div>';
        };

        return params.options;
    },
    popupParent: document.body
};

var chartPanelTemplate
    = '<div class="chart-wrapper ag-theme-alpine">' +
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

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/wideSpreadOfSports.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
