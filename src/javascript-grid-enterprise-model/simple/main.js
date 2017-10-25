var columnDefs = [
    {headerName: "Athlete", field: "athlete"},
    {headerName: "Age", field: "age"},
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
    enableSorting: true,
    columnDefs: columnDefs,
    enableColResize: true,
    // use the enterprise row model
    rowModelType: 'enterprise',
    // bring back data 50 rows at a time
    cacheBlockSize: 50,
    // don't show the grouping in a panel at the top
    rowGroupPanelShow: 'never',
    toolPanelSuppressPivotMode: true,
    toolPanelSuppressValues: true,
    animateRows: true,
    debug: true,
    icons: {
        groupLoading: '<img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/javascript-grid-enterprise-model/spinner.gif" style="width:22px;height:22px;">'
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinners.json'}).then(function(data) {
        var fakeServer = new FakeServer(data);
        var datasource = new EnterpriseDatasource(fakeServer);
        gridOptions.api.setEnterpriseDatasource(datasource);
    });
});
