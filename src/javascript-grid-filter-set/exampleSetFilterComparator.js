
var allAges = [];
for (var i = 0; i<100; i++) {
    allAges.push(''+i);
}

var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150, filter: 'text'},
    {headerName: "Age - Comparator", field: "age", width: 200, filter: 'set',
        filterParams: {
            values: allAges,
            comparator: function(a,b) {
                var numA = parseInt(a);
                var numB = parseInt(b);
                if (numA>numB) {
                    return 1;
                } else if (numA<numB) {
                    return -1;
                } else {
                    return 0;
                }
            }
        }},
    {headerName: "Age - No Comparator", field: "age", width: 200, filter: 'set',
        filterParams: {
            values: allAges
        }},
    {headerName: "Country", field: "country", width: 140}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true,
    enableColResize: true
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
