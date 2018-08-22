var columnDefs = [
    {
        headerName: 'Athlete',
        field: 'athlete',
        width: 150,
        filterParams: {newRowsAction: 'keep'},
        checkboxSelection: function(params) {
            // we put checkbox on the name if we are not doing grouping
            return params.columnApi.getRowGroupColumns().length === 0;
        },
        headerCheckboxSelection: function(params) {
            // we put checkbox on the name if we are not doing grouping
            return params.columnApi.getRowGroupColumns().length === 0;
        }
    },
    {headerName: 'Age', field: 'age', width: 90, filterParams: {newRowsAction: 'keep'}},
    {headerName: 'Country', field: 'country', width: 120, filterParams: {newRowsAction: 'keep'}},
    {headerName: 'Year', field: 'year', width: 90, filterParams: {newRowsAction: 'keep'}},
    {headerName: 'Date', field: 'date', width: 110, filterParams: {newRowsAction: 'keep'}},
    {headerName: 'Sport', field: 'sport', width: 110, filterParams: {newRowsAction: 'keep'}},
    {headerName: 'Gold', field: 'gold', width: 100, filterParams: {newRowsAction: 'keep'}},
    {headerName: 'Silver', field: 'silver', width: 100, filterParams: {newRowsAction: 'keep'}},
    {headerName: 'Bronze', field: 'bronze', width: 100, filterParams: {newRowsAction: 'keep'}},
    {headerName: 'Total', field: 'total', width: 100, filterParams: {newRowsAction: 'keep'}}
];

var autoGroupColumnDef = {
    headerName: 'Group',
    width: 200,
    field: 'athlete',
    valueGetter: function(params) {
        if (params.node.group) {
            return params.node.key;
        } else {
            return params.data[params.colDef.field];
        }
    },
    headerCheckboxSelection: true,
    // headerCheckboxSelectionFilteredOnly: true,
    cellRenderer:'agGroupCellRenderer',
    cellRendererParams: {
        checkbox: true
    }
};

var gridOptions = {
    enableSorting: true,
    enableFilter: true,
    suppressRowClickSelection: true,
    groupSelectsChildren: true,
    debug: true,
    rowSelection: 'multiple',
    enableColResize: true,
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    enableRangeSelection: true,
    columnDefs: columnDefs,
    pagination: true,
    paginationPageSize: 10,
    autoGroupColumnDef: autoGroupColumnDef,
    paginationNumberFormatter: function(params) {
        return '[' + params.value.toLocaleString() + ']';
    },
    defaultColDef: {
        editable: true,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true
    }
};

function onPageSizeChanged(newPageSize) {
    var value = document.getElementById('page-size').value;
    gridOptions.api.paginationSetPageSize(Number(value));
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
        gridOptions.api.paginationGoToPage(4);
    });
});
