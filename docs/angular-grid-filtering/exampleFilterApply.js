var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150,
        filter: 'text',
        filterParams: { apply: true }
    },
    {headerName: "Age", field: "age", width: 90,
        filter: 'number',
        filterParams: { apply: true }
    },
    {headerName: "Country", field: "country", width: 120,
        filter: 'set',
        filterParams: { apply: true }
    },
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100, filter: 'number'},
    {headerName: "Silver", field: "silver", width: 100, filter: 'number'},
    {headerName: "Bronze", field: "bronze", width: 100, filter: 'number'},
    {headerName: "Total", field: "total", width: 100, filter: 'number'}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true,
    onBeforeFilterChanged: function() {console.log('onBeforeFilterChanged');},
    onAfterFilterChanged: function() {console.log('onAfterFilterChanged');},
    onFilterModified: function() {console.log('onFilterModified');}
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

