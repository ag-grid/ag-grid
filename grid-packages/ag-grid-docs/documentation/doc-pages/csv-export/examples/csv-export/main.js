var gridOptions = {
    defaultColDef: {
        editable: true,
        resizable: true,
        minWidth: 100,
        flex: 1
    },

    suppressExcelExport: true,
    popupParent:document.body,

    columnDefs: [
        { field: 'make' },
        { field: 'model' },
        { field: 'price' }
    ],

    rowData: [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 }
    ]
};

function onBtnExport() {
    gridOptions.api.exportDataAsCsv();
}

function onBtnUpdate() {
    document.querySelector('#csvResult').value = gridOptions.api.getDataAsCsv();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});