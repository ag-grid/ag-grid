var columnDefs = [
    {headerName: "Athlete", field: "athlete", enableRowGroup: true},
    {headerName: "Age", field: "age", enableRowGroup: true},
    {headerName: "Country", field: "country", enableRowGroup: true, rowGroup: true, hide: true},
    {headerName: "Year", field: "year", enableRowGroup: true, rowGroup: true, hide: true},
    {headerName: "Sport", field: "sport", enableRowGroup: true},
    {headerName: "Gold", field: "gold", aggFunc: 'sum'},
    {headerName: "Silver", field: "silver", aggFunc: 'sum'},
    {headerName: "Bronze", field: "bronze", aggFunc: 'sum'}
];

var gridOptions = {
    defaultColDef: {
        suppressFilter: true,
        width: 100
    },
    columnDefs: columnDefs,
    enableColResize: true,
    rowModelType: 'serverSide',
    rowGroupPanelShow: 'always',
    animateRows: true,
    debug: true,
    enableSorting: true,
    sideBar: {
        toolPanels: [{
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          toolPanelParams: {
            suppressPivots: true,
            suppressPivotMode: true,
            suppressValues: true
          }
        }]
    },
    suppressAggFuncInHeader: true,
    rowSelection: 'multiple',
    // restrict to 2 server side calls concurrently
    maxConcurrentDatasourceRequests: 2,
    cacheBlockSize: 100,
    maxBlocksInCache: 2,
    purgeClosedRowNodes: true,
    onFirstDataRendered(params) {
        params.api.sizeColumnsToFit();
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json'})
        .then( function(data) {
                var fakeServer = new FakeServer(data);
                var datasource = new ServerSideDatasource(fakeServer, gridOptions);
                gridOptions.api.setServerSideDatasource(datasource);
            }
        );
});
