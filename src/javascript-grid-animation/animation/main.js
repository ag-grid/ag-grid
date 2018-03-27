var eTitle;
var eCountdown;
var countDownDirection = true;

var columnDefs = [
    { headerName: "Athlete", field: "athlete", width: 150 },
    { headerName: "Age", field: "age", width: 90 },
    { headerName: "Country", field: "country", width: 120 },
    { headerName: "Year", field: "year", width: 90 },
    { headerName: "Date", field: "date", width: 110 },
    { headerName: "Sport", field: "sport", width: 110 },
    { headerName: "Gold", field: "gold", width: 100, aggFunc: "sum" },
    { headerName: "Silver", field: "silver", width: 100, aggFunc: "sum" },
    { headerName: "Bronze", field: "bronze", width: 100, aggFunc: "sum" },
    { headerName: "Total", field: "total", width: 100, aggFunc: "sum" }
];

var gridOptions = {
    columnDefs: columnDefs,
    enableRangeSelection: true,
    enableSorting: true,
    enableFilter: true,
    animateRows: true,
    suppressAggFuncInHeader: true, // so we don't see sum() in gold, silver and bronze headers
    autoGroupColumnDef: {
        // to get 'athlete' showing in the leaf level in this column
        cellRenderer: "agGroupCellRenderer",
        headerName: "Athlete",
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
            var action = actions[actionIndex];
            action(api, columnApi);
            actionIndex++;
            if (actionIndex >= actions.length) {
                actionIndex = 0;
            }
            resetCountdown();
            executeAfterXSeconds();
        }, 3000);
    }

    setTitleFormatted(null);
}

function resetCountdown() {
    eCountdown.style.width = countDownDirection ? "100%" : "0%";
    countDownDirection = !countDownDirection;
}

function setTitleFormatted(apiName, methodName, paramsName) {
    var html;
    if (apiName === null) {
        html = '<span class="code-highlight-yellow">aggrid/:> </span>';
    } else {
        html =
            '<span class="code-highlight-yellow">aggrid/:> </span> ' +
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
    eTitle.innerHTML = html;
}

var actions = [
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
        api.setFilterModel({ country: ["Ireland"] });
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
        columnApi.setRowGroupColumns(["country", "year", "sport"]);
        columnApi.setColumnVisible("athlete", false);
        api.sizeColumnsToFit();
        setTitleFormatted("api", "setGrouping", "country, year, sport");
    },
    function(api, columnApi) {
        columnApi.moveColumns(["gold", "silver", "bronze", "total"], 1);
        api.sizeColumnsToFit();
        setTitleFormatted("api", "moveColumns", "gold, silver, bronze, total");
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
        api.sizeColumnsToFit();
        setTitleFormatted("api", "removeGrouping", "");
    },
    function(api, columnApi) {
        columnApi.moveColumns(["gold", "silver", "bronze", "total"], 6);
        setTitleFormatted("api", "moveColumns", "gold, silver, bronze, total");
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

// setup the grid after the page has finished loading
function initApiGrid() {
    var gridDiv = document.querySelector("#myGrid") || document.querySelector("#animationGrid");

    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: "https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinnersSmall.json" }).then(function(data) {
        gridOptions.api.setRowData(data);
        setTimeout(function() {
            gridOptions.api.sizeColumnsToFit();
        }, 1000);

        eTitle = document.querySelector("#animationAction");
        eCountdown = document.querySelector("#animationCountdown");
        startInterval(gridOptions.api, gridOptions.columnApi);
    });
}

if (document.readyState == "complete") {
    initApiGrid();
} else {
    document.addEventListener('readystatechange', initApiGrid);
}
