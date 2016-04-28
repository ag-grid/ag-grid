var students = [
    {
        first_name: 'Bob',
        last_name: 'Harrison',
        gender: 'Male',
        age: 12,
        address: '1197 Thunder Wagon Common, Cataract, RI, 02987-1016, US, (401) 747-0763'
    },
    {
        first_name: 'Mary',
        last_name: 'Wilson',
        gender: 'Female',
        age: 11,
        address: '3685 Rocky Glade, Showtucket, NU, X1E-9I0, CA, (867) 371-4215'
    },
    {
        first_name: 'Sadiq',
        last_name: 'Khan',
        gender: 'Male',
        age: 12,
        address: '3235 High Forest, Glen Campbell, MS, 39035-6845, US, (601) 638-8186'
    },
    {
        first_name: 'Jerry',
        last_name: 'Mane',
        gender: 'Male',
        age: 12,
        address: '2234 Sleepy Pony Mall , Drain, DC, 20078-4243, US, (202) 948-3634'
    }
];

function getCharCodeFromEvent(event) {
    event = event || window.event;
    return (typeof event.which == "undefined") ? event.keyCode : event.which;
}

function isKeyPressedNumeric(event) {
    var charCode = getCharCodeFromEvent(event);
    var charStr = String.fromCharCode(charCode);
    return !!/\d/.test(charStr);

}

// function to act as a class
function NumericCellEditor() {
}

// gets called once before the renderer is used
NumericCellEditor.prototype.init = function (params) {
    // create the cell
    this.eInput = document.createElement('input');
    this.eInput.value = params.value;

    var that = this;
    this.eInput.addEventListener('keypress', function (event) {
        if (!isKeyPressedNumeric(event)) {
            that.eInput.focus();
            that.eInput.select();
            if (event.preventDefault) event.preventDefault();
        }
    })
};

// gets called once when grid ready to insert the element
NumericCellEditor.prototype.getGui = function () {
    return this.eInput;
};

// focus and select can be done after the gui is attached
NumericCellEditor.prototype.afterGuiAttached = function () {
    this.eInput.focus();
    this.eInput.select();
};

// returns the new value after editing
NumericCellEditor.prototype.getValue = function () {
    return this.eInput.value;
};

// any cleanup we need to be done here
NumericCellEditor.prototype.destroy = function () {
    // but this example is simple, no cleanup, we could  even leave this method out as it's optional
};

// if true, then this editor will appear in a popup 
NumericCellEditor.prototype.isPopup = function () {
    // and we could leave this method out also, false is the default
    return false;
};


function GenderCellRenderer() {
}

GenderCellRenderer.prototype.init = function (params) {
    if (params.value === "" || params.value === undefined || params.value === null) {
        this.eGui = '';
    } else {
        var flag = '<img border="0" width="15" height="10" src="../images/' + params.value.toLowerCase() + '.png">';
        this.eGui = '<span style="cursor: default;">' + flag + ' ' + params.value + '</span>';
    }
};

GenderCellRenderer.prototype.getGui = function () {
    return this.eGui;
};


function LargeTextCellEditor() {
}

LargeTextCellEditor.prototype.init = function (params) {
    this.textarea = document.createElement("textarea");
    this.textarea.maxLength = "200";
    this.textarea.cols = "60";
    this.textarea.rows = "10";
    this.textarea.value = params.value;

    this.eInput = document.createElement("div");
    this.eInput.appendChild(this.textarea);

    // allow arrow keys and enter in the textarea
    // tab, esc etc will still end the editing
    this.textarea.addEventListener('keydown', function (event) {
        var charCode = getCharCodeFromEvent(event);
        if(charCode == 37 ||            // left
                charCode == 38 ||       // up
                charCode == 39 ||       // right
                charCode == 40 ||       // down
                charCode == 13) {       // enter
            event.stopPropagation();
        }
    })
};

// gets called once when grid ready to insert the element
LargeTextCellEditor.prototype.getGui = function () {
    return this.eInput;
};

LargeTextCellEditor.prototype.afterGuiAttached = function () {
    this.textarea.focus();
};

LargeTextCellEditor.prototype.getValue = function () {
    return this.textarea.value;
};

// any cleanup we need to be done here
LargeTextCellEditor.prototype.destroy = function () {
};

LargeTextCellEditor.prototype.isPopup = function () {
    return true;
};

var columnDefs = [
    {headerName: "First Name", field: "first_name", width: 100, editable: true},
    {headerName: "Last Name", field: "last_name", width: 100, editable: true},
    {
        headerName: "Gender",
        field: "gender",
        width: 120,
        editable: true,
        cellRenderer: GenderCellRenderer,
        cellEditor: 'richSelect',
        cellEditorParams: {
            cellRenderer: GenderCellRenderer,
            values: ['Male', 'Female']
        }
    },
    {
        headerName: "Age",
        field: "age",
        width: 110,
        editable: true,
        cellEditor: NumericCellEditor
    },
    {
        headerName: "Address",
        field: "address",
        width: 502,
        editable: true,
        cellEditor: LargeTextCellEditor
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    gridOptions.api.setRowData(students)
});
