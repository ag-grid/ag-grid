var gridOptions = {
    // define grid columns
    columnDefs: [
        // using default ColDef
        {headerName: 'Athlete', field: 'athlete'},
        {headerName: 'Sport', field: 'sport'},

        // using number column type
        {headerName: 'Age', field: 'age', type: 'numberColumn'},
        {headerName: 'Year', field: 'year', type: 'numberColumn'},

        // using date and non-editable column types
        {headerName: 'Date', field: 'date', type: ['dateColumn', 'nonEditableColumn']},
        {
            headerName: 'Medals',
            groupId: 'medalsGroup',
            children: [
                // using medal column type
                {headerName: 'Gold', field: 'gold', type: 'medalColumn'},
                {headerName: 'Silver', field: 'silver', type: 'medalColumn'},
                {headerName: 'Bronze', field: 'bronze', type: 'medalColumn'}
            ]
        }
    ],

    // default ColDef, gets applied to every column
    defaultColDef: {
        // set the default column width
        width: 150,
        // make every column editable
        editable: true,
        // make every column use 'text' filter by default
        filter: 'text'
    },

    // default ColGroupDef, get applied to every column group
    defaultColGroupDef: {
        marryChildren: true
    },

    // define specific column types
    columnTypes: {
        numberColumn: {width: 83, filter: 'number'},
        medalColumn: {width: 100, columnGroupShow: 'open', suppressFilter: true},
        nonEditableColumn: {editable: false},
        dateColumn: {
            // specify we want to use the date filter
            filter: 'date',

            // add extra parameters for the date filter
            filterParams: {
                // provide comparator function
                comparator: function(filterLocalDateAtMidnight, cellValue) {
                    // In the example application, dates are stored as dd/mm/yyyy
                    // We create a Date object for comparison against the filter date
                    var dateParts = cellValue.split('/');
                    var day = Number(dateParts[2]);
                    var month = Number(dateParts[1]) - 1;
                    var year = Number(dateParts[0]);
                    var cellDate = new Date(day, month, year);

                    // Now that both parameters are Date objects, we can compare
                    if (cellDate < filterLocalDateAtMidnight) {
                        return -1;
                    } else if (cellDate > filterLocalDateAtMidnight) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    },

    rowData: null,
    enableFilter: true,
    floatingFilter: true
};

// do http request to get our sample data - not using any framework to keep the example self contained.
// you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
function fetchData(url, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', url);
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            callback(httpResult);
        }
    };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetchData('https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinnersSmall.json', function(data) {
        gridOptions.api.setRowData(data);
    });
});