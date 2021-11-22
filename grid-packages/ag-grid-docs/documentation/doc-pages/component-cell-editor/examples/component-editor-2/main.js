const getCharCodeFromEvent = event => {
    event = event || window.event;
    return (typeof event.which == "undefined") ? event.keyCode : event.which;
};

const isCharNumeric = charStr => !!/\d/.test(charStr);

const isKeyPressedNumeric = event => {
    const charCode = getCharCodeFromEvent(event);
    const charStr = String.fromCharCode(charCode);
    return isCharNumeric(charStr);
};

const createRowData = () => {
    const cloneObject = obj => JSON.parse(JSON.stringify(obj));

    const students = [
        {
            first_name: 'Bob', last_name: 'Harrison', gender: 'Male',
            address: '1197 Thunder Wagon Common, Cataract, RI, 02987-1016, US, (401) 747-0763',
            mood: "Happy", country: { name: 'Ireland', code: 'IE' }
        }, {
            first_name: 'Mary', last_name: 'Wilson', gender: 'Female',
            age: 11, address: '3685 Rocky Glade, Showtucket, NU, X1E-9I0, CA, (867) 371-4215',
            mood: "Sad", country: { name: 'Ireland', code: 'IE' }
        }, {
            first_name: 'Zahid', last_name: 'Khan', gender: 'Male', age: 12,
            address: '3235 High Forest, Glen Campbell, MS, 39035-6845, US, (601) 638-8186',
            mood: "Happy", country: { name: 'Ireland', code: 'IE' }
        }, {
            first_name: 'Jerry', last_name: 'Mane', gender: 'Male', age: 12,
            address: '2234 Sleepy Pony Mall , Drain, DC, 20078-4243, US, (202) 948-3634',
            mood: "Happy", country: { name: 'Ireland', code: 'IE' }
        }
    ];

    // double the array twice, make more data!
    students.forEach(item => {
        students.push(cloneObject(item));
    });
    students.forEach(item => {
        students.push(cloneObject(item));
    });
    students.forEach(item => {
        students.push(cloneObject(item));
    });

    return students;
}

const countryCellRenderer = params => params.value.name;

const columnDefs = [
    { field: "first_name", headerName: "First Name", width: 120, editable: true },
    { field: "last_name", headerName: "Last Name", width: 120, editable: true },
    {
        field: "gender",
        width: 100,
        editable: true,
        cellRenderer: 'genderCellRenderer',
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            cellRenderer: 'genderCellRenderer',
            values: ['Male', 'Female']
        }
    },
    {
        field: "age",
        width: 80,
        editable: true,
        cellEditor: 'numericCellEditor'
    },
    {
        field: "mood",
        width: 100,
        cellRenderer: 'moodCellRenderer',
        cellEditor: 'moodEditor',
        editable: true
    },
    {
        field: "country",
        width: 110,
        cellEditor: 'agRichSelectCellEditor',
        cellRenderer: countryCellRenderer,
        keyCreator: function (country) { return country.name },
        cellEditorParams: {
            cellRenderer: countryCellRenderer,
            values: [
                { name: 'Ireland', code: 'IE' },
                { name: 'UK', code: 'UK' },
                { name: 'France', code: 'FR' }
            ]
        },
        editable: true
    },
    {
        field: "address",
        editable: true,
        cellEditor: 'agLargeTextCellEditor',
        cellEditorParams: {
            maxLength: '300',   // override the editor defaults
            cols: '50',
            rows: '6'
        }
    }
];

const gridOptions = {
    columnDefs: columnDefs,
    rowData: createRowData(),
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    },
    onRowEditingStarted: event => {
        console.log('never called - not doing row editing');
    },
    onRowEditingStopped: event => {
        console.log('never called - not doing row editing');
    },
    onCellEditingStarted: event => {
        console.log('cellEditingStarted');
    },
    onCellEditingStopped: event => {
        console.log('cellEditingStopped');
    },
    components: {
        genderCellRenderer: GenderRenderer,
        numericCellEditor: NumericEditor,
        moodCellRenderer: MoodRenderer,
        moodEditor: MoodEditor
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
