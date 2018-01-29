var rowData = [
    {col1: 'A', col2: 'A', col3: 'A', col4: 'A'},
    {col1: 'B', col2: 'B', col3: 'B', col4: 'B'},
    {col1: 'A', col2: 'A', col3: 'A', col4: 'A'},
    {col1: 'B', col2: 'B', col3: 'B', col4: 'B'}
];

var columnDefs = [{field: 'col1'}, {field: 'col2'}, {field: 'col3'}, {field: 'col4'}];

var gridOptions = {
    defaultColDef: {
        editable: true
    },
    columnDefs: columnDefs,
    rowData: rowData,
    enableFilter: true,
    enableColResize: true,
    onCellValueChanged: onCellValueChanged,
    onGridReady: function(params) {
        // initialise all the filters - as this example demonstrates
        // changing data AFTER the filter is initialised
        params.api.getFilterInstance('col1');
        params.api.getFilterInstance('col2');
        params.api.getFilterInstance('col3');
        params.api.getFilterInstance('col4');
    }
};

function onCellValueChanged(params) {
        var col = params.column;
        switch (col.getId()) {
            case 'col2':
                refreshCol2(params.api);
                break;
            case 'col3':
                refreshCol3(params.api, params.newValue);
                break;
            case 'col4':
                refreshCol4(params.api, params.newValue);
                break;
        }
}

// simple refresh of filter - the value state will be incorrect
function refreshCol2(api) {
    var filter = api.getFilterInstance('col2');
    filter.resetFilterValues();
}

// refresh the filter, but also restore the model to the
// state before the refresh of the values
function refreshCol3(api, newValue) {
    var filter = api.getFilterInstance('col3');
    var model = filter.getModel();
    filter.resetFilterValues();
    var filterWasActive = model !== null;
    if (filterWasActive) {
        model.push(newValue);
        filter.setModel(model);
    }
}

function refreshCol4(api, newValue) {
    var filter = api.getFilterInstance('col4');
    var model = filter.getModel();
    filter.resetFilterValues();
    var filterWasActive = model !== null;
    if (filterWasActive) {
        model.push(newValue);
        filter.setModel(model);
        api.onFilterChanged();
    }
}

function onAddRow() {
    var newRow = {col1: 'C', col2: 'C', col3: 'C', col4: 'C'};
    gridOptions.api.updateRowData({
        add: [newRow]
    });
    // get col3 and col4 to refresh only, means col1 and col2 are missing 'C'
    gridOptions.api.getFilterInstance('col3').resetFilterValues();
    gridOptions.api.getFilterInstance('col4').resetFilterValues();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
