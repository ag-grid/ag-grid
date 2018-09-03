(function() {
    var columnDefs = [
        // these are the row groups, so they are all hidden (they are showd in the group column)
        {
            headerName: "Hierarchy",
            children: [
                { headerName: "Product", field: "product", type: "dimension", rowGroupIndex: 0, hide: true },
                { headerName: "Portfolio", field: "portfolio", type: "dimension", rowGroupIndex: 1, hide: true },
                { headerName: "Book", field: "book", type: "dimension", rowGroupIndex: 2, hide: true }
            ]
        },

        // some string values, that do not get aggregated
        {
            headerName: "Attributes",
            children: [
                { headerName: "Trade", field: "trade", width: 100 },
                { headerName: "Deal Type", field: "dealType", type: "dimension" },
                { headerName: "Bid", field: "bidFlag", type: "dimension", width: 100 }
            ]
        },

        // all the other columns (visible and not grouped)
        {
            headerName: "Values",
            children: [
                { headerName: "Current", field: "current", type: "measure" },
                { headerName: "Previous", field: "previous", type: "measure" },
                { headerName: "PL 1", field: "pl1", type: "measure" },
                { headerName: "PL 2", field: "pl2", type: "measure" },
                { headerName: "Gain-DX", field: "gainDx", type: "measure" },
                { headerName: "SX / PX", field: "sxPx", type: "measure" },
                { headerName: "99 Out", field: "_99Out", type: "measure" },
                { headerName: "Submitter ID", field: "submitterID", type: "measure" },
                { headerName: "Submitted Deal ID", field: "submitterDealID", type: "measure" }
            ]
        }
    ];

    function numberCellFormatter(params) {
        return Math.floor(params.value)
            .toString()
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }

    var gridOptions = {
        columnTypes: {
            dimension: {
                enableRowGroup: true,
                enablePivot: true
            },
            measure: {
                width: 150,
                aggFunc: "sum",
                enableValue: true,
                cellClass: "number",
                valueFormatter: numberCellFormatter,
                cellRenderer: "agAnimateShowChangeCellRenderer"
            }
        },
        columnDefs: columnDefs,
        statusBar: {
            items: [
                { component: 'agAggregationComponent' }
            ]
        },
        animateRows: true,
        enableColResize: true,
        enableRangeSelection: true,
        enableSorting: true,
        rowGroupPanelShow: "always",
        pivotPanelShow: "always",
        suppressAggFuncInHeader: true,
        autoGroupColumnDef: {
            width: 200
        },
        getRowNodeId: function(data) {
            return data.trade;
        },
        defaultColDef: {
            width: 120
        }
    };

    function onStartLoad() {
        worker.postMessage("startLoad");
    }

    var testStartTime;
    var worker;

    function startWorker() {
        worker = new Worker("/live-stream-updates/worker.js");

        worker.onmessage = function(e) {
            switch (e.data.type) {
                case "start":
                    testStartTime = new Date().getTime();
                    logTestStart(e.data.messageCount, e.data.updateCount, e.data.interval);
                    break;
                case "end":
                    logStressResults(e.data.messageCount, e.data.updateCount);
                    break;
                case "setRowData":
                    gridOptions.api.setRowData(e.data.records);
                    break;
                case "updateData":
                    gridOptions.api.batchUpdateRowData({ update: e.data.records });
                    break;
                default:
                    console.log("unrecognised event type " + e.type);
            }
        };
    }

    function logTestStart(messageCount, updateCount, interval) {
        var message = messageCount
            ? "Sending " + messageCount + " messages at once with " + updateCount + " record updates each."
            : "Sending 1 message with " +
              updateCount +
              " updates every " +
              interval +
              " milliseconds, that's " +
              (1000 / interval * updateCount).toLocaleString() +
              " updates per second.";

        console.log(message);
    }

    function logStressResults(messageCount, updateCount) {
        var testEndTime = new Date().getTime();
        var duration = testEndTime - testStartTime;
        var totalUpdates = messageCount * updateCount;

        var updatesPerSecond = Math.floor(totalUpdates / duration * 1000);

        logMessage(
            "Processed " + totalUpdates.toLocaleString() + " updates in " + duration.toLocaleString() + "ms, that's " + updatesPerSecond.toLocaleString() + " updates per second."
        );

        console.log("####################");
        console.log("# -- Stress test results --");
        console.log(
            "# The grid was pumped with " +
                messageCount.toLocaleString() +
                " messages. Each message had " +
                updateCount.toLocaleString() +
                " record updates which gives a total number of updates of " +
                totalUpdates.toLocaleString() +
                "."
        );
        console.log(
            "# Time taken to execute the test was " + duration.toLocaleString() + " milliseconds which gives " + updatesPerSecond.toLocaleString() + " updates per second."
        );
        console.log("####################");
    }

    function initLiveStreamUpdates() {
        var eGridDiv = document.querySelector("#live-stream-updates-grid");
        new agGrid.Grid(eGridDiv, gridOptions);
        startWorker();
        onStartLoad();

        setTimeout( function() {
            gridOptions.api.getDisplayedRowAtIndex(2).setExpanded(true);
        }, 800);
        setTimeout( function() {
            gridOptions.api.getDisplayedRowAtIndex(8).setExpanded(true);
        }, 1200);
        setTimeout( function() {
            gridOptions.api.getDisplayedRowAtIndex(9).setExpanded(true);
        }, 1600);
        setTimeout( function() {
            gridOptions.api.getDisplayedRowAtIndex(10).setExpanded(true);
        }, 2000);
    }

    if (document.readyState == "complete") {
        initLiveStreamUpdates();
    } else {
        document.addEventListener("readystatechange", initLiveStreamUpdates);
    }
})();
