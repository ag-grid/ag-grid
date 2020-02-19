var columnDefs = [
    { field: 'country',
      filter: 'agSetColumnFilter',
      filterParams: {
        values: getCountryValuesAsync
      },
      menuTabs: ['filterMenuTab']
    },
    { field: 'athlete', menuTabs: false }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        sortable: true,
        resizable: true
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

var fakeServer;

function getCountryValuesAsync(params) {
    var countries = fakeServer.getCountries();

    // simulating real server call with a 500ms delay
    setTimeout(function() {
        params.success(countries);
    }, 500);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json'}).then(function (data) {
        // setup the fake server with entire dataset
        fakeServer = new FakeServer(data);

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
        },
        getCountries: function() {
            var SQL = 'SELECT DISTINCT country FROM ? ORDER BY country asc';
            var result = alasql(SQL, [allData]);
            return result.map(Object.values);
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
            var columnKeys = Object.keys(filterModel);
            whereParts = columnKeys.map(function (columnKey) {
                var filter = filterModel[columnKey];
                if (filter.filterType === 'set') {
                    return columnKey + ' IN (\'' + filter.values.join("', '") + '\')';
                }
                console.log('unsupported filter type: ' + filter.filterType);
                return '';
            });
        }

        if (whereParts.length > 0) {
            return ' WHERE ' + whereParts.join(' AND ') + ' ';
        }

        return '';
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
