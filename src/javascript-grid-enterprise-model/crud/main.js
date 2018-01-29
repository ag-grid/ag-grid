var columnDefs = [
    {field: "athlete", width: 150},
    {field: "age"},
    {field: "country", width: 150},
    {field: "year"},
    {field: "sport"},
    {field: "gold"},
    {field: "silver"},
    {field: "bronze"}
];

var gridOptions = {
    defaultColDef: {
        width: 100,
        suppressFilter: true
    },
    rowSelection: 'single',
    columnDefs: columnDefs,
    enableColResize: true,
    rowModelType: 'enterprise',
    icons: {
        groupLoading: '<img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/javascript-grid-enterprise-model/spinner.gif" style="width:22px;height:22px;">'
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinners.json'}).then(function(data) {
        rowDataServerSide = data;
        var datasource = new MyDatasource();
        gridOptions.api.setEnterpriseDatasource(datasource);
    });
});

var newItemCount = 0;

function onBtRemove() {
    var selectedRows = gridOptions.api.getSelectedNodes();
    if (!selectedRows || selectedRows.length === 0) { return; }

    var selectedRow = selectedRows[0];

    rowDataServerSide.splice(selectedRow.rowIndex, 1);

    gridOptions.api.purgeEnterpriseCache();
}

function onBtAdd() {

    var selectedRows = gridOptions.api.getSelectedNodes();
    if (!selectedRows || selectedRows.length === 0) { return; }

    var selectedRow = selectedRows[0];

    // insert new row in the source data, at the top of the page
    rowDataServerSide.splice(selectedRow.rowIndex, 0, {
        athlete: 'New Item' + newItemCount
    });
    newItemCount++;

    gridOptions.api.purgeEnterpriseCache();
}
