var columnDefs = [
    {
        headerName: 'Name',
        valueGetter: function(params) {
            return params.data.firstName + ' ' + params.data.lastName;
        },
        valueSetter: function(params) {
            var fullName = params.newValue;
            var nameSplit = fullName.split(' ');
            var newFirstName = nameSplit[0];
            var newLastName = nameSplit[1];
            var data = params.data;

            if (data.firstName !== newFirstName || data.lastName !== newLastName) {
                data.firstName = newFirstName;
                data.lastName = newLastName;
                // return true to tell grid that the value has changed, so it knows
                // to update the cell
                return true;
            } else {
                // return false, the grid doesn't need to update
                return false;
            }
        }
    },
    {
        headerName: "A", field: "a"
    },
    {
        headerName: "B",
        valueGetter: function(params) {
            return params.data.b;
        },
        valueSetter: function(params) {
            if (params.data.b !== params.newValue) {
                params.data.b = parseInt(params.newValue);
                return true;
            } else {
                return false;
            }
        }
    },
    {
        headerName: "C.X",
        valueGetter: function(params) {
            if (params.data.c) {
                return params.data.c.x;
            } else {
                return undefined;
            }
        },
        valueSetter: function(params) {
            if (!params.data.c) {
                params.data.c = {};
            }
            params.data.c.x = params.newValue;
            return true; // we are lazy, always returning true
        }
    },
    {
        headerName: "C.Y",
        valueGetter: function(params) {
            if (params.data.c) {
                return params.data.c.y;
            } else {
                return undefined;
            }
        },
        valueSetter: function(params) {
            if (!params.data.c) {
                params.data.c = {};
            }
            params.data.c.y = params.newValue;
            return true; // we are lazy, always returning true
        }
    }
];

function createRowData() {
    var rowData = [];
    var firstNames = ['Niall', 'John', 'Rob', 'Alberto', 'Bas', 'Dimple', 'Sean'];
    var lastNames = ['Pink', 'Black', 'White', 'Brown', 'Smith', 'Smooth', 'Anderson'];

    for (var i = 0; i < 100; i++) {
        rowData.push({
            a: Math.floor(Math.random() * 100),
            b: Math.floor(Math.random() * 100),
            firstName: firstNames[i % firstNames.length],
            lastName: lastNames[i % lastNames.length]
        });
    }

    return rowData;
}

var gridOptions = {
    defaultColDef: {
        flex: 1,
        resizable: true,
        editable: true
    },
    columnDefs: columnDefs,
    rowData: createRowData(),
    onCellValueChanged: function(event) {
        console.log('Data after change is', event.data);
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
