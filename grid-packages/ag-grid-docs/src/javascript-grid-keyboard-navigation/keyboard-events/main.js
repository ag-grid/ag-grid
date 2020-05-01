var columnDefs = [
    { field: "athlete", minWidth: 170 },
    { field: "age" },
    { field: "country" },
    { field: "year" },
    { field: "date" },
    { field: "sport" },
    { field: "gold" },
    { field: "silver" },
    { field: "bronze" },
    { field: "total" }
];

var gridOptions = {
    rowData: null,
    columnDefs: columnDefs,
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true,
    },
    onCellKeyDown: onCellKeyDown,
    onCellKeyPress: onCellKeyPress
};

function onCellKeyDown(e) {
    console.log('onCellKeyDown', e);
}

function onCellKeyPress(e) {
    console.log('onCellKeyPress', e);
    var keyPressed = e.event.key;
    console.log('Key Pressed = ' + keyPressed);
    if (keyPressed === 's') {
        var rowNode = e.node;
        var newSelection = !rowNode.selected;
        console.log('setting selection on node ' + rowNode.data.athlete + ' to ' + newSelection);
        rowNode.setSelected(newSelection);
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
