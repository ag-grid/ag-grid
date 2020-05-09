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
                refreshValuesOnOpen: true
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
};

function onFirstDataRendered(params) {
    updateValuesArray();

    params.api.getToolPanelInstance('filters').expandFilters();
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
