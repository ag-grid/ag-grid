var filterParams = {
    comparator: function (filterLocalDateAtMidnight, cellValue) {
        var dateAsString = cellValue;
        if (dateAsString == null) return -1;
        var dateParts = dateAsString.split("/");
        var cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));

        if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
            return 0;
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

var columnDefs = [
    {field: "athlete"},
    {field: "age", filter: 'agNumberColumnFilter', maxWidth: 100},
    {field: "country"},
    {field: "year", maxWidth: 100},
    {
        field: "date",
        filter: 'agDateColumnFilter',
        filterParams: filterParams
    },
    {field: "sport"},
    {field: "gold", filter: 'agNumberColumnFilter'},
    {field: "silver", filter: 'agNumberColumnFilter'},
    {field: "bronze", filter: 'agNumberColumnFilter'},
    {field: "total", filter: false},
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
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json'})
        .then(function (data) {
            gridOptions.api.setRowData(data);
        });
});
