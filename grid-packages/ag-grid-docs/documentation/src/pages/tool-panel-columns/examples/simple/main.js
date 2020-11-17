var columnDefs = [
    {
        headerName: 'Athlete',
        children: [
            { field: "athlete", filter: 'agTextColumnFilter', minWidth: 200 },
            { field: "age" },
            { field: "country", minWidth: 200 }
        ]
    },
    {
        headerName: 'Competition',
        children: [
            { field: "year" },
            { field: "date", minWidth: 180 },
        ]
    },
    { field: "sport", minWidth: 200 },
    {
        headerName: 'Medals',
        children: [
            { field: "gold" },
            { field: "silver" },
            { field: "bronze" },
            { field: "total" }
        ]
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        // allow every column to be aggregated
        enableValue: true,
        // allow every column to be grouped
        enableRowGroup: true,
        // allow every column to be pivoted
        enablePivot: true,
        sortable: true,
        filter: true
    },
    sideBar: 'columns'
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
