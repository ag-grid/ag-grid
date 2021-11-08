var gridOptions = {
    columnDefs: [
        {field: "country", pivot: true},
        {field: "year", rowGroup: true},
        {field: "sport", rowGroup: true},
        {field: "total", aggFunc: 'sum'},
        {field: "gold", aggFunc: 'sum'},
    ],
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 130,
        filter: true,
        resizable: true
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    pivotMode: true,
    onFirstDataRendered: onFirstDataRendered,
    popupParent: document.body
};

function onFirstDataRendered(event) {
    var chartContainer = document.querySelector('#chart');

    var params = {
        chartType: 'groupedColumn',
        chartContainer: chartContainer,
        chartThemeName: 'ag-vivid',
        chartThemeOverrides: {
            common: {
                padding: {
                    top: 20,
                    left: 10,
                    bottom: 30,
                    right: 10
                },
                legend: {
                    enabled: true,
                    position: 'bottom'
                },
                navigator: {
                    enabled: true,
                    height: 10
                }
            }
        }
    };

    event.api.createPivotChart(params);

    // expand one row for demonstration purposes
    setTimeout(function () {
        event.api.getDisplayedRowAtIndex(2).setExpanded(true);
    }, 0);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/wide-spread-of-sports.json').then(response => response.json())
        .then(function (data) {
            gridOptions.api.setRowData(data);
        });
});
