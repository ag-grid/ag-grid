var gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'sport', minWidth: 200 },
        { field: 'athlete', minWidth: 200 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
        { field: 'age' },
        { field: 'date', minWidth: 140 },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        resizable: true,
    },
    autoGroupColumnDef: {
        headerName: ' CUSTOM! ',
        minWidth: 200,
        cellRendererParams: {
            suppressCount: true,
            checkbox: true
        },
        comparator: function(valueA, valueB) {
            if (valueA == null || valueB == null) return valueA - valueB;
            if (!valueA.substring || !valueB.substring) return valueA - valueB;
            if (valueA.length < 1 || valueB.length < 1) return valueA - valueB;
            return strcmp(valueA.substring(1, valueA.length), valueB.substring(1, valueB.length));
        }
    },
    enableRangeSelection: true,
    animateRows: true,
};

function strcmp(a, b) {
    return (a < b ? -1 : (a > b ? 1 : 0));
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
