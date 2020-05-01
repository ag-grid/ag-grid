var countDownDirection = true;

var columnDefs = [
    { field: "athlete", minWidth: 150 },
    { field: "country", minWidth: 150 },
    { field: "year", minWidth: 120 },
    { field: "gold", aggFunc: "sum" },
    { field: "silver", aggFunc: "sum" },
    { field: "bronze", aggFunc: "sum" }
];

var gridOptions = {
    defaultColDef: {
        flex: 1,
        sortable: true,
        filter: true
    },
    columnDefs: columnDefs,
    enableRangeSelection: true,
    animateRows: true,
    suppressAggFuncInHeader: true, // so we don't see sum() in gold, silver and bronze headers
    autoGroupColumnDef: {
        // to get 'athlete' showing in the leaf level in this column
        cellRenderer: "agGroupCellRenderer",
        headerName: "Athlete",
        minWidth: 200,
        field: "athlete"
    }
};

// the code below executes an action every 2,000 milliseconds.
// it's an interval, and each time it runs, it takes the next action
// from the 'actions' list below
function startInterval(api, columnApi) {
    var actionIndex = 0;

    resetCountdown();
    executeAfterXSeconds();

    function executeAfterXSeconds() {
        setTimeout(function() {
            var action = getActions()[actionIndex];
            action(api, columnApi);
            actionIndex++;
            if (actionIndex >= getActions().length) {
                actionIndex = 0;
            }
            resetCountdown();
            executeAfterXSeconds();
        }, 3000);
    }

    setTitleFormatted(null);
}

function resetCountdown() {
    document.querySelector("#animationCountdown").style.width = countDownDirection ? "100%" : "0%";
    countDownDirection = !countDownDirection;
}

function setTitleFormatted(apiName, methodName, paramsName) {
    var html;
    if (apiName === null) {
        html = '<span class="code-highlight-yellow">command:> </span>';
    } else {
        html =
            '<span class="code-highlight-yellow">command:> </span> ' +
            '<span class="code-highlight-blue">' +
            apiName +
            "</span>" +
            '<span class="code-highlight-blue">.</span>' +
            '<span class="code-highlight-yellow">' +
            methodName +
            "</span>" +
            '<span class="code-highlight-blue"></span>' +
            '<span class="code-highlight-blue">(</span>' +
            '<span class="code-highlight-green">' +
            paramsName +
            "</span>" +
            '<span class="code-highlight-blue">)</span>';
    }
    document.querySelector("#animationAction").innerHTML = html;
}

function getActions() {
    return [
        function(api) {
            api.setSortModel([{ colId: "country", sort: "asc" }]);
            setTitleFormatted("api", "setSort", "country");
        },
        function(api) {
            api.setSortModel([{ colId: "country", sort: "asc" }, { colId: "year", sort: "asc" }]);
            setTitleFormatted("api", "setSort", "country, year");
        },
        function(api) {
            api.setSortModel([{ colId: "country", sort: "asc" }, { colId: "year", sort: "desc" }]);
            setTitleFormatted("api", "setSort", "country, year");
        },
        function(api) {
            api.setSortModel([{ colId: "country", sort: "asc" }]);
            setTitleFormatted("api", "setSort", "country");
        },
        function(api) {
            api.setSortModel([]);
            api.setFilterModel({
                country: {
                    type: 'set',
                    values: ["Ireland"]
                }
            });
            setTitleFormatted("api", "setFilter", "Ireland");
        },
        function(api) {
            api.setSortModel([{ colId: "year", sort: "asc" }]);
            setTitleFormatted("api", "setSort", "year");
        },
        function(api) {
            api.setSortModel([{ colId: "year", sort: "desc" }]);
            setTitleFormatted("api", "setSort", "year");
        },
        function(api) {
            api.setSortModel([]);
            api.setFilterModel({});
            setTitleFormatted("api", "clearFilterAndSort", "");
        },
        function(api, columnApi) {
            columnApi.setRowGroupColumns(["country", "year"]);
            columnApi.setColumnVisible("athlete", false);
            setTitleFormatted("api", "setGrouping", "country, year");
        },
        function(api, columnApi) {
            columnApi.moveColumns(["gold", "silver", "bronze"], 1);
            setTitleFormatted("api", "moveColumns", "gold, silver, bronze");
        },
        function(api) {
            var topLevelNodes = api.getModel().getTopLevelNodes();
            topLevelNodes[2].setExpanded(true);
            setTitleFormatted("rowNode", "setExpanded", "true");
        },
        function(api) {
            var topLevelNodes = api.getModel().getTopLevelNodes();
            topLevelNodes[2].childrenAfterSort[1].setExpanded(true);
            setTitleFormatted("rowNode", "setExpanded", "true");
        },
        function(api) {
            var topLevelNodes = api.getModel().getTopLevelNodes();
            topLevelNodes[2].childrenAfterSort[1].childrenAfterSort[0].setExpanded(true);
            setTitleFormatted("rowNode", "setExpanded", "true");
        },
        function(api) {
            var topLevelNodes = api.getModel().getTopLevelNodes();
            topLevelNodes[2].childrenAfterSort[1].setExpanded(false);
            setTitleFormatted("rowNode", "setExpanded", "false");
        },
        function(api, columnApi) {
            columnApi.setRowGroupColumns([]);
            columnApi.setColumnVisible("athlete", true);
            setTitleFormatted("api", "removeGrouping", "");
        },
        function(api, columnApi) {
            columnApi.moveColumns(["gold", "silver", "bronze"], 3);
            setTitleFormatted("api", "moveColumns", "gold, silver, bronze");
        },
        function(api) {
            api
                .getModel()
                .getRow(3)
                .setRowHeight(100);
            api.onRowHeightChanged();
            setTitleFormatted("rowNode", "setRowHeight", "100");
        },
        function(api) {
            api.resetRowHeights();
            setTitleFormatted("api", "resetRowHeights", "");
        }
    ];
}

var apiGridInitialised = false;

// from actual demo page (/javascript-grid-animation)
document.addEventListener('DOMContentLoaded', function() {
    if (apiGridInitialised) {
        return;
    }
    apiGridInitialised = true;

    var gridDiv = document.querySelector("#myGrid") || document.querySelector("#animationGrid");

    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
            startInterval(gridOptions.api, gridOptions.columnApi);
        });
});


// from homepage (ag-grid.com)
function initApiGrid() {
    if (apiGridInitialised) {
        return;
    }
    apiGridInitialised = true;

    var gridDiv = document.querySelector("#myGrid") || document.querySelector("#animationGrid");

    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
            startInterval(gridOptions.api, gridOptions.columnApi);
        });
}

if (document.readyState === "complete") {
    initApiGrid();
} else {
    // to cover scenarios of using this demo on the main webpage, and also the documentation pages,
    // we cover both events. BUT make sure it's only done once, hence we have the flag apiGridInitialised
    document.addEventListener("readystatechange", initApiGrid);
    document.addEventListener("DOMContentLoaded", initApiGrid);
}
