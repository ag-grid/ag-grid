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
    enableFilter: true,
    animateRows: true,
    debug: true,
    enableSorting: true,
    suppressAggFuncInHeader: true,
    toolPanelSuppressPivotMode: true,
    toolPanelSuppressValues: true,
    // restrict to 2 server side calls concurrently
    maxConcurrentDatasourceRequests: 2,
    cacheBlockSize: 100,
    maxBlocksInCache: 2,
    purgeClosedRowNodes: true,
    getChildCount: function(data) {
        // return back a randam value, demonstrates how this can be set.
        // in a real application, the child count would be set on the
        // data item, and this method could simply be "return data.childCount"
        return Math.round((Math.random() * 100) + 1);
    },
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    },
    icons: {
        groupLoading: '<img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/javascript-grid-enterprise-model/spinner.gif" style="width:22px;height:22px;">'
    }
};

function purgeCache(route) {
    gridOptions.api.purgeEnterpriseCache(route);
}

function getBlockState() {
    var blockState = gridOptions.api.getCacheBlockState();
    console.log(blockState);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinners.json'})
        .then( function(rows) {
                var fakeServer = new FakeServer(rows);
                var datasource = new EnterpriseDatasource(fakeServer);
                gridOptions.api.setEnterpriseDatasource(datasource);
            }
        );
});
