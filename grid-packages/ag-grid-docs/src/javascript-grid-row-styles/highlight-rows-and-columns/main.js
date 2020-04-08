var gridOptions = {
    columnDefs: [
        {
            headerName: 'Participant',
            children: [
                { field: "athlete" },
                { field: "age", maxWidth: 90 }
            ]
        },
        {
            headerName: 'Details',
            children: [
                { field: "country" },
                { field: "year", maxWidth: 90 },
                { field: "date" },
                { field: "sport" }
            ]
        },
        {
            headerName: 'Medals',
            children: [
                { field: "gold" },
                { field: "silver" },
                { field: "bronze" },
                { field: "total" }
            ]
        }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        resizable: true
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
