var gridOptions = {
    columnDefs: [
        { field: 'a' },
        { field: 'b' },
        { field: 'c' },
        { field: 'd' },
        { field: 'e' },
        { field: 'f' },
        { field: 'g' },
        { field: 'h' },
    ],
    defaultColDef: {
        flex: 1,
        editable: true,
    },
    rowData: getRows(),
    enableRangeSelection: true,
    enableFillHandle: true,
    undoRedoCellEditing: true,
    undoRedoCellEditingLimit: 5,
    enableCellChangeFlash: true,
    onFirstDataRendered: onFirstDataRendered,
    onCellValueChanged: onCellValueChanged
};

function undo() {
    gridOptions.api.undoCellEditing();
}

function redo() {
    gridOptions.api.redoCellEditing();
}

function onFirstDataRendered() {
    setValue('#undoInput', 0);
    disable('#undoInput', true);
    disable('#undoBtn', true);

    setValue('#redoInput', 0);
    disable('#redoInput', true);
    disable('#redoBtn', true);
}

function onCellValueChanged(params) {
    var undoSize = params.api.getCurrentUndoSize();
    setValue('#undoInput', undoSize);
    disable('#undoBtn', undoSize < 1);

    var redoSize = params.api.getCurrentRedoSize();
    setValue('#redoInput', redoSize);
    disable('#redoBtn', redoSize < 1);
}

function disable(id, disabled) {
    document.querySelector(id).disabled = disabled;
}

function setValue(id, value) {
    document.querySelector(id).value = value;
}

function getRows() {
    return Array.apply(null, Array(100)).map(function (_, i) {
        return {
            a: 'a-' + i, b: 'b-' + i, c: 'c-' + i, d: 'd-' + i,
            e: 'e-' + i, f: 'f-' + i, g: 'g-' + i, h: 'h-' + i
        }
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
