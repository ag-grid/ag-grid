var options = ['A', 'B', 'C', 'D', 'E'];
var valuesArrayCount = 0;
var valuesArray = [];

function updateValuesArray() {
    valuesArray.length = 0;

    options.forEach(function(o) {
        valuesArray.push(o + valuesArrayCount);
        valuesArray.push(o + (valuesArrayCount + 1));
    });

    valuesArrayCount = (valuesArrayCount + 1) % 10;
}

var valuesCallbackCount = 0;
var valuesCallback = function(params) {
    console.log('Called values callback');

    var values = [];
    options.forEach(function(o) {
        values.push(o + valuesCallbackCount);
        values.push(o + (valuesCallbackCount + 1));
    });

    valuesCallbackCount = (valuesCallbackCount + 1) % 10;

    params.success(values);
};

var gridOptions = {
    columnDefs: [
        {
            colId: 'array',
            headerName: 'Values Array',
            field: 'code',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: valuesArray
            }
        },
        {
            colId: 'callback',
            headerName: 'Values Callback',
            field: 'code',
            filter: 'agSetColumnFilter',
            filterParams: {
                values: valuesCallback,
            }
        },
    ],
    defaultColDef: {
        flex: 1,
        filter: true,
        resizable: true,
    },
    sideBar: 'filters',
    rowData: getRowData(),
    onFirstDataRendered: onFirstDataRendered,
    onFilterOpened: onFilterOpened
};

function getRowData() {
    var rows = [];

    for (var i = 0; i < 2000; i++) {
        var index = Math.floor(Math.random() * 5);
        rows.push({ code: options[index] + i % 10 });
    }

    return rows;
}

function onFirstDataRendered(params) {
    updateValuesArray();

    params.api.getToolPanelInstance('filters').expandFilters();
}

function onFilterOpened(params) {
    if (params.column.colId === 'callback' && params.source === 'COLUMN_MENU') {
        refreshCallbackValues();
    }
}

function refreshArrayValues() {
    console.log('Refreshing array values');
    updateValuesArray();
    var filter = gridOptions.api.getFilterInstance('array');
    filter.refreshFilterValues();
}

function refreshCallbackValues() {
    console.log('Refreshing callback values');
    var filter = gridOptions.api.getFilterInstance('callback');
    filter.refreshFilterValues();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
