var gridOptions = {
    rowData: getRowData(),
    columnDefs: [
        {
            headerName: 'Set Filter Column',
            field: 'col1',
            filter: 'agSetColumnFilter',
            editable: true,
            flex: 1
        }
    ],
    sideBar: ['filters'],
    onGridReady: function(params) {
        params.api.getToolPanelInstance('filters').expandFilters();
    },
};

function getRowData() {
    return [
        { col1: 'A' },
        { col1: 'A' },
        { col1: 'B' },
        { col1: 'B' },
        { col1: 'C' },
        { col1: 'C' },
    ];
}

function updateFirstRow() {
    var firstRowData = gridOptions.api.getDisplayedRowAtIndex(0).data;
    firstRowData['col1'] += 'X';
    gridOptions.api.updateRowData({update: [firstRowData]});
}

function addDRow() {
    gridOptions.api.updateRowData({add: [{ col1: 'D'}]});
}

function reset() {
    gridOptions.api.setRowData(getRowData());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
