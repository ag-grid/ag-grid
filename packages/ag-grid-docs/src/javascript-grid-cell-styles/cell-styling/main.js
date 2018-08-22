var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150},
    {headerName: "Age", field: "age", width: 90, valueParser: numberParser,
        cellClassRules: {
            'rag-green': 'x < 20',
            'rag-amber': 'x >= 20 && x < 25',
            'rag-red': 'x >= 25'
        }
    },
    {headerName: "Country", field: "country", width: 120},
    {headerName: "Year", field: "year", valueParser: numberParser,
        cellClassRules: {
            'rag-green-outer': function(params) { return params.value === 2008},
            'rag-amber-outer': function(params) { return params.value === 2004},
            'rag-red-outer': function(params) { return params.value === 2000}
        },
        cellRenderer: function(params) {
            return '<span class="rag-element">'+params.value+'</span>';
        }
    },
    {headerName: "Date", field: "date",
        cellClass: 'rag-amber'
    },
    {headerName: "Sport", field: "sport",
        cellClass: function(params) { return params.value === 'Swimming' ? 'rag-green' : 'rag-amber'; }
    },
    {headerName: "Gold", field: "gold", valueParser: numberParser,
        cellStyle: {
            // you can use either came case or dashes, the grid converts to whats needed
            backgroundColor: '#aaffaa' // light green
        }},
    {headerName: "Silver", field: "silver", valueParser: numberParser,
        // when cellStyle is a func, we can have the style change
        // dependent on the data, eg different colors for different values
        cellStyle: function(params) {
            var color = numberToColor(params.value);
            return {
                backgroundColor: color
            }
        }},
    {headerName: "Bronze", field: "bronze", valueParser: numberParser,
        // same as above, but demonstrating dashes in the style, grid takes care of converting to/from camel case
        cellStyle: function(params) {
            var color = numberToColor(params.value);
            return {
                // dash here
                'background-color': color
            }
        }},
    {headerName: "Total", field: "total"}
];

function numberToColor(val) {
    if (val===0) {
        return '#ffaaaa';
    } else if (val==1) {
        return '#aaaaff';
    } else {
        return '#aaffaa';
    }
}

function numberParser(params) {
    var newValue = params.newValue;
    var valueAsNumber;
    if (newValue === null || newValue === undefined || newValue === '') {
        valueAsNumber = null;
    } else {
        valueAsNumber = parseFloat(params.newValue);
    }
    return valueAsNumber;
}

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        editable: true,
        width: 100
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
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});