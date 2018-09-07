var students = [
    {
        first_name: 'Bob', last_name: 'Harrison', gender: 'Male',
        address: '1197 Thunder Wagon Common, Cataract, RI, 02987-1016, US, (401) 747-0763',
        mood: "Happy", country: {name: 'Ireland', code: 'IE'}
    }, {
        first_name: 'Mary', last_name: 'Wilson', gender: 'Female',
        age: 11, address: '3685 Rocky Glade, Showtucket, NU, X1E-9I0, CA, (867) 371-4215',
        mood: "Sad", country: {name: 'Ireland', code: 'IE'}
    }, {
        first_name: 'Sadiq', last_name: 'Khan', gender: 'Male', age: 12,
        address: '3235 High Forest, Glen Campbell, MS, 39035-6845, US, (601) 638-8186',
        mood: "Happy", country: {name: 'Ireland', code: 'IE'}
    }, {
        first_name: 'Jerry', last_name: 'Mane', gender: 'Male', age: 12,
        address: '2234 Sleepy Pony Mall , Drain, DC, 20078-4243, US, (202) 948-3634',
        mood: "Happy", country: {name: 'Ireland', code: 'IE'}
    }
];

// double the array twice, make more data!
students.forEach(function (item) {
    students.push(cloneObject(item));
});
students.forEach(function (item) {
    students.push(cloneObject(item));
});
students.forEach(function (item) {
    students.push(cloneObject(item));
});

function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

var columnDefs = [
    {headerName: "First Name", field: "first_name", width: 100, editable: true},
    {headerName: "Last Name", field: "last_name", width: 100, editable: true},
    {
        headerName: "Gender",
        field: "gender",
        width: 90,
        editable: true,
        cellRenderer: 'genderCellRenderer',
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            cellRenderer: 'genderCellRenderer',
            values: ['Male', 'Female']
        }
    },
    {
        headerName: "Age",
        field: "age",
        width: 70,
        editable: true,
        cellEditor: 'numericCellEditor'
    },
    {
        headerName: "Mood",
        field: "mood",
        width: 70,
        cellRenderer: 'moodCellRenderer',
        cellEditor: 'moodEditor',
        editable: true
    },
    {
        headerName: "Country",
        field: "country",
        width: 100,
        cellRenderer: 'countryCellRenderer',
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            cellRenderer: 'countryCellRenderer',
            values: [
                {name: 'Ireland', code: 'IE'},
                {name: 'UK', code: 'UK'},
                {name: 'France', code: 'FR'}
            ]
        },
        editable: true
    },
    {
        headerName: "Address",
        field: "address",
        width: 502,
        editable: true,
        cellEditor: 'agLargeTextCellEditor',
        cellEditorParams: {
            maxLength: '300',   // override the editor defaults
            cols: '50',
            rows: '6'
        }
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: students,
    onGridReady: function (params) {
        params.api.sizeColumnsToFit();
    },
    onRowEditingStarted: function (event) {
        console.log('never called - not doing row editing');
    },
    onRowEditingStopped: function (event) {
        console.log('never called - not doing row editing');
    },
    onCellEditingStarted: function (event) {
        console.log('cellEditingStarted');
    },
    onCellEditingStopped: function (event) {
        console.log('cellEditingStopped');
    },
    components:{
        genderCellRenderer: GenderCellRenderer,
        numericCellEditor: NumericCellEditor,
        moodCellRenderer: MoodCellRenderer,
        moodEditor: MoodEditor,
        countryCellRenderer: CountryCellRenderer
    }
};

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

// simple function cellRenderer, just returns back the name of the country
function CountryCellRenderer(params) {
    return params.value.name;
}

// function to act as a class
function NumericCellEditor() {
}

// gets called once before the renderer is used
NumericCellEditor.prototype.init = function (params) {
    // create the cell
    this.eInput = document.createElement('input');

    if (isCharNumeric(params.charPress)) {
        this.eInput.value = params.charPress;
    } else {
        if (params.value !== undefined && params.value !== null) {
            this.eInput.value = params.value;
        }
    }

    var that = this;
    this.eInput.addEventListener('keypress', function (event) {
        if (!isKeyPressedNumeric(event)) {
            that.eInput.focus();
            if (event.preventDefault) event.preventDefault();
        } else if (that.isKeyPressedNavigation(event)){
            event.stopPropagation();
        }
    });

    // only start edit if key pressed is a number, not a letter
    var charPressIsNotANumber = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
    this.cancelBeforeStart = charPressIsNotANumber;
};

NumericCellEditor.prototype.isKeyPressedNavigation = function (event){
    return event.keyCode===39
        || event.keyCode===37;
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
    this.eGui = document.createElement('span');
    if (params.value !== "" || params.value !== undefined || params.value !== null) {
        var gender = '<img border="0" width="15" height="10" src="https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/images/' + params.value.toLowerCase() + '.png">';
        this.eGui.innerHTML = gender + ' ' + params.value;
    }
};

GenderCellRenderer.prototype.getGui = function () {
    return this.eGui;
};

function MoodCellRenderer() {
}

MoodCellRenderer.prototype.init = function (params) {
    this.eGui = document.createElement('span');
    if (params.value !== "" || params.value !== undefined || params.value !== null) {
        var imgForMood = params.value === 'Happy' ? 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/images/smiley.png' : 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/images/smiley-sad.png';
        this.eGui.innerHTML = '<img width="20px" src="' + imgForMood + '" />';
    }
};

MoodCellRenderer.prototype.getGui = function () {
    return this.eGui;
};

function MoodEditor() {
    this.defaultImgStyle = 'padding-left:10px; padding-right:10px;  border: 1px solid transparent; padding: 4px;';
    this.selectedImgStyle = 'padding-left:10px; padding-right:10px; border: 1px solid lightgreen; padding: 4px;';
}

MoodEditor.prototype.onKeyDown = function (event) {
    var key = event.which || event.keyCode;
    if (key == 37 ||  // left
        key == 39) {  // right
        this.toggleMood();
        event.stopPropagation();
    }
};

MoodEditor.prototype.toggleMood = function () {
    this.selectMood(this.mood === 'Happy' ? 'Sad' : 'Happy');
};

MoodEditor.prototype.init = function (params) {
    this.container = document.createElement('div');
    this.container.style = "border-radius: 15px; border: 1px solid grey;background: #e6e6e6;padding: 15px; text-align:center;display:inline-block;outline:none";
    this.container.tabIndex = "0";                // to allow the div to capture keypresses

    this.happyImg = document.createElement('img');
    this.happyImg.src = 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/images/smiley.png';
    this.happyImg.style = this.defaultImgStyle;

    this.sadImg = document.createElement('img');
    this.sadImg.src = 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/images/smiley-sad.png';
    this.sadImg.style = this.defaultImgStyle;

    this.container.appendChild(this.happyImg);
    this.container.appendChild(this.sadImg);

    var that = this;
    this.happyImg.addEventListener('click', function (event) {
        that.selectMood('Happy');
        params.stopEditing();
    });
    this.sadImg.addEventListener('click', function (event) {
        that.selectMood('Sad');
        params.stopEditing();
    });
    this.container.addEventListener('keydown', function (event) {
        that.onKeyDown(event)
    });

    this.selectMood(params.value);
};

MoodEditor.prototype.selectMood = function (mood) {
    this.mood = mood;
    this.happyImg.style = (mood === 'Happy') ? this.selectedImgStyle : this.defaultImgStyle;
    this.sadImg.style = (mood === 'Sad') ? this.selectedImgStyle : this.defaultImgStyle;
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

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
