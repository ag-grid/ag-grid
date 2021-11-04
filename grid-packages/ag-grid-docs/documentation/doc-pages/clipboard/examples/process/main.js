const gridOptions = {
    columnDefs: [
        {field: "athlete", minWidth: 200},
        {field: "age"},
        {field: "country", minWidth: 150},
        {field: "year"},
        {field: "date", minWidth: 150},
        {field: "sport", minWidth: 150},
        {field: "gold"},
        {field: "silver"},
        {field: "bronze"},
        {field: "total"}
    ],

    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        resizable: true
    },

    enableRangeSelection: true,
    rowSelection: 'multiple',

    processCellForClipboard: processCellForClipboard,
    processHeaderForClipboard: processHeaderForClipboard,
    processCellFromClipboard: processCellFromClipboard
};

function processCellForClipboard(params) {
    return 'C-' + params.value;
}

function processHeaderForClipboard(params) {
    const colDef = params.column.getColDef();
    let headerName = colDef.headerName || colDef.field;

    if (colDef.headerName == null) {
        headerName = headerName.charAt(0).toUpperCase() + headerName.slice(1);
    }

    return 'H-' + headerName;
}

function processCellFromClipboard(params) {
    return 'Z-' + params.value;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => gridOptions.api.setRowData(data));
});
