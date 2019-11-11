(function() {

    var columnDefs = [
        { headerName: 'Product', field: 'product', chartDataType: 'category' },
        { headerName: 'Book', field: 'book', chartDataType: 'category' },

        { headerName: 'Current', field: 'current', type: 'measure' },
        { headerName: 'Previous', field: 'previous', type: 'measure' },
        { headerName: 'PL 1', field: 'pl1', type: 'measure' },
        { headerName: 'PL 2', field: 'pl2', type: 'measure' },
        { headerName: 'Gain-DX', field: 'gainDx', type: 'measure' },
        { headerName: 'SX / PX', field: 'sxPx', type: 'measure' },

        { headerName: 'Trade', field: 'trade', type: 'measure' },
        { headerName: 'Submitter ID', field: 'submitterID', type: 'measure' },
        { headerName: 'Submitted Deal ID', field: 'submitterDealID', type: 'measure', width: 150 },

        { headerName: 'Portfolio', field: 'portfolio' },
        { headerName: 'Deal Type', field: 'dealType' },
        { headerName: 'Bid', field: 'bidFlag' }
    ];

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
                chartContainer: document.querySelector('#integrated-charting-chart'),
                suppressChartRanges: true,
                aggFunc: 'sum'
            };

            chartRef = params.api.createRangeChart(createRangeChartParams);
        },
        processChartOptions: function(params) {
            var opts = params.options;

            opts.legend.position = 'bottom';
            opts.yAxis.label.formatter = yAxisLabelFormatter;
            opts.xAxis.label.rotation = 0;

            opts.seriesDefaults.fills = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];
            opts.seriesDefaults.strokes = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];

            opts.seriesDefaults.tooltip.enabled = true;
            opts.seriesDefaults.tooltip.renderer = function(params) {
                var value = '$' + params.datum[params.yKey].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
                return '<div style="padding: 5px"><b>' + params.title + '</b>: ' + value + '</div>';
            };

            return opts;
        },
        getChartToolbarItems: function() {
            return []; // hide toolbar items
        }
    };

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

    function initLiveStreamUpdates() {
        var eGridDiv = document.querySelector("#integrated-charting-grid");
        new agGrid.Grid(eGridDiv, gridOptions);
        startWorker();
    }

    function startWorker() {
        worker = new Worker("/integrated-charting/worker.js");
        worker.onmessage = function(e) {
            if (e.data.type === 'setRowData') {
                gridOptions.api.setRowData(e.data.records);
            }
            if (e.data.type === 'updateData') {
                gridOptions.api.batchUpdateRowData({ update: e.data.records });
            }
        };
        worker.postMessage('start');
    }

    if (document.readyState == "complete") {
        initLiveStreamUpdates();
    } else {
        document.addEventListener("readystatechange", initLiveStreamUpdates);
    }
})();
