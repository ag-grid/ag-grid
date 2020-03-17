"use strict";
var columnDefs = [
    { field: 'product', chartDataType: 'category', minWidth: 130 },
    { field: 'book', chartDataType: 'category' },

    { field: 'current', type: 'measure' },
    { field: 'previous', type: 'measure', minWidth: 130 },
    { headerName: 'PL 1', field: 'pl1', type: 'measure' },
    { headerName: 'PL 2', field: 'pl2', type: 'measure' },
    { headerName: 'Gain-DX', field: 'gainDx', type: 'measure', minWidth: 130 },
    { headerName: 'SX / PX', field: 'sxPx', type: 'measure' },

    { field: 'trade', type: 'measure' },
    { field: 'submitterID', type: 'measure', minWidth: 130 },
    { field: 'submitterDealID', type: 'measure', minWidth: 170 },

    { field: 'portfolio', minWidth: 130 },
    { field: 'dealType', minWidth: 130 },
    { headerName: 'Bid', field: 'bidFlag' }
];

var chartRef;

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    },
    columnTypes: {
        measure: {
            chartDataType: 'series',
            cellClass: 'number',
            valueFormatter: numberCellFormatter,
            cellRenderer: 'agAnimateShowChangeCellRenderer'
        }
    },
    animateRows: true,
    enableCharts: true,
    suppressAggFuncInHeader: true,
    getRowNodeId: function(data) { return data.trade; },
    onFirstDataRendered: function(params) {
        var createRangeChartParams = {
            cellRange: {
                columns: ['product', 'current', 'previous', 'pl1', 'pl2', 'gainDx', 'sxPx']
            },
            chartType: 'groupedColumn',
            chartContainer: document.querySelector('#myChart'),
            suppressChartRanges: true,
            aggFunc: 'sum'
        };

        chartRef = params.api.createRangeChart(createRangeChartParams);
    },
    processChartOptions: function(params) {
        var opts = params.options;

        opts.legend.position = 'bottom';
        opts.yAxis.label.formatter = yAxisLabelFormatter;
        opts.seriesDefaults.tooltip.enabled = true;
        opts.seriesDefaults.fill.colors = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];
        opts.seriesDefaults.stroke.colors = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];

        opts.seriesDefaults.tooltip.renderer = function(params) {
            var value = '$' + params.datum[params.yKey].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            var title = params.title || params.yName;
            return '<div style="padding: 5px"><b>' + title + '</b>: ' + value + '</div>';
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
        aggFunc: 'sum'
    };

    chartRef = gridOptions.api.createRangeChart(params);
}

function numberCellFormatter(params) {
    return Math.floor(params.value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function yAxisLabelFormatter(params) {
    var n = params.value;
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
            gridOptions.api.batchUpdateRowData({ update: e.data.records });
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
