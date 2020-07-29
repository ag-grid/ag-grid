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
        function(api, columnApi) {
            columnApi.applyColumnState({
                state: [{colId: 'country', sort: 'asc'}],
                defaultState: {sort: null}
            });
            setTitleFormatted("api", "applyColumnState", "country: 'asc'");
        },
        function(api, columnApi) {
            columnApi.applyColumnState({
                state: [{colId: 'year', sort: 'asc'},{colId: 'country', sort: 'asc'}],
                defaultState: {sort: null}
            });
            setTitleFormatted("api", "applyColumnState", "year: 'asc', country 'asc'");
        },
        function(api, columnApi) {
            columnApi.applyColumnState({
                state: [{colId: 'year', sort: 'asc'},{colId: 'country', sort: 'desc'}],
                defaultState: {sort: null}
            });
            setTitleFormatted("api", "applyColumnState", "year: 'asc', country: 'desc'");
        },
        function(api, columnApi) {
            columnApi.applyColumnState({
                defaultState: {sort: null}
            });
            setTitleFormatted("api", "applyColumnState", "clear sort");
        }
    ];
}

// from actual demo page (/javascript-grid-animation)
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector("#myGrid") || document.querySelector("#animationGrid");

    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data.slice(0,50));
            startInterval(gridOptions.api, gridOptions.columnApi);
        });
});
