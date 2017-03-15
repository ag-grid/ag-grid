var columnDefs = [
    {headerName: "Athlete", field: "athlete", enableRowGroup: true},
    {headerName: "Age", field: "age", enableRowGroup: true},
    {headerName: "Country", field: "country", rowGroupIndex: 0, enableRowGroup: true},
    {headerName: "Year", field: "year", enableRowGroup: true},
    {headerName: "Date", field: "date"},
    {headerName: "Sport", field: "sport"},
    {headerName: "Gold", field: "gold"},
    {headerName: "Silver", field: "silver"},
    {headerName: "Bronze", field: "bronze"},
    {headerName: "Total", field: "total"}
];

var gridOptions = {
    columnDefs: columnDefs,
    enableColResize: true,
    rowModelType: 'enterprise',
    rowGroupPanelShow: 'always',
    animateRows: true,
    debug: true
};

var allData;

function EnterpriseDatasource() {}

EnterpriseDatasource.prototype.getRows = function(params) {
    console.log('EnterpriseDatasource.getRows: params = ', params);
    getRowsFromServer(params);
};

function getRowsFromServer(params) {

    var result = allData;
    var request = params.request;
    var rowGroupCols = request.rowGroupCols;

    // if grouping, return the group
    if (rowGroupCols.length > 0) {

        var field = rowGroupCols[0].field;

        var mappedValues = _.groupBy(this.allData, field);

        var lookingForChildren = request.groupKeys && request.groupKeys.length > 0;

        if (lookingForChildren) {
            var groupKey = request.groupKeys[0];
            result = mappedValues[groupKey];
        } else {
            var listOfKeys = Object.keys(mappedValues);
            var result = [];
            listOfKeys.forEach(function(key) {
                var item = {};
                item[field] = key;
                result.push(item)
            });
        }

    }

    setTimeout( function() {
        params.successCallback(result);
    }, 1000);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: '../olympicWinners.json'})
        .then( function(rows) {
            allData = rows;
            var datasource = new EnterpriseDatasource();
            gridOptions.api.setEnterpriseDatasource(datasource);
        }
    );
});
