var columnDefs = [
    {headerName: "Athlete", field: "athlete", enableRowGroup: true},
    {headerName: "Age", field: "age", enableRowGroup: true},

    // here we are using a valueGetter to get the country
    {headerName: "Country", colId: "country", valueGetter: "data.country.name", enableRowGroup: true, rowGroup: true, hide: true},

    // here we are using a field with '.' in it, to get value from complex object
    {headerName: "Year", colId: "year", field: 'year.name', enableRowGroup: true, rowGroup: true, hide: true},

    {headerName: "Sport", field: "sport", enableRowGroup: true},
    {headerName: "Gold", field: "gold", aggFunc: 'sum', enableValue: true},
    {headerName: "Silver", field: "silver", aggFunc: 'sum', enableValue: true},
    {headerName: "Bronze", field: "bronze", aggFunc: 'sum', enableValue: true}
];

var gridOptions = {
    defaultColDef: {
        width: 100,
        // restrict what aggregation functions the columns can have,
        // include a custom function 'random' that just returns a
        // random number
        allowedAggFuncs: ['sum','min','max','random']
    },
    rowBuffer: 0,
    columnDefs: columnDefs,
    enableColResize: true,
    rowModelType: 'enterprise',
    rowGroupPanelShow: 'always',
    animateRows: true,
    debug: true,
    enableSorting: true,
    showToolPanel: true,
    suppressAggFuncInHeader: true,
    // restrict to 2 server side calls concurrently
    maxConcurrentDatasourceRequests: 2,
    cacheBlockSize: 100,
    maxBlocksInCache: 2,
    purgeClosedRowNodes: true,
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

function DataSourceWrapper(fakeServer) {
    this.ds = new EnterpriseDatasource(fakeServer, gridOptions);
}

DataSourceWrapper.prototype.getRows = function(params) {
    var dsParams = {
        request: params.request,
        failCallback: params.failCallback,
        successCallback: successCallback
    };

    this.ds.getRows(dsParams);

    function successCallback(rows, lastRow) {
        var newRows = [];
        rows.forEach(function(originalRow) {
            var newRow = copyObject(originalRow);
            makeCountryIntoObject(newRow);
            makeYearIntoObject(newRow);
            newRows.push(newRow);
        });
        params.successCallback(newRows, lastRow);
    }
};

function copyObject(obj) {
    var copy = {};
    Object.keys(obj).forEach( function(key) {
        copy[key] = obj[key];
    });
    return copy;
}

function makeCountryIntoObject(row) {
    if (row.country) {
        var countryObject = {
            name: row.country,
            code: row.country.substring(0,3).toUpperCase()
        };
        row.country = countryObject;
    }
}

function makeYearIntoObject(row) {
    if (row.year) {
        var yearObject = {
            name: row.year,
            shortName: "'" + row.year.toString().substring(2,4)
        };
        row.year = yearObject;
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: '../olympicWinners.json'})
        .then( function(rows) {
                var fakeServer = new FakeServer(rows);
                var datasource = new DataSourceWrapper(fakeServer);
                gridOptions.api.setEnterpriseDatasource(datasource);
            }
        );
});
