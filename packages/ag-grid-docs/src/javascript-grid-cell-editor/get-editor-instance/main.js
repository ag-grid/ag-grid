var students = [
    {
        first_name: 'Bob', last_name: 'Harrison', gender: 'Male',
        address: '1197 Thunder Wagon Common, Cataract, RI, 02987-1016, US, (401) 747-0763',
        mood: "Happy", country: 'Ireland'
    }, {
        first_name: 'Mary', last_name: 'Wilson', gender: 'Female',
        age: 11, address: '3685 Rocky Glade, Showtucket, NU, X1E-9I0, CA, (867) 371-4215',
        mood: "Sad", country: 'Ireland'
    }, {
        first_name: 'Sadiq', last_name: 'Khan', gender: 'Male', age: 12,
        address: '3235 High Forest, Glen Campbell, MS, 39035-6845, US, (601) 638-8186',
        mood: "Happy", country: 'Ireland'
    }, {
        first_name: 'Jerry', last_name: 'Mane', gender: 'Male', age: 12,
        address: '2234 Sleepy Pony Mall , Drain, DC, 20078-4243, US, (202) 948-3634',
        mood: "Happy", country: 'Ireland'
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
        cellEditor: 'mySimpleCellEditor'
    },
    {
        headerName: "Age",
        field: "age",
        width: 70,
        cellEditor: 'mySimpleCellEditor'
    },
    {
        headerName: "Mood",
        field: "mood",
        width: 70,
        cellEditor: 'mySimpleCellEditor'
    },
    {
        headerName: "Country",
        field: "country",
        width: 100,
        cellEditor: 'mySimpleCellEditor'
    },
    {
        headerName: "Address",
        field: "address",
        width: 502,
        cellEditor: 'mySimpleCellEditor'
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        editable: true
    },
    rowData: students,
    components:{
        mySimpleCellEditor: MySimpleCellEditor
    }
};


let KEY_BACKSPACE = 8;
let KEY_F2 = 113;
let KEY_DELETE = 46;


function MySimpleCellEditor() {}

MySimpleCellEditor.prototype.init = function(params) {
    this.gui = document.createElement('input');
    this.gui.type = 'text';
    this.gui.classList.add('my-simple-editor');

    this.params = params;

    var startValue;

    let keyPressBackspaceOrDelete =
        params.keyPress === KEY_BACKSPACE
        || params.keyPress === KEY_DELETE;

    if (keyPressBackspaceOrDelete) {
        startValue = '';
    } else if (params.charPress) {
        startValue = params.charPress;
    } else {
        startValue = params.value;
        if (params.keyPress !== KEY_F2) {
            this.highlightAllOnFocus = true;
        }
    }

    if (startValue!==null && startValue!==undefined) {
        this.gui.value = startValue;
    }
};

MySimpleCellEditor.prototype.getGui = function() {
    return this.gui;
};

MySimpleCellEditor.prototype.getValue = function() {
    return this.gui.value;
};

MySimpleCellEditor.prototype.afterGuiAttached = function() {
    this.gui.focus();
};

MySimpleCellEditor.prototype.myCustomFunction = function() {
    return {
        rowIndex: this.params.rowIndex,
        colId: this.params.column.getId()
    };
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});

setInterval( function(){
    var instances = gridOptions.api.getCellEditorInstances();
    if (instances.length>0) {
        var instance = instances[0];
        if (instance.myCustomFunction) {
            var result = instance.myCustomFunction();
            console.log('found editing cell: row index = ' + result.rowIndex + ', column = ' + result.colId + '.');
        } else {
            console.log('found editing cell, but method myCustomFunction not found, must be the default editor.');
        }
    } else {
        console.log('found not editing cell.');
    }
}, 1000);
