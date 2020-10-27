var columnDefs = [
    {
        field: 'country',
        filter: 'agSetColumnFilter',
        filterParams: {
            values: getCountryValuesAsync,
        },
        menuTabs: ['filterMenuTab'],
    },
    {
        field: 'sport',
        filter: 'agSetColumnFilter',
        filterParams: {
            values: getSportValuesAsync,
        },
        menuTabs: ['filterMenuTab'],
    },
    { field: 'athlete', menuTabs: false },
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        sortable: true,
        resizable: true,
    },
    // use the server-side row model
    rowModelType: 'serverSide',

    // fetch 100 rows at a time
    cacheBlockSize: 100,

    // only keep 10 blocks of rows
    maxBlocksInCache: 10,

    animateRows: true,
    // debug: true

    onFilterChanged: onFilterChanged
};

var fakeServer;
var selectedCountries = null;

function onFilterChanged() {
    var countryFilterModel = gridOptions.api.getFilterModel()['country'];
    var selected = countryFilterModel && countryFilterModel.values;

    if (!areEqual(selectedCountries, selected)) {
        selectedCountries = selected;

        console.log('Refreshing sports filter');
        var sportFilter = gridOptions.api.getFilterInstance('sport');
        sportFilter.refreshFilterValues();
    }
}

function areEqual(a, b) {
    if (a == null && b == null) { return true; }
    if (a != null || b != null) { return false; }

    return a.length === b.length && a.every(function(v, i) { return b[i] === v; });
}

function getCountryValuesAsync(params) {
    var countries = fakeServer.getCountries();

    // simulating real server call with a 500ms delay
    setTimeout(function() { params.success(countries); }, 500);
}

function getSportValuesAsync(params) {
    var sports = fakeServer.getSports(selectedCountries);

    // simulating real server call with a 500ms delay
    setTimeout(function() { params.success(sports); }, 500);
}

function ServerSideDatasource(server) {
    return {
        getRows: function(params) {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            // get data for request from our fake server
            var response = server.getData(params.request);

            // simulating real server call with a 500ms delay
            setTimeout(function() {
                if (response.success) {
                    // supply rows for requested block to grid
                    params.successCallback(response.rows, response.lastRow);
                } else {
                    params.failCallback();
                }
            }, 500);
        },
    };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid
        .simpleHttpRequest({
            url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json',
        })
        .then(function(data) {
            // setup the fake server with entire dataset
            fakeServer = new FakeServer(data);

            // create datasource with a reference to the fake server
            var datasource = new ServerSideDatasource(fakeServer);

            // register the datasource with the grid
            gridOptions.api.setServerSideDatasource(datasource);
        });
});
