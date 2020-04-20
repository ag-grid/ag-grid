var gridOptions = {
    rowData: [
        { col1: 'A' },
        { col1: 'A' },
        { col1: 'B' },
        { col1: 'C' },
    ],
    columnDefs: [
        { field: 'col1' },
        { field: 'col1', filterParams: {newRowsAction: 'keep'} },
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

function setNewData() {
    var newData = [
        { col1: 'A' },
        { col1: 'A' },
        { col1: 'B' },
        { col1: 'C' },
        { col1: 'D' },
        { col1: 'E' },
    ];
    gridOptions.api.setRowData(newData);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
