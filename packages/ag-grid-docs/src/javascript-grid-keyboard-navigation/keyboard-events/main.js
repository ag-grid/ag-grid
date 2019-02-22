var columnDefs = [
    {field: "athlete", width: 200},
    {field: "age"},
    {field: "country"},
    {field: "year"},
    {field: "date"},
    {field: "sport"},
    {field: "gold"},
    {field: "silver"},
    {field: "bronze"},
    {field: "total"}
];

var gridOptions = {
    rowData: null,
    columnDefs: columnDefs,
    defaultColDef: {
        width: 100
    },
    onCellKeyDown: onCellKeyDown,
    onCellKeyPress: onCellKeyPress
};

function onCellKeyDown(e) {
    console.log('onCellKeyDown', e);
}

function onCellKeyPress(e) {
    console.log('onCellKeyPress', e);
    let keyPressed = e.event.key;
    console.log('Key Pressed = ' + keyPressed);
    if (keyPressed==='s') {
        var rowNode = e.node;
        var newSelection = !rowNode.selected;
        console.log('setting selection on node ' + rowNode.data.athlete + ' to ' + newSelection);
        rowNode.setSelected(newSelection);
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});