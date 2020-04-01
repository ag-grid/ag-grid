var columnDefs = [
    { headerName: '#', colId: 'rowNum', valueGetter: 'node.id', width: 80 },
    { headerName: 'Athlete', field: 'athlete', width: 150 },
    { headerName: 'Age', field: 'age', width: 90 },
    { headerName: 'Country', field: 'country', width: 150 },
    { headerName: 'Year', field: 'year', width: 90 },
    { headerName: 'Date', field: 'date', width: 110,
        editable: true,
        cellEditor: 'agDateTimeCellEditor',
        cellEditorParams: {
            valueToDate: function(value) {
                var parts = value.split("/");
                var date = parts[0];
                var month = parts[1];
                var year = parts[2];
                return new Date(parseFloat(year), parseFloat(month) - 1, parseFloat(date));
            },
            dateToValue: function(date) {
                function pad(number) {
                    return number < 10 ? "0" + number : "" + number;
                }
                return pad(date.getDate()) + '/' + pad(date.getMonth() + 1) + '/' + date.getFullYear();
            }
        }
    }
];

var gridOptions = {
    defaultColDef: {
        resizable: true,
    },
    columnDefs: columnDefs,
    debug: true,
    rowData: null,
    onGridReady: function() {
        gridOptions.api.sizeColumnsToFit()
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open(
        'GET',
        'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'
    );
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
