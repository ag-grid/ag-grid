var columnDefs = [
    {headerName: "Athlete", field: "athlete"},
    {headerName: "Age", field: "age"},
    {headerName: "Country", field: "country", rowGroupIndex: 0, enableRowGroup: true},
    {headerName: "Year", field: "year"},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100},
    {headerName: "Silver", field: "silver", width: 100},
    {headerName: "Bronze", field: "bronze", width: 100},
    {headerName: "Total", field: "total", width: 100}
];

var gridOptions = {
    columnDefs: columnDefs,
    enableColResize: true,
    rowModelType: 'enterprise',
    rowGroupPanelShow: 'always',
    debug: true
};

var allData;

function EnterpriseDatasource() {
}

EnterpriseDatasource.prototype.getRows = function(params) {

    // console.log('first is ', _.first(this.allData));
    // console.log('group by is', _.groupBy(this.allData, ['country','age']));

    console.log('EnterpriseDatasource.getRows: params = ', params);

    getRowsFromServer(params);
};

function getRowsFromServer(params) {

    var result = allData;
    var rowGroupCols = params.rowGroupCols;

    // if grouping, return the group
    if (rowGroupCols.length > 0) {

        var field = rowGroupCols[0].field;

        var mappedValues = _.groupBy(this.allData, field);

        var listOfKeys = Object.keys(mappedValues);

        var result = [];

        listOfKeys.forEach(function(key) {
            var item = {};
            item[field] = key;
            result.push(item)
        });

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
