var columnDefs = [
    { field: 'firstName', width: 100},
    { field: 'lastName', width: 100},
    { field: 'gender', width: 90},
    { field: 'age', width: 70},
    { field: 'mood', width: 70},
    { field: 'country', width: 100},
    { field: 'address', width: 200}
];

var pinnedTopData = [
    { firstName: '##', lastName: '##', gender: '##', address: '##', mood: '##', country: '##'}
];
var pinnedBottomData = [
    { firstName: '##', lastName: '##', gender: '##', address: '##', mood: '##', country: '##'}
];


var gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    enableColResize: true,
    pinnedTopRowData: pinnedTopData,
    pinnedBottomRowData: pinnedBottomData,
    defaultColDef: {
        editable: true
    },
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    },
    onRowEditingStarted: function(event) {
        console.log('never called - not doing row editing');
    },
    onRowEditingStopped: function(event) {
        console.log('never called - not doing row editing');
    },
    onCellEditingStarted: function(event) {
        console.log('cellEditingStarted');
    },
    onCellEditingStopped: function(event) {
        console.log('cellEditingStopped');
    }
};

function onBtStopEditing() {
    gridOptions.api.stopEditing();
}

function onBtStartEditing(key, char, pinned) {
    gridOptions.api.setFocusedCell(0, 'lastLame', pinned);

    gridOptions.api.startEditingCell({
        rowIndex: 0,
        colKey: 'lastName',
        // set to 'top', 'bottom' or undefined
        rowPinned: pinned,
        keyPress: key,
        charPress: char
    });
}

function getCharCodeFromEvent(event) {
    event = event || window.event;
    return typeof event.which === 'undefined' ? event.keyCode : event.which;
}

function isCharNumeric(charStr) {
    return !!/\d/.test(charStr);
}

function isKeyPressedNumeric(event) {
    var charCode = getCharCodeFromEvent(event);
    var charStr = String.fromCharCode(charCode);
    return isCharNumeric(charStr);
}

function onBtNextCell() {
    gridOptions.api.tabToNextCell();
}

function onBtPreviousCell() {
    gridOptions.api.tabToPreviousCell();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
