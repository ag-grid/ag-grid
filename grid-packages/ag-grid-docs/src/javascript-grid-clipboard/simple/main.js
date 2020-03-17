var gridOptions = {
    columnDefs: [
        { field: "athlete", minWidth: 200 },
        { field: "age" },
        { field: "country", minWidth: 150 },
        { field: "year" },
        { field: "date", minWidth: 150 },
        { field: "sport", minWidth: 150 },
        { field: "gold" },
        { field: "silver" },
        { field: "bronze" },
        { field: "total" }
    ],

    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        resizable: true
    },

    enableRangeSelection: true,
    rowSelection: 'multiple',

    onCellValueChanged: onCellValueChanged,
    onPasteStart: onPasteStart,
    onPasteEnd: onPasteEnd
};

function onCellValueChanged(params) {
    console.log("Callback onCellValueChanged:", params);
}

function onPasteStart(params) {
    console.log('Callback onPasteStart:' ,params);
}

function onPasteEnd(params) {
    console.log('Callback onPasteEnd:' ,params);
}

function onBtCopyRows() {
    gridOptions.api.copySelectedRowsToClipboard();
}

function onBtCopyRange() {
    gridOptions.api.copySelectedRangeToClipboard();
}

function onPasteOff() {
    gridOptions.api.setSuppressClipboardPaste(true);
}

function onPasteOn() {
    gridOptions.api.setSuppressClipboardPaste(false);
}

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
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
