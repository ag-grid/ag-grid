var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150, cellStyle: {color: 'darkred'}},
    {headerName: "Age", field: "age", width: 90, cellStyle: function(params) {
        if (params.value>=30) {
            return {'background-color': 'lightblue'};
        } else {
            return null;
        }
    }},
    {headerName: "Country", field: "country", width: 120},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100, cellRenderer: function(params) {
        var resultElement = document.createElement("span");
        for (var i = 0; i<params.value; i++) {
            var starImageElement = document.createElement("img");
            starImageElement.src = "/images/goldStar.png";
            resultElement.appendChild(starImageElement);
        }
        return resultElement;
    }},
    {headerName: "Silver", field: "silver", width: 100},
    {headerName: "Bronze", field: "bronze", width: 100},
    {headerName: "Total", field: "total", width: 100}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null
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
