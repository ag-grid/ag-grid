const createRowData = () => {
    const cloneObject = obj => JSON.parse(JSON.stringify(obj));

    const students = [
        {
            first_name: 'Bob', last_name: 'Harrison', gender: 'Male',
            address: '1197 Thunder Wagon Common, Cataract, RI, 02987-1016, US, (401) 747-0763',
            mood: "Happy", country: 'Ireland'
        }, {
            first_name: 'Mary', last_name: 'Wilson', gender: 'Female',
            age: 11, address: '3685 Rocky Glade, Showtucket, NU, X1E-9I0, CA, (867) 371-4215',
            mood: "Sad", country: 'Ireland'
        }, {
            first_name: 'Zahid', last_name: 'Khan', gender: 'Male', age: 12,
            address: '3235 High Forest, Glen Campbell, MS, 39035-6845, US, (601) 638-8186',
            mood: "Happy", country: 'Ireland'
        }, {
            first_name: 'Jerry', last_name: 'Mane', gender: 'Male', age: 12,
            address: '2234 Sleepy Pony Mall , Drain, DC, 20078-4243, US, (202) 948-3634',
            mood: "Happy", country: 'Ireland'
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

const columnDefs = [
    { field: "first_name", headerName: "First Name", width: 120, editable: true },
    { field: "last_name", headerName: "Last Name", width: 120, editable: true },
    {
        field: "gender",
        width: 100,
        cellEditor: MySimpleEditor
    },
    {
        field: "age",
        width: 80,
        cellEditor: MySimpleEditor
    },
    {
        field: "mood",
        width: 90,
        cellEditor: MySimpleEditor
    },
    {
        field: "country",
        width: 110,
        cellEditor: MySimpleEditor
    },
    {
        field: "address",
        minWidth: 502,
        cellEditor: MySimpleEditor
    }
];

const gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    },
    rowData: createRowData(),
    onGridReady: () => {
        setInterval(() => {
            const instances = gridOptions.api.getCellEditorInstances();
            if (instances.length > 0) {
                const instance = instances[0];
                if (instance.myCustomFunction) {
                    const result = instance.myCustomFunction();
                    console.log(`found editing cell: row index = ${result.rowIndex}, column = ${result.colId}.`);
                } else {
                    console.log('found editing cell, but method myCustomFunction not found, must be the default editor.');
                }
            } else {

                console.log('found not editing cell.');
            }
        }, 1000)
    }

};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});

