var students = [
    {
        first_name: 'Bob',
        last_name: 'Harrison',
        gender: 'Male',
        age: 12,
        address: '1197 Thunder Wagon Common, Cataract, RI, 02987-1016, US, (401) 747-0763',
        mood: "Happy"
    },
    {
        first_name: 'Mary',
        last_name: 'Wilson',
        gender: 'Female',
        age: 11,
        address: '3685 Rocky Glade, Showtucket, NU, X1E-9I0, CA, (867) 371-4215',
        mood: "Sad"
    },
    {
        first_name: 'Sadiq',
        last_name: 'Khan',
        gender: 'Male',
        age: 12,
        address: '3235 High Forest, Glen Campbell, MS, 39035-6845, US, (601) 638-8186',
        mood: "Happy"
    },
    {
        first_name: 'Jerry',
        last_name: 'Mane',
        gender: 'Male',
        age: 12,
        address: '2234 Sleepy Pony Mall , Drain, DC, 20078-4243, US, (202) 948-3634',
        mood: "Happy"
    }
];

function getCharCodeFromEvent(event) {
    event = event || window.event;
    return (typeof event.which == "undefined") ? event.keyCode : event.which;
}

function isCharNumeric(charStr) {
    return !!/\d/.test(charStr);
}

function isKeyPressedNumeric(event) {
    var charCode = getCharCodeFromEvent(event);
    var charStr = String.fromCharCode(charCode);
    return isCharNumeric(charStr);

}

// function to act as a class
function NumericCellEditor() {
}

// gets called once before the renderer is used
NumericCellEditor.prototype.init = function (params) {
    // create the cell
    this.eInput = document.createElement('input');
    this.eInput.value = isCharNumeric(params.charPress) ? params.charPress : params.value;

    var that = this;
    this.eInput.addEventListener('keypress', function (event) {
        if (!isKeyPressedNumeric(event)) {
            that.eInput.focus();
            if (event.preventDefault) event.preventDefault();
        }
    });

    // only start edit if key pressed is a number, not a letter
    var charPressIsNotANumber = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
    this.cancelBeforeStart = charPressIsNotANumber;
};

// gets called once when grid ready to insert the element
NumericCellEditor.prototype.getGui = function () {
    return this.eInput;
};

// focus and select can be done after the gui is attached
NumericCellEditor.prototype.afterGuiAttached = function () {
    this.eInput.focus();
};

// returns the new value after editing
NumericCellEditor.prototype.isCancelBeforeStart = function () {
    return this.cancelBeforeStart;
};

// example - will reject the number if it contains the value 007
// - not very practical, but demonstrates the method.
NumericCellEditor.prototype.isCancelAfterEnd = function () {
    var value = this.getValue();
    return value.indexOf('007') >= 0;
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
        var gender = '<img border="0" width="15" height="10" src="../images/' + params.value.toLowerCase() + '.png">';
        this.eGui = '<span style="cursor: default;">' + gender + ' ' + params.value + '</span>';
    }
};

GenderCellRenderer.prototype.getGui = function () {
    return this.eGui;
};

function MoodCellRenderer() {
}

MoodCellRenderer.prototype.init = function (params) {
    if (params.value === "" || params.value === undefined || params.value === null) {
        this.eGui = '';
    } else {
        var imgForMood = params.value === 'Happy' ? '../../images/smiley.png' : '../../images/smiley-sad.png';
        this.eGui = '<img src="' + imgForMood + '" />';
    }
};

MoodCellRenderer.prototype.getGui = function () {
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

function MoodEditor() {
}

MoodEditor.prototype.init = function (params) {
    this.mood = params.value;

    this.container = document.createElement('div');
    this.container.style = "border-radius: 15px;background: #e6e6e6;padding: 15px;width: 100px;height: 30px;text-align:center;";

    this.happyImg = document.createElement('img');
    this.happyImg.src = '../../images/smiley.png';
    this.happyImg.style = 'padding-right: 15px;display:inline-block;height: 25px;';

    this.sadImg = document.createElement('img');
    this.sadImg.src = '../../images/smiley-sad.png';
    this.sadImg.style = 'padding-left: 15px;display:inline-block;height: 25px;';

    this.container.appendChild(this.happyImg);
    this.container.appendChild(this.sadImg);

    var that = this;
    this.happyImg.addEventListener('click', function (event) {
        that.mood = 'Happy';
        params.stopEditing();
    });
    this.sadImg.addEventListener('click', function (event) {
        that.mood = 'Sad';
        params.stopEditing();
    });
};

// gets called once when grid ready to insert the element
MoodEditor.prototype.getGui = function () {
    return this.container;
};

MoodEditor.prototype.afterGuiAttached = function () {
    this.container.focus();
};

MoodEditor.prototype.getValue = function () {
    return this.mood;
};

// any cleanup we need to be done here
MoodEditor.prototype.destroy = function () {
};

MoodEditor.prototype.isPopup = function () {
    return true;
};

var columnDefs = [
    {headerName: "First Name", field: "first_name", width: 100, editable: true},
    {headerName: "Last Name", field: "last_name", width: 100, editable: true},
    {
        headerName: "Gender",
        field: "gender",
        width: 90,
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
        width: 70,
        editable: true,
        cellEditor: NumericCellEditor
    },
    {
        headerName: "Mood",
        field: "mood",
        width: 70,
        cellRenderer: MoodCellRenderer,
        cellEditor: MoodEditor,
        editable: true
    },
    {
        headerName: "Address",
        field: "address",
        width: 502,
        editable: true,
        cellEditor: 'largeText'
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
