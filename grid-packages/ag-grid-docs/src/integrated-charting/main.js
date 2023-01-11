(function() {
    function MyWorker(listener) {
        // NOTE: The details of this web worker are not important it's just used to simulate streaming updates in the grid.
    
    // update these to change the number and rate of updates
        var UPDATES_PER_MESSAGE = 100;
        var MILLISECONDS_BETWEEN_MESSAGES = 100;
    
    // update these to change the size of the data initially loaded into the grid for updating
        var BOOK_COUNT = 5;
        var TRADE_COUNT = 2;
    
    // add / remove products to change the data set
        var PRODUCTS = ['Cobalt','Rubber','Wool','Amber','Corn','Nickel','Copper','Oats','Coffee','Wheat','Lead','Zinc','Tin','Coca'];
    
    // add / remove portfolios to change the data set
        var PORTFOLIOS = ['Aggressive','Defensive','Income','Speculative','Hybrid'];
    
    // these are the list of columns that updates go to
        var VALUE_FIELDS = ['current','previous','pl1','pl2','gainDx','sxPx','_99Out'];
    
    // a list of the data, that we modify as we go
        var globalRowData;
    
    // start the book id's and trade id's at some future random number
        var nextBookId = 62472;
        var nextTradeId = 24287;
        var nextBatchId = 101;
    
    // build up the test data
        function createRowData() {
            globalRowData = [];
            var thisBatch = nextBatchId++;
            for (var k = 0; k<BOOK_COUNT; k++) {
                for (var j = 0; j<PORTFOLIOS.length; j++) {
                    var portfolio = PORTFOLIOS[j];
                    for (var i = 0; i<PRODUCTS.length; i++) {
                        var product = PRODUCTS[i];
                        var book = 'GL-' + ++nextBookId;
                        for (var l = 0; l < TRADE_COUNT; l++) {
                            var trade = createTradeRecord(product, portfolio, book, thisBatch);
                            globalRowData.push(trade);
                        }
                    }
                }
            }
            // console.log('Total number of records sent to grid = ' + globalRowData.length);
        }
    
        function randomBetween(min,max) {
            return Math.floor(Math.random()*(max - min + 1)) + min;
        }
    
        function createTradeRecord(product, portfolio, book, batch) {
            var current = Math.floor(Math.random()*10000) + (Math.random()<.45 ? 500 : 19000);
            var previous = current + (Math.random()<.5 ? 500 : 19000);
    
            return {
                product: product,
                portfolio: portfolio,
                book: book,
                trade: ++nextTradeId,
                submitterID: randomBetween(10,1000),
                submitterDealID: randomBetween(10,1000),
                dealType: (Math.random()<.2) ? 'Physical' : 'Financial',
                bidFlag: (Math.random()<.5) ? 'Buy' : 'Sell',
                current: current,
                previous: previous,
                pl1: randomBetween(10000,30000),
                pl2: randomBetween(8000,35000),
                gainDx: randomBetween(35000,1000),
                sxPx: randomBetween(10000,30000),
                batch: batch
            };
        }
    
        createRowData();
    
        listener({
            type: 'setRowData',
            records: globalRowData
        });
    
        function updateSomeItems(updateCount) {
            var itemsToUpdate = [];
            for (var k = 0; k<updateCount; k++) {
                if (globalRowData.length === 0) { continue; }
                var indexToUpdate = Math.floor(Math.random()*globalRowData.length);
                var itemToUpdate = globalRowData[indexToUpdate];
    
                var field = VALUE_FIELDS[Math.floor(Math.random() * VALUE_FIELDS.length)];
                itemToUpdate[field] += randomBetween(-8000,8200);
    
                itemsToUpdate.push(itemToUpdate);
            }
    
            return itemsToUpdate;
        }
    
        var latestUpdateId = 0;
        function startUpdates(thisUpdateId) {
            listener({
                type: 'start',
                updateCount: UPDATES_PER_MESSAGE,
                interval: MILLISECONDS_BETWEEN_MESSAGES
            });
    
            var intervalId;
            function intervalFunc() {
                listener({
                    type: 'updateData',
                    records: updateSomeItems(UPDATES_PER_MESSAGE)
                });
                if (thisUpdateId!==latestUpdateId) {
                    clearInterval(intervalId);
                }
            }
    
            intervalId = setInterval(intervalFunc, MILLISECONDS_BETWEEN_MESSAGES);
        }
    
         startUpdates(latestUpdateId);
    }

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
        getRowId: function(params) { return params.data.trade; },
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
        chartThemes: ['ag-pastel-dark'],
        chartThemeOverrides: {
            common: {
                legend: {
                    position: 'bottom',
                }
            },
            column: {
                axes: {
                    number: {
                        label: {
                            formatter: yAxisLabelFormatter
                        }
                    },
                    category: {
                        label: {
                            rotation: 0,
                        },
                    },
                },
                series: {
                    tooltip: {
                        renderer: tooltipRenderer
                    }
                }
            },
            line: {
                series: {
                    tooltip: {
                        renderer: tooltipRenderer
                    }
                }
            }
        },
        getChartToolbarItems: function() {
            return []; // hide toolbar items
        },
        chartToolPanelsDef: {
            panels: []
        }
    };

    function tooltipRenderer(params) {
        var name = params.title || params.yName;
        var value = '$' + params.yValue.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        return {
            content: '<b>' + name + '</b>: ' + value
        };
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

    function initLiveStreamUpdates() {
        if(document.querySelector("#integrated-charting-grid") && window.agGrid) {
            var eGridDiv = document.querySelector("#integrated-charting-grid");
            new agGrid.Grid(eGridDiv, gridOptions);
            startWorker();
        } else {
            setTimeout(() => initLiveStreamUpdates())
        }
    }

    function startWorker() {
        MyWorker(function(e) {
            if (e.type === 'setRowData') {
                gridOptions.api.setRowData(e.records);
            }
            if (e.type === 'updateData') {
                gridOptions.api.applyTransactionAsync({ update: e.records });
            }
        })
    }

    if (document.readyState == "complete") {
        initLiveStreamUpdates();
    } else {
        document.addEventListener("readystatechange", initLiveStreamUpdates);
    }
})();
