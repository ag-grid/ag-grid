var list = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var getRandom = function(start, finish) {
    min = Math.ceil(start);
    max = Math.floor(finish);
    return Math.floor(Math.random() * (finish - start) + start);
};

var columnDefs = [
    {field: "athlete", width: 150},
    {field: "age", width: 90},
    {field: "country", width: 120},
    {field: "sport", width: 110},
    {field: "gold", width: 100},
    {field: "silver", width: 100},
    {field: "bronze", width: 100},
    {headerName: 'Day of the Week', field: 'dayOfTheWeek', width: 150}
];

var gridOptions = {
    columnDefs: columnDefs,
    enableRangeSelection: true,
    enableFillHandle: true,
    fillOperation: function(params) {
        if (params.initialValues.some(function(val) {
            return list.indexOf(val) === -1
        })) {
            return false;
        }
        var lastValue = params.values[params.values.length - 1];
        var idxOfLast = list.indexOf(lastValue);

        return list[(idxOfLast + 1) % list.length];
    },
    rowData: null
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText).slice(0, 100);
            var currentDate = new Date();
            var currentYear = currentDate.getFullYear();

            for (var i = 0; i < 100; i++) {
                var dt = new Date(getRandom(currentYear - 10, currentYear + 10), getRandom(0, 12), getRandom(1, 25));
                httpResult[i].dayOfTheWeek = list[dt.getDay()];
            }

            gridOptions.api.setRowData(httpResult);
        }
    };
});
