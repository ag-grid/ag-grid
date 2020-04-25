var gridOptions = {
    columnDefs: [
        {
            headerName: 'Set Filter Column',
            field: 'col1',
            filter: 'agSetColumnFilter',
            filterParams: {
                newRowsAction: 'keep'
            },
            flex: 1,
            editable: true
        }
    ],
    sideBar: 'filters',
    rowData: getRowData(),
    onFirstDataRendered: onFirstDataRendered,
};

function getRowData() {
    return [
        { col1: 'A' },
        { col1: 'A' },
        { col1: 'B' },
        { col1: 'C' },
    ];
}

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

function reset() {
    gridOptions.api.setFilterModel([]);
    gridOptions.api.setRowData(getRowData());
}

function onFirstDataRendered(params) {
    params.api.getToolPanelInstance('filters').expandFilters();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
