var gridOptions = {
    columnDefs: [
        { field: "athlete", minWidth: 150 },
        { field: "age", maxWidth: 90 },
        { field: "country", minWidth: 150 },
        { field: "year", maxWidth: 90 },
        { field: "date", minWidth: 150 },
        { field: "sport", minWidth: 150 },
        { field: "gold" },
        { field: "silver" },
        { field: "bronze" },
        { field: "total" }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    rowSelection: 'multiple',
    onSelectionChanged: onSelectionChanged
};

function onSelectionChanged() {
    var selectedRows = gridOptions.api.getSelectedRows();
    var selectedRowsString = '';
    var maxToShow = 5;

    selectedRows.forEach(function(selectedRow, index) {
        if (index >= maxToShow) {
            return;
        }

        if (index > 0) {
            selectedRowsString += ', ';
        }

        selectedRowsString += selectedRow.athlete;
    });

    if (selectedRows.length > maxToShow) {
        var othersCount = selectedRows.length - maxToShow;
        selectedRowsString += ' and ' + othersCount + ' other' + (othersCount !== 1 ? 's' : '');
    }

    document.querySelector('#selectedRows').innerHTML = selectedRowsString;
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
