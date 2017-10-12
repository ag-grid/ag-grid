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

// do http request to get our sample data - not using any framework to keep the example self contained.
// you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
function fetchData(url, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', url);
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            callback(httpResult);
        }
    };
}
// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetchData( 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinners.json', function(data) {
        var fakeServer = new FakeServer(data);
        var datasource = new EnterpriseDatasource(fakeServer);
        gridOptions.api.setEnterpriseDatasource(datasource);
    })
});
