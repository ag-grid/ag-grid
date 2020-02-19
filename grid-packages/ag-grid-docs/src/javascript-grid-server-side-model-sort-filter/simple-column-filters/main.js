var columnDefs = [
    { field: 'athlete', type: 'text' },
    { field: 'year',
      filter: 'agNumberColumnFilter',
      filterParams: {
        resetButton: true,
        debounceMs: 1000,
        suppressAndOrCondition: true,
      }
    },
    { field: 'gold', type: 'number' },
    { field: 'silver', type: 'number' },
    { field: 'bronze', type: 'number' }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 120,
        sortable: true,
        resizable: true,
        menuTabs: ['filterMenuTab']
    },
    columnTypes: {
        'text': {filter: 'agTextColumnFilter'},
        'number': {filter: 'agNumberColumnFilter'},
        'numberWithFilterReset': {
            filter: 'agNumberColumnFilter',
            filterParams: {
                resetButton: true,
                debounceMs: 1500
            }
        }
    },
    // use the server-side row model
    rowModelType: 'serverSide',

    // fetch 100 rows at a time
    cacheBlockSize: 100,

    // only keep 10 blocks of rows
    maxBlocksInCache: 10,

    animateRows: true,
    // debug: true
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json'}).then(function (data) {
        // setup the fake server with entire dataset
        var fakeServer = new FakeServer(data);

        // create datasource with a reference to the fake server
        var datasource = new ServerSideDatasource(fakeServer);

        // register the datasource with the grid
        gridOptions.api.setServerSideDatasource(datasource);
    });
});

// This fake server uses http://alasql.org/ to mimic how a real server
// might generate sql queries from the Server-side Row Model request.
// To keep things simple it does the bare minimum to support the example.
function FakeServer(allData) {
    alasql.options.cache = false;

    return {
        getData: function (request) {
            var results = executeQuery(request);
            return {
                success: true,
                rows: results,
                lastRow: getLastRowIndex(request, results)
            };
        }
    };

    function executeQuery(request) {
        var SQL = buildSql(request);

        console.log('[FakeServer] - about to execute query:', SQL);

        return alasql(SQL, [allData]);
    }

    function buildSql(request) {
        var select = 'SELECT * ';
        var from = 'FROM ? ';
        var where = whereSql(request);
        var orderBy = orderBySql(request);
        var limit = limitSql(request);

        return select + from + where + orderBy + limit;
    }

    function whereSql(request) {
        var whereParts = [];

        var filterModel = request.filterModel;
        if (filterModel) {
            var keySet = Object.keys(filterModel);
            keySet.forEach(function (key) {
                var item = filterModel[key];
                whereParts.push(filterSql(key, item));
            });
        }

        if (whereParts.length > 0) {
            return ' WHERE ' + whereParts.join(' AND ') + ' ';
        }

        return '';
    }

    function filterSql(key, item) {
        switch (item.filterType) {
            case 'text':
                return createFilterSql(textFilterMapper, key, item);
            case 'number':
                return createFilterSql(numberFilterMapper, key, item);
            default:
                console.log('unknown filter type: ' + item.filterType);
        }
    }

    function createFilterSql(mapper, key, item) {
        if (item.operator) {
            var condition1 = mapper(key, item.condition1);
            var condition2 = mapper(key, item.condition2);
            return '(' + condition1 + ' ' + item.operator + ' ' + condition2 + ')';
        }
        return mapper(key, item);
    }

    function textFilterMapper(key, item) {
        switch (item.type) {
            case 'equals':
                return key + ' = "' + item.filter + '"';
            case 'notEqual':
                return key + ' != "' + item.filter + '"';
            case 'contains':
                return key + ' like "%' + item.filter + '%"';
            case 'notContains':
                return key + ' not like "%' + item.filter + '%"';
            case 'startsWith':
                return key + ' like "' + item.filter + '%"';
            case 'endsWith':
                return key + ' like "%' + item.filter + '"';
            default:
                console.log('unknown text filter type: ' + item.type);
        }
    }

    function numberFilterMapper(key, item) {
        switch (item.type) {
            case 'equals':
                return key + ' = ' + item.filter;
            case 'notEqual':
                return key + ' != ' + item.filter;
            case 'greaterThan':
                return key + ' > ' + item.filter;
            case 'greaterThanOrEqual':
                return key + ' >= ' + item.filter;
            case 'lessThan':
                return key + ' < ' + item.filter;
            case 'lessThanOrEqual':
                return key + ' <= ' + item.filter;
            case 'inRange':
                return '(' + key + ' >= ' + item.filter + ' and ' + key + ' <= ' + item.filterTo + ')';
            default:
                console.log('unknown number filter type: ' + item.type);
        }
    }

    function orderBySql(request) {
        var sortModel = request.sortModel;
        if (sortModel.length === 0) return '';

        var sorts = sortModel.map(function(s) {
            return s.colId + ' ' + s.sort;
        });

        return 'ORDER BY ' + sorts.join(', ') + ' ';
    }

    function limitSql(request) {
        var blockSize = request.endRow - request.startRow;
        return ' LIMIT ' + (blockSize + 1) + ' OFFSET ' + request.startRow;
    }

    function getLastRowIndex(request, results) {
        if (!results || results.length === 0) return -1;
        var currentLastRow = request.startRow + results.length;
        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }
}

function ServerSideDatasource(server) {
    return {
        getRows: function(params) {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            // get data for request from our fake server
            var response = server.getData(params.request);

            // simulating real server call with a 500ms delay
            setTimeout(function () {
                if (response.success) {
                    // supply rows for requested block to grid
                    params.successCallback(response.rows, response.lastRow);
                } else {
                    params.failCallback();
                }
            }, 500);
        }
    };
}
