var columnDefs = [
    {
        headerName: 'Athlete',
        children: [
            {field: 'athlete', headerName: 'Name', minWidth: 170},
            {field: 'age'},
            {field: 'country'},
        ]
    },

    {field: 'year'},
    {field: 'sport'},
    {
        headerName: 'Medals',
        children: [
            {field: 'gold'},
            {field: 'silver'},
            {field: 'bronze'},
            {field: 'total'}
        ]
    }
];

// define some handy keycode constants
var KEY_LEFT = 'ArrowLeft';
var KEY_UP = 'ArrowUp';
var KEY_RIGHT = 'ArrowRight';
var KEY_DOWN = 'ArrowDown';

var gridOptions = {
    rowData: null,
    // make all cols editable
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true,

    },

    navigateToNextCell: this.navigateToNextCell.bind(this),
    tabToNextCell: this.tabToNextCell.bind(this),

    navigateToNextHeader: this.navigateToNextHeader.bind(this),
    tabToNextHeader: this.tabToNextHeader.bind(this),

    columnDefs: columnDefs
};

function navigateToNextHeader(params) {
    var nextHeader = params.nextHeaderPosition;
    var processedNextHeader;

    if (params.key !== 'ArrowDown' && params.key !== 'ArrowUp') {
        return nextHeader;
    }

    processedNextHeader = moveHeaderFocusUpDown(params.previousHeaderPosition, params.headerRowCount, params.key === 'ArrowDown');

    return processedNextHeader === nextHeader ? null : processedNextHeader;

}

function tabToNextHeader(params) {
    return moveHeaderFocusUpDown(params.previousHeaderPosition, params.headerRowCount, params.backwards);
}

function moveHeaderFocusUpDown(previousHeader, headerRowCount, isUp) {
    var previousColumn = previousHeader.column,
        lastRowIndex = previousHeader.headerRowIndex,
        nextRowIndex = isUp ? lastRowIndex - 1 : lastRowIndex + 1,
        nextColumn, parentColumn;

    if (nextRowIndex === -1) {
        return previousHeader;
    }
    if (nextRowIndex === headerRowCount) {
        nextRowIndex = -1;
    }

    parentColumn = previousColumn.getParent();

    if (isUp) {
        nextColumn = parentColumn || previousColumn;
    } else {
        nextColumn = previousColumn.children ? previousColumn.children[0] : previousColumn;
    }

    return {
        headerRowIndex: nextRowIndex,
        column: nextColumn
    };
}

function tabToNextCell(params) {
    var previousCell = params.previousCellPosition,
        lastRowIndex = previousCell.rowIndex,
        nextRowIndex = params.backwards ? lastRowIndex - 1 : lastRowIndex + 1,
        renderedRowCount = gridOptions.api.getModel().getRowCount(),
        result;

    if (nextRowIndex < 0) {
        nextRowIndex = -1;
    }
    if (nextRowIndex >= renderedRowCount) {
        nextRowIndex = renderedRowCount - 1;
    }

    result = {
        rowIndex: nextRowIndex,
        column: previousCell.column,
        floating: previousCell.floating
    };

    return result;
}

function navigateToNextCell(params) {
    var previousCell = params.previousCellPosition,
        suggestedNextCell = params.nextCellPosition,
        nextRowIndex, renderedRowCount;

    switch (params.key) {
        case KEY_DOWN:
            // return the cell above
            nextRowIndex = previousCell.rowIndex - 1;
            if (nextRowIndex < -1) {
                return null;
            } // returning null means don't navigate

            return {rowIndex: nextRowIndex, column: previousCell.column, floating: previousCell.floating};
        case KEY_UP:
            // return the cell below
            nextRowIndex = previousCell.rowIndex + 1;
            renderedRowCount = gridOptions.api.getModel().getRowCount();
            if (nextRowIndex >= renderedRowCount) {
                return null;
            } // returning null means don't navigate

            return {rowIndex: nextRowIndex, column: previousCell.column, floating: previousCell.floating};
        case KEY_LEFT:
        case KEY_RIGHT:
            return suggestedNextCell;
        default:
            throw 'this will never happen, navigation is always one of the 4 keys above';
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => gridOptions.api.setRowData(data));
});
