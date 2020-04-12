var gridOptions = {
    rowData: [
        {col1: 'A', col2: 'A', col3: 'A', col4: 'A', col5: 'A', col6: 'A'},
        {col1: 'A', col2: 'A', col3: 'A', col4: 'A', col5: 'A', col6: 'A'},
        {col1: 'B', col2: 'B', col3: 'B', col4: 'B', col5: 'B', col6: 'B'},
        {col1: 'B', col2: 'B', col3: 'B', col4: 'B', col5: 'B', col6: 'B'}
    ],
    columnDefs: [
        {field: 'col1'},
        {field: 'col2', filterParams: {suppressSyncValuesAfterDataChange: true, suppressRemoveEntries: true, newRowsAction: 'keep'}},
        {field: 'col3', filterParams: {suppressSyncValuesAfterDataChange: true, suppressRemoveEntries: true, newRowsAction: 'keep'}},
        {field: 'col4', filterParams: {suppressSyncValuesAfterDataChange: true, suppressRemoveEntries: true, newRowsAction: 'keep'}},
        {field: 'col5', filterParams: {suppressSyncValuesAfterDataChange: true, suppressRemoveEntries: true, newRowsAction: 'keep'}}
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 140,
        filter: true,
        editable: true,
        resizable: true,
    },
    sideBar: {
        toolPanels: ['filters']
    },
    sideBar: ['filters'],
    onCellValueChanged: onCellValueChanged,
    onGridReady: function(params) {
        // initialise all the filters - as this example demonstrates
        // changing data AFTER the filter is initialised
        // params.api.getFilterInstance('col1');
        // params.api.getFilterInstance('col2');
        // params.api.getFilterInstance('col3');
        // params.api.getFilterInstance('col4');
        // params.api.getFilterInstance('col5');

        params.api.getToolPanelInstance('filters').expandFilters(['col3']);

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
    var newRow = {col1: 'C', col2: 'C', col3: 'C', col4: 'C', col5: 'C'};
    gridOptions.api.updateRowData({
        add: [newRow]
    });
    // get col4 and col5 to refresh only, means col2 and col3 are missing 'C'.
    // col1 refreshes automatically
    gridOptions.api.getFilterInstance('col4').resetFilterValues();
    gridOptions.api.getFilterInstance('col5').resetFilterValues();
    // get the grid to run filtering again, otherwise rows could be missing due
    // to the previous filter state
    gridOptions.api.onFilterChanged();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
