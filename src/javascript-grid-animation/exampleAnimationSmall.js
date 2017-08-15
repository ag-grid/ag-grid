(function() {

    var eTitle;
    var eCountdown;
    var countDownDirection = true;

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 150},
        {headerName: "Age", field: "age", width: 90},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Gold", field: "gold", width: 100, aggFunc: 'sum'},
        {headerName: "Silver", field: "silver", width: 100, aggFunc: 'sum'},
        {headerName: "Bronze", field: "bronze", width: 100, aggFunc: 'sum'},
        {headerName: "Total", field: "total", width: 100, aggFunc: 'sum'}
    ];

    var gridOptions = {
        columnDefs: columnDefs,
        enableRangeSelection: true,
        enableSorting: true,
        enableFilter: true,
        animateRows: true,
        suppressAggFuncInHeader: true, // so we don't see sum() in gold, silver and bronze headers
        autoGroupColumnDef: { // to get 'athlete' showing in the leaf level in this column
            cellRenderer: 'group',
            headerName: 'Athlete',
            field: 'athlete'
        }
    };

    // the code below executes an action every 2,000 milliseconds.
    // it's an interval, and each time it runs, it takes the next action
    // from the 'actions' list below
    function startInterval() {
        var actionIndex = 0;

        resetCountdown();
        executeAfterXSeconds();

        function executeAfterXSeconds() {
            setTimeout( function() {
                var action = actions[actionIndex];
                action();
                actionIndex++;
                if (actionIndex >= actions.length) {
                    actionIndex = 0;
                }
                resetCountdown();
                executeAfterXSeconds();
            }, 3500);
        }

        setTitleFormatted(null);
    }

    function resetCountdown() {
        eCountdown.style.width = countDownDirection ? '100%' : '0%';
        countDownDirection = !countDownDirection;
    }

    function setTitleFormatted(apiName,methodName,paramsName) {
        var html;
        if (apiName === null) {
            html = '<span class="code-highlight-yellow">aggrid/:> </span>';
        } else {
            html = '<span class="code-highlight-yellow">aggrid/:> </span> ' +
                '<span class="code-highlight-blue">'+apiName+'</span>' +
                '<span class="code-highlight-blue">.</span>' +
                '<span class="code-highlight-yellow">'+methodName+'</span>' +
                '<span class="code-highlight-blue"></span>' +
                '<span class="code-highlight-blue">(</span>' +
                '<span class="code-highlight-green">'+paramsName+'</span>' +
                '<span class="code-highlight-blue">)</span>';
        }
        eTitle.innerHTML = html;
    }

    var actions = [
        function() {
            gridOptions.api.setSortModel([{colId: 'country', sort: 'asc'}]);
            setTitleFormatted("api","setSort","country");
        },
        function() {
            gridOptions.api.setSortModel([{colId: 'country', sort: 'asc'},{colId: 'year', sort: 'asc'}]);
            setTitleFormatted("api","setSort","country, year");
        },
        function() {
            gridOptions.api.setSortModel([{colId: 'country', sort: 'asc'},{colId: 'year', sort: 'desc'}]);
            setTitleFormatted("api","setSort","country, year");
        },
        function() {
            gridOptions.api.setSortModel([{colId: 'country', sort: 'asc'}]);
            setTitleFormatted("api","setSort","country");
        },
        function() {
            gridOptions.api.setSortModel([]);
            gridOptions.api.setFilterModel({country: ['Ireland']});
            setTitleFormatted("api","setFilter","Ireland");
        },
        function() {
            gridOptions.api.setSortModel([{colId: 'year', sort: 'asc'}]);
            setTitleFormatted("api","setSort","year");
        },
        function() {
            gridOptions.api.setSortModel([{colId: 'year', sort: 'desc'}]);
            setTitleFormatted("api","setSort","year");
        },
        function() {
            gridOptions.api.setSortModel([]);
            gridOptions.api.setFilterModel({});
            setTitleFormatted("api","clearFilterAndSort","");
        },
        function() {
            gridOptions.columnApi.setRowGroupColumns(['country','year','sport']);
            gridOptions.columnApi.setColumnVisible('athlete', false);
            gridOptions.api.sizeColumnsToFit();
            setTitleFormatted("api","setGrouping","country, year, sport");
        },
        function() {
            gridOptions.columnApi.moveColumns(['gold','silver','bronze','total'],1);
            gridOptions.api.sizeColumnsToFit();
            setTitleFormatted("api","moveColumns","gold, silver, bronze, total");
        },
        function() {
            var topLevelNodes = gridOptions.api.getModel().getTopLevelNodes();
            topLevelNodes[2].setExpanded(true);
            setTitleFormatted("rowNode","setExpanded","true");
        },
        function() {
            var topLevelNodes = gridOptions.api.getModel().getTopLevelNodes();
            topLevelNodes[2].childrenAfterSort[1].setExpanded(true);
            setTitleFormatted("rowNode","setExpanded","true");
        },
        function() {
            var topLevelNodes = gridOptions.api.getModel().getTopLevelNodes();
            topLevelNodes[2].childrenAfterSort[1].childrenAfterSort[0].setExpanded(true);
            setTitleFormatted("rowNode","setExpanded","true");
        },
        function() {
            var topLevelNodes = gridOptions.api.getModel().getTopLevelNodes();
            topLevelNodes[2].childrenAfterSort[1].setExpanded(false);
            setTitleFormatted("rowNode","setExpanded","false");
        },
        function() {
            gridOptions.columnApi.setRowGroupColumns([]);
            gridOptions.columnApi.setColumnVisible('athlete', true);
            gridOptions.api.sizeColumnsToFit();
            setTitleFormatted("api","removeGrouping","");
        },
        function() {
            gridOptions.columnApi.moveColumns(['gold','silver','bronze','total'],6);
            setTitleFormatted("api","moveColumns","gold, silver, bronze, total");
        },
        function() {
            gridOptions.api.getModel().getRow(3).setRowHeight(100);
            gridOptions.api.onRowHeightChanged();
            setTitleFormatted("rowNode","setRowHeight","100");
        },
        function() {
            gridOptions.api.resetRowHeights();
            setTitleFormatted("api","resetRowHeights","");
        }
    ];

    // setup the grid after the page has finished loading
    document.addEventListener('DOMContentLoaded', function() {
        var gridDiv = document.querySelector('#animationGridSmall');
        new agGrid.Grid(gridDiv, gridOptions);

        // do http request to get our sample data - not using any framework to keep the example self contained.
        // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', '../olympicWinnersSmall.json');
        httpRequest.send();
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                var httpResult = JSON.parse(httpRequest.responseText);
                gridOptions.api.setRowData(httpResult);
                // when this demo is on the main page, the pages takes a moment
                // to resize, i presume because we are using bootstrap for layout.
                // so we wait before sizing columns
                setTimeout( function() {
                    gridOptions.api.sizeColumnsToFit();
                }, 1000);
                eTitle = document.querySelector('#animationAction');
                eCountdown = document.querySelector('#animationCountdown');
                startInterval();
            }
        };
    });

})();
