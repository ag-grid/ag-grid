var columnDefs = [

    // the first group column
    {headerName: "Country", cellRenderer: 'group', field: "country", rowGroupIndex: 0,
        cellRendererParams: {
            restrictToOneGroup: true
        }
    },

    // and second group column
    {headerName: "Year", cellRenderer: 'group', field: "year", rowGroupIndex: 1,
        cellRendererParams: {
            restrictToOneGroup: true
        }
    },

    {headerName: "Athlete", field: "athlete"},
    {headerName: "Gold", field: "gold"},
    {headerName: "Silver", field: "silver"},
    {headerName: "Bronze", field: "bronze"},
    {headerName: "Total", field: "total"},
    {headerName: "Age", field: "age"},
    {headerName: "Date", field: "date"},
    {headerName: "Sport", field: "sport"}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    groupSuppressAutoColumn: true
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
