var gridOptions = {
    rowData: [
        { col1: 'A', col2: 'A' },
        { col1: 'A', col2: 'B' },
        { col1: 'B', col2: 'B' },
        { col1: 'C', col2: 'D' },
    ],
    columnDefs: [
        { headerName: 'Col 1 (Default Behaviour)', field: 'col1' },
        {
            headerName: 'Col 2 (Suppress Sync with Data)',  field: 'col2',
            filterParams: {
                suppressSyncValuesAfterDataChange: true,
                // suppressRemoveEntries: true,
                // values: ['A', 'B', 'J'],
                // newRowsAction: 'keep'
            },
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 200,
        filter: true,
        editable: true,
        resizable: true,
    },
    sideBar: ['filters'],
    onFirstDataRendered: function(params) {
        params.api.getToolPanelInstance('filters').expandFilters();
    },
};

function addRow() {
    var newRow = { col1: 'E', col2: 'E'};
    gridOptions.api.updateRowData({add: [newRow]});
}

function updateRow() {
    var firstRowData = gridOptions.api.getDisplayedRowAtIndex(0).data;

    firstRowData['col1'] = 'E';
    firstRowData['col2'] = 'E';

    gridOptions.api.updateRowData({update: [firstRowData]});
}

function setNewData() {
    var newData = [
        { col1: 'F', col2: 'F'},
        { col1: 'G', col2: 'G' },
    ];
    gridOptions.api.setRowData(newData);
}

function resetFilterValues() {
    gridOptions.api.getFilterInstance('col1').resetFilterValues();
    gridOptions.api.getFilterInstance('col2').resetFilterValues();
}

function selectEverything() {
    gridOptions.api.getFilterInstance('col1').selectEverything();
    gridOptions.api.getFilterInstance('col2').selectEverything();
}

function triggerFiltering() {
    gridOptions.api.onFilterChanged();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
