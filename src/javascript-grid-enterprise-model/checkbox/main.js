var columnDefs = [
    {headerName: "Athlete", field: "athlete", enableRowGroup: true},
    {headerName: "Age", field: "age", enableRowGroup: true},
    {headerName: "Country", field: "country", enableRowGroup: true, rowGroup: true},
    {headerName: "Year", field: "year", enableRowGroup: true, rowGroup: true},
    {headerName: "Sport", field: "sport", enableRowGroup: true,
        checkboxSelection: function(params) {
            return !params.node.group;
        }
    },
    {headerName: "Gold", field: "gold", aggFunc: 'sum'},
    {headerName: "Silver", field: "silver", aggFunc: 'sum'},
    {headerName: "Bronze", field: "bronze", aggFunc: 'sum'}
];

var gridOptions = {
    defaultColDef: {
        suppressFilter: true,
        width: 100
    },
    rowBuffer: 0,
    columnDefs: columnDefs,
    enableColResize: true,
    rowModelType: 'enterprise',
    rowGroupPanelShow: 'always',
    animateRows: true,
    enableSorting: true,
    debug: true,
    suppressAggFuncInHeader: true,
    toolPanelSuppressPivotMode: true,
    toolPanelSuppressValues: true,
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    // groupSelectsChildren: true, // not supported for Enterprise Model
    // restrict to 2 server side calls concurrently
    maxConcurrentDatasourceRequests: 2,
    cacheBlockSize: 100,
    maxBlocksInCache: 2,
    purgeClosedRowNodes: true,
    autoGroupColumnDef: {
        field: 'athlete',
        width: 200,
        // headerCheckboxSelection: true, // not supported for Enterprise Model
        cellRendererParams: {
            checkbox: true
        }
    },
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    },
    icons: {
        groupLoading: '<img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/javascript-grid-enterprise-model/spinner.gif" style="width:22px;height:22px;">'
    }
};

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
