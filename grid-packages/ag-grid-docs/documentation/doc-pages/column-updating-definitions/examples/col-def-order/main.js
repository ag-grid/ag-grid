
function getColumnDefsA() {
    return [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'sport' },
        { field: 'year' },
        { field: 'date' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' }
    ];
}

function getColumnDefsB() {
    return [
        { field: 'athlete', headerName: 'ATHLETE' },
        { field: 'age', headerName: 'AGE' },
        { field: 'country', headerName: 'COUNTRY' },
        { field: 'sport', headerName: 'SPORT' },
        { field: 'year', headerName: 'YEAR' },
        { field: 'date', headerName: 'DATE' },
        { field: 'gold', headerName: 'GOLD' },
        { field: 'silver', headerName: 'SILVER' },
        { field: 'bronze', headerName: 'BRONZE' },
        { field: 'total', headerName: 'TOTAL' }
    ];
}

var gridOptions = {
    defaultColDef: {
        initialWidth: 100,
        sortable: true,
        resizable: true,
        filter: true
    },
    maintainColumnOrder: true,
    columnDefs: getColumnDefsA()
};

function setColsA() {
    gridOptions.api.setColumnDefs(getColumnDefsA());
}

function setColsB() {
    gridOptions.api.setColumnDefs(getColumnDefsB());
}

function clearColDefs() {
    gridOptions.api.setColumnDefs([]);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://www.ag-grid.com/example-assets/olympic-winners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
