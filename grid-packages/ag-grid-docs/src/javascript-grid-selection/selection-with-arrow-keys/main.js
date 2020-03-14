var gridOptions = {
    columnDefs: [
        { field: "athlete", minWidth: 150 },
        { field: "age", maxWidth: 90 },
        { field: "country", minWidth: 150 },
        { field: "year", maxWidth: 90 },
        { field: "date", minWidth: 150 },
        { field: "sport", minWidth: 150 },
        { field: "gold" },
        { field: "silver" },
        { field: "bronze" },
        { field: "total" }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    rowSelection: 'single',
    rowData: null,
    navigateToNextCell: navigateToNextCell
};

function navigateToNextCell(params) {
    var previousCell = params.previousCellPosition;
    var suggestedNextCell = params.nextCellPosition;

    var KEY_UP = 38;
    var KEY_DOWN = 40;
    var KEY_LEFT = 37;
    var KEY_RIGHT = 39;

    switch (params.key) {
        case KEY_DOWN:
            previousCell = params.previousCellPosition;
            // set selected cell on current cell + 1
            gridOptions.api.forEachNode(function(node) {
                if (previousCell.rowIndex + 1 === node.rowIndex) {
                    node.setSelected(true);
                }
            });
            return suggestedNextCell;
        case KEY_UP:
            previousCell = params.previousCellPosition;
            // set selected cell on current cell - 1
            gridOptions.api.forEachNode(function(node) {
                if (previousCell.rowIndex - 1 === node.rowIndex) {
                    node.setSelected(true);
                }
            });
            return suggestedNextCell;
        case KEY_LEFT:
        case KEY_RIGHT:
            return suggestedNextCell;
        default:
            throw "this will never happen, navigation is always one of the 4 keys above";
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
