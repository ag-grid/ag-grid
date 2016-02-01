var columnDefs = [
    // this row just shows the row index, doesn't use any data from the row
    {headerName: "#", width: 50, cellRenderer: function(params) {
        return params.node.id + 1;
    } },
    {headerName: "Athlete", field: "athlete", width: 150},
    {headerName: "Age", field: "age", width: 90},
    {headerName: "Country", field: "country", width: 120},
    {headerName: "Year", field: "year", width: 90, filter: 'number'},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110, filter: 'text'},
    {headerName: "Gold", field: "gold", width: 100},
    {headerName: "Silver", field: "silver", width: 100},
    {headerName: "Bronze", field: "bronze", width: 100},
    {headerName: "Total", field: "total", width: 100}
];

var gridOptions = {
    // note - we do not set 'virtualPaging' here, so the grid knows we are doing standard paging
    enableSorting: true,
    enableFilter: true,
    enableColResize: true,
    columnDefs: columnDefs,
    showToolPanel: true,
    localeText: {
        // for filter panel
        page: 'daPage',
        more: 'daMore',
        to: 'daTo',
        of: 'daOf',
        next: 'daNexten',
        last: 'daLasten',
        first: 'daFirsten',
        previous: 'daPreviousen',
        loadingOoo: 'daLoading...',
        // for set filter
        selectAll: 'daSelect Allen',
        searchOoo: 'daSearch...',
        blanks: 'daBlanc',
        // for number filter and string filter
        filterOoo: 'daFilter...',
        applyFilter: 'daApplyFilter...',
        // for number filter
        equals: 'daEquals',
        lessThan: 'daLessThan',
        greaterThan: 'daGreaterThan',
        // for text filter
        contains: 'daContains',
        startsWith: 'daStarts dawith',
        endsWith: 'daEnds dawith',
        // tool panel
        columns: 'laColumns',
        rowGroupColumns: 'laPivot Cols',
        rowGroupColumnsEmptyMessage: 'la please drag cols to here',
        valueColumns: 'laValue Cols',
        valueColumnsEmptyMessage: 'la please drag cols to here'
    }
};

function setDataSource(allOfTheData) {
    var dataSource = {
        //rowCount: ???, - not setting the row count, infinite paging will be used
        pageSize: 500,
        overflowSize: 500,
        getRows: function (params) {
            // this code should contact the server for rows. however for the purposes of the demo,
            // the data is generated locally, and a timer is used to give the expereince of
            // an asynchronous call
            console.log('asking for ' + params.startRow + ' to ' + params.endRow);
            setTimeout( function() {
                // take a chunk of the array, matching the start and finish times
                var rowsThisPage = allOfTheData.slice(params.startRow, params.endRow);
                var lastRow = -1;
                // see if we have come to the last page, and if so, return it
                if (allOfTheData.length <= params.endRow) {
                    lastRow = allOfTheData.length;
                }
                params.successCallback(rowsThisPage, lastRow);
            }, 500);
        }
    };
    gridOptions.api.setDatasource(dataSource);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '../olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            setDataSource(httpResult);
        }
    };
});