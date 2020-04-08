var columnDefs = [
    { field: "athlete", minWidth: 150, tooltipField: 'athlete', tooltipComponentParams: { color: "#ececec" } },
    { field: "age" },
    { field: "country", minWidth: 130, tooltipField: "country" },
    { field: "year" },
    { field: "date" },
    { field: "sport" },
    { field: "gold" },
    { field: "silver" },
    { field: "bronze" },
    { field: "total" }
];

var gridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true,
        tooltipComponent: 'customTooltip'
    },

    tooltipShowDelay: 0,

    // set rowData to null or undefined to show loading panel by default
    rowData: null,
    columnDefs: columnDefs,

    components: {
        customTooltip: CustomTooltip,
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
