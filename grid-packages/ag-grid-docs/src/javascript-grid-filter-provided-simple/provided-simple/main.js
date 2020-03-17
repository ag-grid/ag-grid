var columnDefs = [
    { field: "athlete" },
    { field: "age", filter: 'agNumberColumnFilter', maxWidth: 100 },
    { field: "country" },
    { field: "year", maxWidth: 100 },
    {
        field: "date",
        filter: 'agDateColumnFilter',
        filterParams: {
            comparator: function (filterLocalDateAtMidnight, cellValue) {
                var dateAsString = cellValue;
                if (dateAsString == null) return -1;
                var dateParts  = dateAsString.split("/");
                var cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));

                if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
                    return 0
                }

                if (cellDate < filterLocalDateAtMidnight) {
                    return -1;
                }

                if (cellDate > filterLocalDateAtMidnight) {
                    return 1;
                }
            },
            browserDatePicker: true
        }
    },
    { field: "sport" },
    { field: "gold", filter: 'agNumberColumnFilter' },
    { field: "silver", filter: 'agNumberColumnFilter' },
    { field: "bronze", filter: 'agNumberColumnFilter' },
    { field: "total", filter: false },
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
