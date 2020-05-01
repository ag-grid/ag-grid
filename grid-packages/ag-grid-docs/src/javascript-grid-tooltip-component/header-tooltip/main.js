var columnDefs = [
    {
        headerName: "Athletes",
        headerTooltip: 'Athletes',
        tooltipComponent: 'customTooltip',
        children: [
            { headerName: "Athlete Col 1", field: "athlete", width: 150, headerTooltip: 'Athlete 1', tooltipField: 'athlete' },
            { headerName: "Athlete Col 2", field: "athlete", width: 150, headerTooltip: 'Athlete 2', tooltipComponent: 'customTooltip', tooltipValueGetter: function(params) { return { value: params.value }; } },
        ]
    },
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
        customTooltip: CustomTooltip,
    },

    onFirstDataRendered: onFirstDataRendered
};

function onFirstDataRendered(params) {
    params.api.getDisplayedRowAtIndex(0).data.athlete = undefined;
    params.api.getDisplayedRowAtIndex(1).data.athlete = null;
    params.api.getDisplayedRowAtIndex(2).data.athlete = '';

    params.api.refreshCells();
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
