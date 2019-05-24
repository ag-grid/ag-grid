var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150,
        filter: 'agTextColumnFilter',
        filterParams: { applyButton: true, clearButton:true }
    },
    {headerName: "Age", field: "age", width: 90,
        filter: 'agNumberColumnFilter',
        filterParams: { applyButton: true, clearButton:true }
    },
    {headerName: "Country", field: "country", width: 120,
        filterParams: { applyButton: true, clearButton:true }
    },
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100, filter: 'agNumberColumnFilter'},
    {headerName: "Silver", field: "silver", width: 100, filter: 'agNumberColumnFilter'},
    {headerName: "Bronze", field: "bronze", width: 100, filter: 'agNumberColumnFilter'},
    {headerName: "Total", field: "total", width: 100, filter: 'agNumberColumnFilter'}
];

var gridOptions = {
    defaultColDef: {
        filter: true
    },
    columnDefs: columnDefs,
    rowData: null,
    onFilterChanged: function() {console.log('onFilterChanged');},
    onFilterModified: function() {console.log('onFilterModified');}
};

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
            gridOptions.api.setRowData(httpResult);
        }
    };
});

