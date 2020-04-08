var columnDefs = [
    { field: "athlete", width: 150, filter: 'agTextColumnFilter' },
    { field: "age", width: 90 },
    { field: "country", width: 120 },
    { field: "year", width: 90 },
    { field: "date", width: 110 },
    { field: "gold", width: 100, filter: false },
    { field: "silver", width: 100, filter: false },
    { field: "bronze", width: 100, filter: false },
    { field: "total", width: 100, filter: false }
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
    icons: {
        'custom-stats': '<span class="ag-icon ag-icon-custom-stats"></span>'
    },
    columnDefs: columnDefs,
    sideBar: {
        toolPanels: [{
            id: 'columns',
            labelDefault: 'Columns',
            labelKey: 'columns',
            iconKey: 'columns',
            toolPanel: 'agColumnsToolPanel',
        },
        {
            id: 'filters',
            labelDefault: 'Filters',
            labelKey: 'filters',
            iconKey: 'filter',
            toolPanel: 'agFiltersToolPanel',
        },
        {
            id: 'customStats',
            labelDefault: 'Custom Stats',
            labelKey: 'customStats',
            iconKey: 'custom-stats',
            toolPanel: 'customStatsToolPanel',
        }],
        defaultToolPanel: 'customStats'
    },
    components: {
        customStatsToolPanel: CustomStatsToolPanel
    }
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
