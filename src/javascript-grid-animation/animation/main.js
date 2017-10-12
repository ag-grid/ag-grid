// do http request to get our sample data - not using any framework to keep the example self contained.
// you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
function fetchData(url, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', url);
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            callback(httpResult);
        }
    };
}

var eTitle;
var eCountdown;
var countDownDirection = true;

var columnDefs = [
    {headerName: 'Athlete', field: 'athlete', width: 150},
    {headerName: 'Age', field: 'age', width: 90},
    {headerName: 'Country', field: 'country', width: 120},
    {headerName: 'Year', field: 'year', width: 90},
    {headerName: 'Date', field: 'date', width: 110},
    {headerName: 'Sport', field: 'sport', width: 110},
    {headerName: 'Gold', field: 'gold', width: 100, aggFunc: 'sum'},
    {headerName: 'Silver', field: 'silver', width: 100, aggFunc: 'sum'},
    {headerName: 'Bronze', field: 'bronze', width: 100, aggFunc: 'sum'},
    {headerName: 'Total', field: 'total', width: 100, aggFunc: 'sum'}
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
        cellRenderer: 'group',
        headerName: 'Athlete',
        field: 'athlete'
    }
};

// the code below executes an action every 2,000 milliseconds.
// it's an interval, and each time it runs, it takes the next action
// from the 'actions' list below
function startInterval(gridOptions) {
    var actionIndex = 0;

    resetCountdown();
    executeAfterXSeconds();

    function executeAfterXSeconds() {
        setTimeout(function() {
            var action = actions[actionIndex];
            action(gridOptions);
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
    eCountdown.style.width = countDownDirection ? '100%' : '0%';
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
            '</span>' +
            '<span class="code-highlight-blue">.</span>' +
            '<span class="code-highlight-yellow">' +
            methodName +
            '</span>' +
            '<span class="code-highlight-blue"></span>' +
            '<span class="code-highlight-blue">(</span>' +
            '<span class="code-highlight-green">' +
            paramsName +
            '</span>' +
            '<span class="code-highlight-blue">)</span>';
    }
    eTitle.innerHTML = html;
}

var actions = [
    function(gridOptions) {
        gridOptions.api.setSortModel([{colId: 'country', sort: 'asc'}]);
        setTitleFormatted('api', 'setSort', 'country');
    },
    function(gridOptions) {
        gridOptions.api.setSortModel([{colId: 'country', sort: 'asc'}, {colId: 'year', sort: 'asc'}]);
        setTitleFormatted('api', 'setSort', 'country, year');
    },
    function(gridOptions) {
        gridOptions.api.setSortModel([{colId: 'country', sort: 'asc'}, {colId: 'year', sort: 'desc'}]);
        setTitleFormatted('api', 'setSort', 'country, year');
    },
    function(gridOptions) {
        gridOptions.api.setSortModel([{colId: 'country', sort: 'asc'}]);
        setTitleFormatted('api', 'setSort', 'country');
    },
    function(gridOptions) {
        gridOptions.api.setSortModel([]);
        gridOptions.api.setFilterModel({country: ['Ireland']});
        setTitleFormatted('api', 'setFilter', 'Ireland');
    },
    function(gridOptions) {
        gridOptions.api.setSortModel([{colId: 'year', sort: 'asc'}]);
        setTitleFormatted('api', 'setSort', 'year');
    },
    function(gridOptions) {
        gridOptions.api.setSortModel([{colId: 'year', sort: 'desc'}]);
        setTitleFormatted('api', 'setSort', 'year');
    },
    function(gridOptions) {
        gridOptions.api.setSortModel([]);
        gridOptions.api.setFilterModel({});
        setTitleFormatted('api', 'clearFilterAndSort', '');
    },
    function(gridOptions) {
        gridOptions.columnApi.setRowGroupColumns(['country', 'year', 'sport']);
        gridOptions.columnApi.setColumnVisible('athlete', false);
        gridOptions.api.sizeColumnsToFit();
        setTitleFormatted('api', 'setGrouping', 'country, year, sport');
    },
    function(gridOptions) {
        gridOptions.columnApi.moveColumns(['gold', 'silver', 'bronze', 'total'], 1);
        gridOptions.api.sizeColumnsToFit();
        setTitleFormatted('api', 'moveColumns', 'gold, silver, bronze, total');
    },
    function(gridOptions) {
        var topLevelNodes = gridOptions.api.getModel().getTopLevelNodes();
        topLevelNodes[2].setExpanded(true);
        setTitleFormatted('rowNode', 'setExpanded', 'true');
    },
    function(gridOptions) {
        var topLevelNodes = gridOptions.api.getModel().getTopLevelNodes();
        topLevelNodes[2].childrenAfterSort[1].setExpanded(true);
        setTitleFormatted('rowNode', 'setExpanded', 'true');
    },
    function(gridOptions) {
        var topLevelNodes = gridOptions.api.getModel().getTopLevelNodes();
        topLevelNodes[2].childrenAfterSort[1].childrenAfterSort[0].setExpanded(true);
        setTitleFormatted('rowNode', 'setExpanded', 'true');
    },
    function(gridOptions) {
        var topLevelNodes = gridOptions.api.getModel().getTopLevelNodes();
        topLevelNodes[2].childrenAfterSort[1].setExpanded(false);
        setTitleFormatted('rowNode', 'setExpanded', 'false');
    },
    function(gridOptions) {
        gridOptions.columnApi.setRowGroupColumns([]);
        gridOptions.columnApi.setColumnVisible('athlete', true);
        gridOptions.api.sizeColumnsToFit();
        setTitleFormatted('api', 'removeGrouping', '');
    },
    function(gridOptions) {
        gridOptions.columnApi.moveColumns(['gold', 'silver', 'bronze', 'total'], 6);
        setTitleFormatted('api', 'moveColumns', 'gold, silver, bronze, total');
    },
    function(gridOptions) {
        gridOptions.api
            .getModel()
            .getRow(3)
            .setRowHeight(100);
        gridOptions.api.onRowHeightChanged();
        setTitleFormatted('rowNode', 'setRowHeight', '100');
    },
    function(gridOptions) {
        gridOptions.api.resetRowHeights();
        setTitleFormatted('api', 'resetRowHeights', '');
    }
];

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetchData('https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinnersSmall.json', function(data) {
        gridOptions.api.setRowData(data);
        setTimeout(function() {
            gridOptions.api.sizeColumnsToFit();
        }, 1000);

        eTitle = document.querySelector('#animationAction');
        eCountdown = document.querySelector('#animationCountdown');
        startInterval(gridOptions);
    });
});
