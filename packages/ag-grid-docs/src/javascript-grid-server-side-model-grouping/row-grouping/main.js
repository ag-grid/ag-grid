var columnDefs = [
    {headerName: "Athlete", field: "athlete"},
    {headerName: "Age", field: "age"},
    {headerName: "Country", field: "country", width: 200, rowGroup: true, hide: true},
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
    enableSorting: true,
    columnDefs: columnDefs,
    enableColResize: true,
    // use the server side row model
    rowModelType: 'serverSide',
    // bring back data 50 rows at a time
    cacheBlockSize: 50,
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
            }
        }],
        defaultToolPanel: 'columns'
    },
    animateRows: true,
    debug: true
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json'}).then(function(data) {
        var fakeServer = new FakeServer(data);
        var datasource = new ServerSideDatasource(fakeServer);
        gridOptions.api.setServerSideDatasource(datasource);
    });
});
