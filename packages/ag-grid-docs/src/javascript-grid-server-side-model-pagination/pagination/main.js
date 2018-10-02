var columnDefs = [
    {headerName: "Athlete", field: "athlete"},
    {headerName: "Country", field: "country", rowGroup: true, hide: true},
    {headerName: "Year", field: "year"},
    {headerName: "Sport", field: "sport"},
    {headerName: "Gold", field: "gold"},
    {headerName: "Silver", field: "silver"},
    {headerName: "Bronze", field: "bronze"}
];

var gridOptions = {
    defaultColDef: {
        width: 100,
        suppressFilter: true
    },
    autoGroupColumnDef: {
        width: 150
    },
    columnDefs: columnDefs,
    enableColResize: true,
    rowModelType: 'serverSide',
    rowGroupPanelShow: 'never',
    enableSorting: true,
    functionsReadOnly: true,
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
    animateRows: true,
    debug: true,
    pagination: true,
    paginationAutoPageSize: true
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
            var datasource = new ServerSideDatasource(fakeServer);
            gridOptions.api.setServerSideDatasource(datasource);
        }
    );
});
