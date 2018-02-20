// this example has items declared globally. bad javascript. but keeps the example simple.

var columnDefs = [
    {
        headerName: 'Make',
        field: 'make',
        editable: true,
        cellEditor:'agSelectCellEditor',
        cellEditorParams: {
            values: ['AAA', 'BBB', 'CCC']
        }
    },
    {headerName: 'Model', field: 'model', editable: true},
    {headerName: 'Price', field: 'price', editable: true, cellEditor: 'numericCellEditor'},
    {headerName: 'Suppress Navigable', field: 'field5', editable: true, suppressNavigable: true},
    {headerName: 'Not Editable', field: 'field6', editable: false}
];

function getRowData() {
    var rowData = [];
    for (var i = 0; i < 10; i++) {
        rowData.push({make: 'Toyota', model: 'Celica', price: 35000 + i * 1000, field5: 'Sample 22', field6: 'Sample 23'});
        rowData.push({make: 'Ford', model: 'Mondeo', price: 32000 + i * 1000, field5: 'Sample 24', field6: 'Sample 25'});
        rowData.push({make: 'Porsche', model: 'Boxter', price: 72000 + i * 1000, field5: 'Sample 26', field6: 'Sample 27'});
    }

    return rowData;
}

var gridOptions = {
    components:{
        numericCellEditor: getNumericCellEditor()
    },
    columnDefs: columnDefs,
    rowData: getRowData(),
    editType: 'fullRow',
    onCellValueChanged: function(event) {
        console.log('onCellValueChanged: ' + event.colDef.field + ' = ' + event.newValue);
    },
    onRowValueChanged: function(event) {
        var data = event.data;
        console.log('onRowValueChanged: (' + data.make + ', ' + data.model + ', ' + data.price + ')');
    }
};

function onBtStopEditing() {
    gridOptions.api.stopEditing();
}

function onBtStartEditing() {
    gridOptions.api.setFocusedCell(2, 'make');
    gridOptions.api.startEditingCell({
        rowIndex: 2,
        colKey: 'make'
    });
}

function getNumericCellEditor() {
    function isCharNumeric(charStr) {
        return !!/\d/.test(charStr);
    }

    function isKeyPressedNumeric(event) {
        var charCode = getCharCodeFromEvent(event);
        var charStr = String.fromCharCode(charCode);
        return isCharNumeric(charStr);
    }

    function getCharCodeFromEvent(event) {
        event = event || window.event;
        return typeof event.which === 'undefined' ? event.keyCode : event.which;
    }

    // function to act as a class
    function NumericCellEditor() {}

    // gets called once before the renderer is used
    NumericCellEditor.prototype.init = function(params) {
        // we only want to highlight this cell if it started the edit, it is possible
        // another cell in this row started teh edit
        this.focusAfterAttached = params.cellStartedEdit;

        // create the cell
        this.eInput = document.createElement('input');
        this.eInput.style.width = '100%';
        this.eInput.style.height = '100%';
        this.eInput.value = isCharNumeric(params.charPress) ? params.charPress : params.value;

        var that = this;
        this.eInput.addEventListener('keypress', function(event) {
            if (!isKeyPressedNumeric(event)) {
                that.eInput.focus();
                if (event.preventDefault) event.preventDefault();
            }
        });
    };

    // gets called once when grid ready to insert the element
    NumericCellEditor.prototype.getGui = function() {
        return this.eInput;
    };

    // focus and select can be done after the gui is attached
    NumericCellEditor.prototype.afterGuiAttached = function() {
        // only focus after attached if this cell started the edit
        if (this.focusAfterAttached) {
            this.eInput.focus();
            this.eInput.select();
        }
    };

    // returns the new value after editing
    NumericCellEditor.prototype.isCancelBeforeStart = function() {
        return this.cancelBeforeStart;
    };

    // example - will reject the number if it contains the value 007
    // - not very practical, but demonstrates the method.
    NumericCellEditor.prototype.isCancelAfterEnd = function() {};

    // returns the new value after editing
    NumericCellEditor.prototype.getValue = function() {
        return this.eInput.value;
    };

    // when we tab onto this editor, we want to focus the contents
    NumericCellEditor.prototype.focusIn = function() {
        var eInput = this.getGui();
        eInput.focus();
        eInput.select();
        console.log('NumericCellEditor.focusIn()');
    };

    // when we tab out of the editor, this gets called
    NumericCellEditor.prototype.focusOut = function() {
        // but we don't care, we just want to print it for demo purposes
        console.log('NumericCellEditor.focusOut()');
    };

    return NumericCellEditor;
}
// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function() {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);
    gridOptions.api.sizeColumnsToFit();
});
