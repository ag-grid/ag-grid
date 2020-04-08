var columnDefs = [
    {
        field: "athlete",
        minWidth: 200,
        enableRowGroup: true,
        enablePivot: true
    },
    {
        field: "age",
        enableValue: true
    },
    {
        field: "country",
        minWidth: 200,
        enableRowGroup: true,
        enablePivot: true,
        headerValueGetter: countryHeaderValueGetter
    },
    {
        field: "year",
        enableRowGroup: true,
        enablePivot: true
    },
    {
        field: "date",
        minWidth: 180,
        enableRowGroup: true,
        enablePivot: true
    },
    {
        field: "sport",
        minWidth: 200,
        enableRowGroup: true,
        enablePivot: true
    },
    {
        field: "gold",
        hide: true,
        enableValue: true,
        toolPanelClass: 'tp-gold'
    },
    {
        field: "silver",
        hide: true,
        enableValue: true,
        toolPanelClass: ['tp-silver']
    },
    {
        field: "bronze",
        hide: true,
        enableValue: true,
        toolPanelClass: function(params) {
            return 'tp-bronze';
        }
    },
    {
        headerName: "Total",
        field: "totalAgg",
        valueGetter: "node.group ? data.totalAgg : data.gold + data.silver + data.bronze",
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: true
    },
    sideBar: 'columns',
    rowGroupPanelShow: 'always'
};

function countryHeaderValueGetter(params) {
    switch (params.location) {
        case 'csv': return 'CSV Country';
        case 'clipboard': return 'CLIP Country';
        case 'toolPanel': return 'TP Country';
        case 'columnDrop': return 'CD Country';
        case 'header': return 'H Country';
        default: return 'Should never happen!';
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
