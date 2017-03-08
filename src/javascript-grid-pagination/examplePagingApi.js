var columnDefs = [
    // this row just shows the row index, doesn't use any data from the row
    {headerName: "#", width: 50, cellRenderer: function(params) {
        return params.node.id + 1;
    } },
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
    // note - we do not set 'virtualPaging' here, so the grid knows we are doing standard paging
    enableSorting: true,
    enableFilter: true,
    debug: true,
    rowSelection: 'multiple',
    enableColResize: true,
    paginationPageSize: 500,
    columnDefs: columnDefs,
    rowModelType: 'pagination',
    suppressPaginationPanel: true,
    onPaginationReset: onPaginationReset,
    onPaginationPageLoaded: onPaginationPageLoaded,
    onPaginationPageRequested: onPaginationPageRequested
};

// when json gets loaded, it's put here, and  the datasource reads in from here.
// in a real application, the page will be got from the server.
var allOfTheData;

function createNewDatasource() {
    if (!allOfTheData) {
        // in case user selected 'onPageSizeChanged()' before the json was loaded
        return;
    }

    var dataSource = {
        //rowCount: ???, - not setting the row count, infinite paging will be used
        getRows: function (params) {
            // this code should contact the server for rows. however for the purposes of the demo,
            // the data is generated locally, a timer is used to give the experience of
            // an asynchronous call
            console.log('asking for ' + params.startRow + ' to ' + params.endRow);
            setTimeout( function() {
                // take a chunk of the array, matching the start and finish times
                var rowsThisPage = allOfTheData.slice(params.startRow, params.endRow);
                // see if we have come to the last page. if we have, set lastRow to
                // the very last row of the last page. if you are getting data from
                // a server, lastRow could be returned separately if the lastRow
                // is not in the current page.
                var lastRow = -1;
                if (allOfTheData.length <= params.endRow) {
                    lastRow = allOfTheData.length;
                }
                params.successCallback(rowsThisPage, lastRow);
            }, 500);
        }
    };

    gridOptions.api.setDatasource(dataSource);
}

function setText(selector, text) {
    document.querySelector(selector).innerHTML = text;
}

function onPaginationReset() {
    console.log('onPaginationReset');
}

function onPaginationPageLoaded() {
    console.log('onPaginationPageLoaded');

    setText('#lbLastPageFound', gridOptions.api.paginationIsLastPageFound());
    setText('#lbPageSize', gridOptions.api.paginationGetPageSize());
    // we +1 to current page, as pages are zero based
    setText('#lbCurrentPage', gridOptions.api.paginationGetCurrentPage() + 1);
    setText('#lbTotalPages', gridOptions.api.paginationGetTotalPages());
    setText('#lbLoading', 'false');

    setLastButtonDisabled(!gridOptions.api.paginationIsLastPageFound());
}

function setLastButtonDisabled(disabled) {
    document.querySelector('#btLast').disabled = disabled;
}

function onPaginationPageRequested() {
    console.log('onPaginationPageRequested');
    setText('#lbLoading', 'true');
}

function setRowData(rowData) {
    allOfTheData = rowData;
    createNewDatasource();
}

function onBtFirst() {
    gridOptions.api.paginationGoToFirstPage();
}

function onBtLast() {
    gridOptions.api.paginationGoToLastPage();
}

function onBtNext() {
    gridOptions.api.paginationGoToNextPage();
}

function onBtPrevious() {
    gridOptions.api.paginationGoToPreviousPage();
}

function onBtPageFive() {
    // we say page 4, as the first page is zero
    gridOptions.api.paginationGoToPage(4);
}

function onBtPageFifty() {
    // we say page 49, as the first page is zero
    gridOptions.api.paginationGoToPage(49);
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
            var httpResponse = JSON.parse(httpRequest.responseText);
            setRowData(httpResponse);
        }
    };
});
