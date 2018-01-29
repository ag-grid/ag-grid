var columnDefs = [
    {headerName: 'Athlete', field: 'athlete', minWidth: 150},
    {headerName: 'Age', field: 'age', minWidth: 50},
    {headerName: 'Country', field: 'country', minWidth: 120},
    {headerName: 'Year', field: 'year', minWidth: 90},
    {headerName: 'Date', field: 'date', minWidth: 110},
    {headerName: 'Sport', field: 'sport', minWidth: 110},
    {headerName: 'Gold', field: 'gold', minWidth: 100},
    {headerName: 'Silver', field: 'silver', minWidth: 100},
    {headerName: 'Bronze', field: 'bronze', minWidth: 100},
    {headerName: 'Total', field: 'total', minWidth: 100}
];

function onGridSizeChanged(params) {
        // get the current grids width
        var gridWidth = document.getElementById('grid-wrapper').offsetWidth;

        // keep track of which columns to hide/show
        var columnsToShow = [];
        var columnsToHide = [];

        // iterate over all columns (visible or not) and work out
        // now many columns can fit (based on their minWidth)
        var totalColsWidth = 0;
        var allColumns = params.columnApi.getAllColumns();
        for (var i = 0; i < allColumns.length; i++) {
            let column = allColumns[i];
            totalColsWidth += column.getMinWidth();
            if (totalColsWidth > gridWidth) {
                columnsToHide.push(column.colId);
            } else {
                columnsToShow.push(column.colId);
            }
        }

        // show/hide columns based on current grid width
        params.columnApi.setColumnsVisible(columnsToShow, true);
        params.columnApi.setColumnsVisible(columnsToHide, false);

        // fill out any available space to ensure there are no gaps
        params.api.sizeColumnsToFit();
}

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    onGridSizeChanged: onGridSizeChanged
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '../olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
