var rowData = [
    {col1: 'A', col2: 'A', col3: 'A', col4: 'A', col5: 'A', col6: 'A'},
    {col1: 'A', col2: 'A', col3: 'A', col4: 'A', col5: 'A', col6: 'A'},
    {col1: 'B', col2: 'B', col3: 'B', col4: 'B', col5: 'B', col6: 'B'},
    {col1: 'B', col2: 'B', col3: 'B', col4: 'B', col5: 'B', col6: 'B'}
];

var columnDefs = [
    {field: 'col1'},
    {field: 'col2', filterParams: {syncValuesLikeExcel: true}},
    {field: 'col3'},
    {field: 'col4'},
    {field: 'col5'},
    {field: 'col6'}
];

var gridOptions = {
    defaultColDef: {
        editable: true,
        resizable: true,
        filter: true,
        width: 100
    },
    columnDefs: columnDefs,
    rowData: rowData,
    sideBar: {
        toolPanels: ['filters'],
        defaultToolPanel: 'filters'
    },
    onCellValueChanged: onCellValueChanged,
    onGridReady: function(params) {
        // initialise all the filters - as this example demonstrates
        // changing data AFTER the filter is initialised
        params.api.getFilterInstance('col1');
        params.api.getFilterInstance('col2');
        params.api.getFilterInstance('col3');
        params.api.getFilterInstance('col4');
        params.api.getFilterInstance('col5');
        params.api.getFilterInstance('col6');
    }
};

function onCellValueChanged(params) {
        var col = params.column;
        switch (col.getId()) {
            case 'col3':
                refreshCol3(params.api);
                break;
            case 'col4':
                refreshCol4(params.api, params.newValue);
                break;
            case 'col5':
                refreshCol5(params.api, params.newValue);
                break;
            case 'col5':
                refreshCol6(params.api, params.newValue);
                break;
        }
}

// simple refresh of filter - the value state will be incorrect
function refreshCol3(api) {
    var filter = api.getFilterInstance('col3');
    filter.resetFilterValues();
}

// refresh the filter, but also restore the model to the
// state before the refresh of the values
function refreshCol4(api, newValue) {
    var filter = api.getFilterInstance('col4');
    var model = filter.getModel();
    filter.resetFilterValues();
    var filterWasActive = model !== null;
    if (filterWasActive) {
        if (model && model.values.indexOf(newValue)<0) {
            model.values.push(newValue);
        }
        filter.setModel(model);
    }
}

function refreshCol5(api, newValue) {
    var filter = api.getFilterInstance('col5');
    var model = filter.getModel();
    filter.resetFilterValues();
    var filterWasActive = model !== null;
    if (filterWasActive) {
        if (model && model.values.indexOf(newValue)<0) {
            model.values.push(newValue);
        }
        filter.setModel(model);
        api.onFilterChanged();
    }
}

function onAddRow() {
    var newRow = {col1: 'C', col2: 'C', col3: 'C', col4: 'C', col5: 'C', col6: 'C'};
    gridOptions.api.updateRowData({
        add: [newRow]
    });
    // get col3 and col4 to refresh only, means col1 and col2 are missing 'C'
    gridOptions.api.getFilterInstance('col4').resetFilterValues();
    gridOptions.api.getFilterInstance('col5').resetFilterValues();
    gridOptions.api.getFilterInstance('col6').resetFilterValues();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
