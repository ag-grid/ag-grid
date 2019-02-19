var columnDefs = [
    {
        field: "athlete",
        width: 150},
    {
        field: "age",
        width: 90,
        filter: 'agNumberColumnFilter',
        filterParams: {
            filterOptions: [
                'lessThan',
                {
                    displayKey: 'lessThanWithNulls',
                    displayName: 'Less Than with Nulls',
                    test: function(filterValue, cellValue) {
                        return cellValue == null || cellValue < filterValue;
                    }
                },
                'greaterThan',
                {
                    displayKey: 'greaterThanWithNulls',
                    displayName: 'Greater Than with Nulls',
                    test: function(filterValue, cellValue) {
                        return cellValue == null || cellValue > filterValue;
                    }
                }
            ]
        }
    },
    {
        field: "date",
        width: 145,
        filter:'agDateColumnFilter',
        filterParams: {
            filterOptions: [
                'equals',
                {
                    displayKey: 'equalsWithNulls',
                    displayName: 'Equals (with Nulls)',
                    test: function(filterValue, cellValue) {
                        if (cellValue == null) return true;

                        var parts = cellValue.split("/");
                        var cellDate = new Date(
                            Number(parts[2]),
                            Number(parts[1] - 1),
                            Number(parts[0])
                        );

                        return cellDate.getTime() === filterValue.getTime();
                    }
                },

            ],
            comparator: function (filterLocalDateAtMidnight, cellValue){
                var dateAsString = cellValue;
                if (dateAsString == null) return -1;
                var dateParts  = dateAsString.split("/");
                var cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));

                if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
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
    {
        field: "country",
        width: 120,
        filterParams: {
            filterOptions: [
                'contains',
                'equals',
                {
                    displayKey: 'notEqualWithNulls',
                    displayName: 'Not Equals with Nulls',
                    test: function(filterValue, cellValue) {
                        return cellValue == null || cellValue !== filterValue;
                    }
                }
            ]
        }
    },
    {headerName: "Gold", field: "gold", width: 100, filter: 'agNumberColumnFilter'},
    {headerName: "Silver", field: "silver", width: 100, filter: 'agNumberColumnFilter'},
    {headerName: "Bronze", field: "bronze", width: 100, filter: 'agNumberColumnFilter'},
    {headerName: "Total", field: "total", width: 100, filter: false}
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        sortable: true,
        filter: true
    }
};

function introduceNullsToResults(httpResult) {
    var results = httpResult.slice(10,35);
    results.forEach(res => {
        if (res.date === "24/08/2008") {
            res.date = null;
        }

        if (res.age === 24) {
            res.age = null;
        }

        if (res.country === 'Australia') {
            res.country = null;
        }
    });

    return results;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(introduceNullsToResults(httpResult));
        }
    };
});