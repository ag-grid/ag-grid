"use strict";
var columnDefs = [
    {headerName: 'Product', field: 'product', chartDataType: 'category'},
    {headerName: 'Book', field: 'book', chartDataType: 'category'},

    {headerName: 'Current', field: 'current', type: 'measure'},
    {headerName: 'Previous', field: 'previous', type: 'measure'},
    {headerName: 'PL 1', field: 'pl1', type: 'measure'},
    {headerName: 'PL 2', field: 'pl2', type: 'measure'},
    {headerName: 'Gain-DX', field: 'gainDx', type: 'measure'},
    {headerName: 'SX / PX', field: 'sxPx', type: 'measure'},

    {headerName: 'Trade', field: 'trade', type: 'measure'},
    {headerName: 'Submitter ID', field: 'submitterID', type: 'measure'},
    {headerName: 'Submitted Deal ID', field: 'submitterDealID', type: 'measure', width: 150},

    {headerName: 'Portfolio', field: 'portfolio'},
    {headerName: 'Deal Type', field: 'dealType'},
    {headerName: 'Bid', field: 'bidFlag'}
];

var chartRef;

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        width: 120,
        sortable: true,
        resizable: true
    },
    columnTypes: {
        measure: {
            chartDataType: 'series',
            cellClass: 'number',
            valueFormatter: numberCellFormatter,
            cellRenderer:'agAnimateShowChangeCellRenderer'
        }
    },
    animateRows: true,
    enableCharts: true,
    suppressAggFuncInHeader: true,
    getRowNodeId: function(data) { return data.trade; },
    onFirstDataRendered: function(params) {
        var chartRangeParams = {
            cellRange: {
                columns: ['product', 'current', 'previous', 'pl1', 'pl2', 'gainDx', 'sxPx']
            },
            chartType: 'groupedBar',
            chartContainer: document.querySelector('#myChart'),
            suppressChartRanges: true,
            aggregate: true
        };

        chartRef = params.api.chartRange(chartRangeParams);
    },
    processChartOptions: function(params) {
        var opts = params.options;

        opts.legendPosition = 'bottom';
        opts.yAxis.labelFormatter = yAxisLabelFormatter;
        opts.seriesDefaults.tooltipEnabled = true;
        opts.seriesDefaults.fills =['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];
        opts.seriesDefaults.strokes =['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];

        opts.seriesDefaults.tooltipRenderer = (params) => {
            var strArr = params.yField.replace(/([A-Z])/g, " $1");
            var seriesName = strArr.charAt(0).toUpperCase() + strArr.slice(1);
            var value = params.datum[params.yField].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            return `<b>${seriesName}</b>: ${value}`;
        };

        return opts;
    },
    getChartToolbarItems: function() {
        return []; // hide toolbar items
    }
};

function createChart(type) {

    // destroy existing chart
    if (chartRef) {
        chartRef.destroyChart();
    }

    var params = {
        cellRange: {
            columns: ['product', 'current', 'previous', 'pl1', 'pl2', 'gainDx', 'sxPx']
        },
        chartContainer: document.querySelector('#myChart'),
        chartType: type,
        suppressChartRanges: true,
        aggregate: true
    };

    chartRef = gridOptions.api.chartRange(params);
}

function numberCellFormatter(params) {
    return Math.floor(params.value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function yAxisLabelFormatter(n) {
    if (n < 1e3) return n;
    if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
    if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
    if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
    if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
}

// after page is loaded, create the grid
document.addEventListener("DOMContentLoaded", function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
});

var worker;
(function startWorker() {
    worker = new Worker(__basePath + 'dataUpdateWorker.js');
    worker.onmessage = function(e) {
        if (e.data.type === 'setRowData') {
            gridOptions.api.setRowData(e.data.records);
        }
        if (e.data.type === 'updateData') {
            gridOptions.api.batchUpdateRowData({update: e.data.records});
        }
    };

    worker.postMessage('start');
})();

function onStartLoad() {
    worker.postMessage('start');
}

function onStopMessages() {
    worker.postMessage('stop');
}