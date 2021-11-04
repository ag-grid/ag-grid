var columnDefs = [
    {field: 'athlete', minWidth: 200},
    {field: 'age'},
    {field: 'country', minWidth: 200},
    {field: 'year'},
    {field: 'date', minWidth: 150},
    {field: 'sport', minWidth: 150},
    {field: 'gold'},
    {field: 'silver'}
];

var gridOptions = {
    defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 100,
        flex: 1
    },

    columnDefs: columnDefs
};

function onBtExport() {
    var sports = {};

    gridOptions.api.forEachNode(function (node) {
        if (!sports[node.data.sport]) {
            sports[node.data.sport] = true;
        }
    });

    var spreadsheets = [];

    var sportFilterInstance = gridOptions.api.getFilterInstance('sport');

    for (var sport in sports) {
        sportFilterInstance.setModel({values: [sport]});
        gridOptions.api.onFilterChanged();

        spreadsheets.push(gridOptions.api.getSheetDataForExcel({
            sheetName: sport
        }));
    }

    sportFilterInstance.setModel(null);
    gridOptions.api.onFilterChanged();

    gridOptions.api.exportMultipleSheetsAsExcel({
        data: spreadsheets,
        fileName: 'ag-grid.xlsx'
    });

    spreadsheets = [];
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => gridOptions.api.setRowData(data));
});
