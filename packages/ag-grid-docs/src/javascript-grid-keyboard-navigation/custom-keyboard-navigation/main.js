var columnDefs = [
    {headerName: "Athlete", field: "athlete"},
    {headerName: "Age", field: "age"},
    {headerName: "Country", field: "country"},
    {headerName: "Year", field: "year"},
    {headerName: "Date", field: "date"},
    {headerName: "Sport", field: "sport"},
    {headerName: "Gold", field: "gold"},
    {headerName: "Silver", field: "silver"},
    {headerName: "Bronze", field: "bronze"},
    {headerName: "Total", field: "total"}
];

// define some handy keycode constants
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;

var gridOptions = {
    rowData: null,
    // make all cols editable
    defaultColDef: {
        editable: true
    },
    navigateToNextCell: navigateToNextCell,
    tabToNextCell: tabToNextCell,
    columnDefs: columnDefs,
    enableSorting: true,
    onGridReady: function (params) {
        // note that the columms can be added/removed as the viewport changes
        // be sure to remove old listeners when they're removed, and add new listeners when columns
        // are added (using virtualColumnsChanged for example)

        // store the colIds so that we can go along the columns
        var columns = params.columnApi.getAllDisplayedVirtualColumns();
        var colIds = columns.map(function (column) {
            return column.colId
        });

        var tabIndex = 0;
        columns.forEach(function (column) {
            // for each column set a tabindex, otherwise it wont be able to get focus
            var element = document.querySelector("div[col-id=" + column.colId + "] div.ag-header-cell-label");
            element.setAttribute("tabindex", tabIndex++);

            // register a listener for when a key is pressed on a column
            element
                .addEventListener('keydown', function (e) {
                    // if a tab, navigate to the next column and focus on it
                    // we loop back to the first column if the user is at the last visible column
                    if (e.key === 'Tab') {
                        var index = colIds.findIndex(function (colId) {
                            return colId === column.colId
                        });
                        if (index === -1 || index === colIds.length - 1) {
                            index = 0;
                        } else {
                            index = index + 1;
                        }

                        var nextElement = document.querySelector("div[col-id=" + colIds[index] + "] div.ag-header-cell-label");
                        nextElement.focus();

                        // otherwise it'll leap forward two columns
                        e.preventDefault();
                    } else if (e.key === 'Enter') {
                        // on enter sort the column
                        // you'll probably want to cycle through asc/desc/none here for each enter pressed
                        var sort = [
                            {colId: column.colId, sort: 'asc'}
                        ];
                        params.api.setSortModel(sort);
                    }
                })
        })
    }
};

function tabToNextCell(params) {
    var previousCell = params.previousCellDef;
    var lastRowIndex = previousCell.rowIndex;
    var nextRowIndex = params.backwards ? lastRowIndex + 1 : lastRowIndex - 1;

    var renderedRowCount = gridOptions.api.getModel().getRowCount();

    if (nextRowIndex < 0) {
        nextRowIndex = 0;
    }
    if (nextRowIndex >= renderedRowCount) {
        nextRowIndex = renderedRowCount - 1;
    }

    var result = {
        rowIndex: nextRowIndex,
        column: previousCell.column,
        floating: previousCell.floating
    };

    return result;
}

function navigateToNextCell(params) {
    var previousCell = params.previousCellDef;
    var suggestedNextCell = params.nextCellDef;
    switch (params.key) {
        case KEY_DOWN:
            // return the cell above
            var nextRowIndex = previousCell.rowIndex - 1;
            if (nextRowIndex < 0) {
                // returning null means don't navigate
                return null;
            } else {
                return {rowIndex: nextRowIndex, column: previousCell.column, floating: previousCell.floating};
            }
        case KEY_UP:
            // return the cell below
            var nextRowIndex = previousCell.rowIndex + 1;
            var renderedRowCount = gridOptions.api.getModel().getRowCount();
            if (nextRowIndex >= renderedRowCount) {
                // returning null means don't navigate
                return null;
            } else {
                return {rowIndex: nextRowIndex, column: previousCell.column, floating: previousCell.floating};
            }
        case KEY_LEFT:
        case KEY_RIGHT:
            return suggestedNextCell;
        default:
            throw 'this will never happen, navigation is always on of the 4 keys above';
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