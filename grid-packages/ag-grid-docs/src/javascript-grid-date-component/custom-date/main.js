var columnDefs = [
    { field: "athlete"},
    { field: "age", filter: 'agNumberColumnFilter'},
    { field: "country"},
    { field: "year"},
    {
        field: "date", minWidth: 190, filter: 'agDateColumnFilter', filterParams: {
            comparator: function (filterLocalDateAtMidnight, cellValue) {
                var dateAsString = cellValue;
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
            }
        }
    },
    { field: "sport"},
    { field: "gold", filter: 'agNumberColumnFilter'},
    { field: "silver", filter: 'agNumberColumnFilter'},
    { field: "bronze", filter: 'agNumberColumnFilter'},
    { field: "total", filter: false}
];

var gridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    },
    floatingFilter: true,
    columnDefs: columnDefs,
    rowData: null,
    // Here is where we specify the component to be used as the date picker widget
    components: {
        agDateInput: CustomDateComponent
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
