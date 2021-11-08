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
        resizable: true
    },
    rowSelection: 'single',
    columnDefs: columnDefs,
    rowModelType: 'serverSide',
    serverSideStoreType: 'partial'
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json').then(response => response.json()).then(function (data) {
        var datasource = createMyDataSource(data);
        gridOptions.api.setServerSideDatasource(datasource);
    });
});

var newItemCount = 0;

function onBtRemove() {
    var selectedRows = gridOptions.api.getSelectedNodes();
    if (!selectedRows || selectedRows.length === 0) {
        return;
    }

    var selectedRow = selectedRows[0];

    var indexToRemove = window.rowDataServerSide.indexOf(selectedRow.data);
    // the record could be missing, if the user hit the 'remove' button a few times before refresh happens
    if (indexToRemove >= 0) {
        window.rowDataServerSide.splice(indexToRemove, 1);
    }

    gridOptions.api.refreshServerSideStore();
}

function onBtAdd() {
    var selectedRows = gridOptions.api.getSelectedNodes();
    if (!selectedRows || selectedRows.length === 0) {
        return;
    }

    var selectedRow = selectedRows[0];

    // insert new row in the source data, at the top of the page
    window.rowDataServerSide.splice(selectedRow.rowIndex, 0, {
        athlete: 'New Item' + newItemCount
    });
    newItemCount++;

    gridOptions.api.refreshServerSideStore();
}


function createMyDataSource(data) {
    window.rowDataServerSide = data;

    function MyDatasource() {
    }

    MyDatasource.prototype.getRows = function (params) {
        setTimeout(function () {
            // take a slice of the total rows
            var rowsThisPage = data.slice(params.request.startRow, params.request.endRow);
            // call the success callback
            params.success({rowData: rowsThisPage, rowCount: window.rowDataServerSide.length});
        }, 500);
    };

    return new MyDatasource();
}
