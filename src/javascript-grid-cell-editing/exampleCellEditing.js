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
        editable: true
    },
    {
        headerName: "Age",
        field: "age",
        width: 70,
        editable: true
    },
    {
        headerName: "Mood",
        field: "mood",
        width: 70,
        editable: true
    },
    {
        headerName: "Country",
        field: "country",
        width: 100,
        editable: true
    },
    {
        headerName: "Address",
        field: "address",
        width: 502,
        editable: true,
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
    }
};

function onBtStopEditing() {
    gridOptions.api.stopEditing();
}

function onBtStartEditing(key, char) {
    gridOptions.api.setFocusedCell(0, 'address');

    gridOptions.api.startEditingCell({
        rowIndex: 0,
        colKey: 'address',
        keyPress: key,
        charPress: char
    });
}

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

function onBtNextCell() {
    gridOptions.api.tabToNextCell();
}

function onBtPreviousCell() {
    gridOptions.api.tabToPreviousCell();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
