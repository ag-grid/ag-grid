var columnDefs = [

    // the first group column
    {headerName: "Country", cellRenderer: 'group', field: "country", rowGroupIndex: 0,
        cellRendererParams: {
            restrictToOneGroup: true
        }
    },

    // and second group column
    {headerName: "Year", cellRenderer: 'group', field: "year", rowGroupIndex: 1, width: 130,
        cellRendererParams: {
            restrictToOneGroup: true
        }
    },

    {headerName: "Athlete", field: "athlete", width: 150},
    {headerName: "Gold", field: "gold", aggFunc: 'sum', width: 100},
    {headerName: "Silver", field: "silver", aggFunc: 'sum', width: 100},
    {headerName: "Bronze", field: "bronze", aggFunc: 'sum', width: 100},
    {headerName: "Total", field: "total", aggFunc: 'sum', width: 100}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    groupSuppressAutoColumn: true,
    groupHideOpenParents: true,
    animateRows: true,
    onGridReady: function(params) {
        // params.api.sizeColumnsToFit();
    }
};

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
            gridOptions.api.setRowData(httpResult);
        }
    };
});
