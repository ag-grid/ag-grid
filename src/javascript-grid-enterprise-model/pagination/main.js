var columnDefs = [
    {headerName: "Athlete", field: "athlete"},
    {headerName: "Age", field: "age"},
    {headerName: "Country", field: "country", rowGroup: true},
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
    columnDefs: columnDefs,
    enableColResize: true,
    rowModelType: 'enterprise',
    rowGroupPanelShow: 'never',
    enableSorting: true,
    functionsReadOnly: true,
    toolPanelSuppressPivotMode: true,
    toolPanelSuppressValues: true,
    animateRows: true,
    debug: true,
    pagination: true,
    paginationAutoPageSize: true,
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
        .then( function(data) {
            var fakeServer = new FakeServer(data);
            var datasource = new EnterpriseDatasource(fakeServer);
            gridOptions.api.setEnterpriseDatasource(datasource);
        }
    );
});
