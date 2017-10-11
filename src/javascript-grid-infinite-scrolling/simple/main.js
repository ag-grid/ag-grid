var columnDefs = [
    // this row shows the row index, doesn't use any data from the row
    {headerName: "ID", width: 50,
        // it is important to have node.id here, so that when the id changes (which happens
        // when the row is loaded) then the cell is refreshed.
        valueGetter: 'node.id',
        cellRenderer: function(params) {
            if (params.value !== undefined) {
                return params.value;
            } else {
                return '<img src="../images/loading.gif">'
            }
        }
    },
    {headerName: "Athlete", field: "athlete", width: 150},
    {headerName: "Age", field: "age", width: 90},
    {headerName: "Country", field: "country", width: 120},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100},
    {headerName: "Silver", field: "silver", width: 100},
    {headerName: "Bronze", field: "bronze", width: 100},
    {headerName: "Total", field: "total", width: 100}
];

var gridOptions = {
    enableColResize: true,
    rowBuffer: 0,
    debug: true,
    rowSelection: 'multiple',
    rowDeselection: true,
    columnDefs: columnDefs,
    // tell grid we want virtual row model type
    rowModelType: 'infinite',
    // how big each page in our page cache will be, default is 100
    paginationPageSize: 100,
    // how many extra blank rows to display to the user at the end of the dataset,
    // which sets the vertical scroll and then allows the grid to request viewing more rows of data.
    // default is 1, ie show 1 row.
    cacheOverflowSize: 2,
    // how many server side requests to send at a time. if user is scrolling lots, then the requests
    // are throttled down
    maxConcurrentDatasourceRequests: 2,
    // how many rows to initially show in the grid. having 1 shows a blank row, so it looks like
    // the grid is loading from the users perspective (as we have a spinner in the first col)
    infiniteInitialRowCount: 1,
    // how many pages to store in cache. default is undefined, which allows an infinite sized cache,
    // pages are never purged. this should be set for large data to stop your browser from getting
    // full of data
    maxBlocksInCache: 2
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

    fetchData('https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinners.json', function(data) {
        var dataSource = {
            rowCount: null, // behave as infinite scroll
            getRows: function (params) {
                console.log('asking for ' + params.startRow + ' to ' + params.endRow);
                // At this point in your code, you would call the server, using $http if in AngularJS 1.x.
                // To make the demo look real, wait for 500ms before returning
                setTimeout( function() {
                    // take a slice of the total rows
                    var rowsThisPage = data.slice(params.startRow, params.endRow);
                    // if on or after the last page, work out the last row.
                    var lastRow = -1;
                    if (data.length <= params.endRow) {
                        lastRow = data.length;
                    }
                    // call the success callback
                    params.successCallback(rowsThisPage, lastRow);
                }, 500);
            }
        };

        gridOptions.api.setDatasource(dataSource);
    });
});
