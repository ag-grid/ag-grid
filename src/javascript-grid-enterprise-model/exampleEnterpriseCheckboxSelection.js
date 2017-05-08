var columnDefs = [
    {headerName: "Athlete", field: "athlete", enableRowGroup: true},
    {headerName: "Age", field: "age", enableRowGroup: true},
    {headerName: "Country", field: "country", enableRowGroup: true,
        rowGroupIndex: 0
    },
    {headerName: "Year", field: "year", enableRowGroup: true,
        rowGroupIndex: 1
    },
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
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    // groupSelectsChildren: true, // not supported for Enterprise Model
    // restrict to 2 server side calls concurrently
    maxConcurrentDatasourceRequests: 2,
    infiniteBlockSize: 100,
    maxPagesInCache: 2,
    purgeClosedRowNodes: true,
    groupColumnDef: {
        field: 'athlete',
        headerName: "Group",
        width: 200,
        cellRenderer: 'group',
        // headerCheckboxSelection: true, // not supported for Enterprise Model
        cellRendererParams: {
            checkbox: true
        }
    },
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: '../olympicWinners.json'})
        .then( function(rows) {
                var fakeServer = new FakeServer(rows);
                var datasource = new EnterpriseDatasource(fakeServer);
                gridOptions.api.setEnterpriseDatasource(datasource);
            }
        );
});
