var columnDefs = [
    { field: "athlete", width: 150 },
    { field: "age", width: 90 },
    { field: "country", width: 120 },
    { field: "year", width: 90 },
    { field: "date", width: 110 },
    { field: "sport", width: 110 },
    { field: "gold", width: 100 },
    { field: "silver", width: 100 },
    { field: "bronze", width: 100 },
    { field: "total", width: 100 }
];

var gridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    },

    // set rowData to null or undefined to show loading panel by default
    rowData: null,
    columnDefs: columnDefs,

    components: {
        customLoadingOverlay: CustomLoadingOverlay,
        customNoRowsOverlay: CustomNoRowsOverlay
    },

    loadingOverlayComponent: 'customLoadingOverlay',
    loadingOverlayComponentParams: {
        loadingMessage: 'One moment please...'
    },
    noRowsOverlayComponent: 'customNoRowsOverlay',
    noRowsOverlayComponentParams: {
        noRowsMessageFunc: function() {
            return 'Sorry - no rows! at: ' + new Date();
        }
    }
};

function onBtShowLoading() {
    gridOptions.api.showLoadingOverlay();
}

function onBtShowNoRows() {
    gridOptions.api.showNoRowsOverlay();
}

function onBtHide() {
    gridOptions.api.hideOverlay();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
