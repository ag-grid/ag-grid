var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150},
    {headerName: "Age", field: "age", width: 90},
    {headerName: "Country", field: "country", width: 120},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100},
    {headerName: "Silver", field: "silver", width: 100},
    {headerName: "Bronze", field: "bronze", width: 100},
    {headerName: "Total", field: "total", width: 100}
];

var gridOptions = {
    defaultColDef: {
        editable: true
    },
    columnDefs: columnDefs,
    enableRangeSelection: true,
    rowData: null,
    onRangeSelectionChanged: onRangeSelectionChanged,
    processCellForClipboard: function(params) {
        if (params.column.getColId()==='athlete' && params.value && params.value.toUpperCase) {
            return params.value.toUpperCase();
        } else {
            return params.value;
        }
    },
    processCellFromClipboard: function(params) {
        if (params.column.getColId()==='athlete' && params.value && params.value.toLowerCase) {
            return params.value.toLowerCase();
        } else {
            return params.value;
        }
    }
};

function onAddRange() {
    gridOptions.api.addRangeSelection({
        rowStart: 4,
        rowEnd: 8,
        columnStart: 'age',
        columnEnd: 'date'
    });
}

function onClearRange() {
    gridOptions.api.clearRangeSelection();
}

function onRangeSelectionChanged(event) {

    var lbRangeCount = document.querySelector('#lbRangeCount');
    var lbEagerSum = document.querySelector('#lbEagerSum');
    var lbLazySum = document.querySelector('#lbLazySum');

    var rangeSelections = gridOptions.api.getRangeSelections();

    // if no selection, clear all the results and do nothing more
    if (!rangeSelections || rangeSelections.length===0) {
        lbRangeCount.innerHTML = '0';
        lbEagerSum.innerHTML = '-';
        lbLazySum.innerHTML = '-';
        return;
    }

    // set range count to the number of ranges selected
    lbRangeCount.innerHTML = rangeSelections.length;

    // consider the first range only. if doing multi select, disregard the others
    var firstRange = rangeSelections[0];

    var sum = 0;

    // get starting and ending row, remember rowEnd could be before rowStart
    var startRow = Math.min(firstRange.start.rowIndex, firstRange.end.rowIndex);
    var endRow = Math.max(firstRange.start.rowIndex, firstRange.end.rowIndex);

    var api = gridOptions.api;
    for (var rowIndex = startRow; rowIndex<=endRow; rowIndex++) {
        firstRange.columns.forEach( function(column) {
            var rowModel = api.getModel();
            var rowNode = rowModel.getRow(rowIndex);
            var value = api.getValue(column, rowNode);
            if (typeof value === 'number') {
                sum += value;
            }
        });
    }

    lbEagerSum.innerHTML = sum;
    if (event.started) {
        lbLazySum.innerHTML = '?';
    }
    if (event.finished) {
        lbLazySum.innerHTML = sum;
    }
}

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
