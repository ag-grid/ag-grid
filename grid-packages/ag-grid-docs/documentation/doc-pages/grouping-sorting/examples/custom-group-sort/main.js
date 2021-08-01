var gridOptions = {
    columnDefs: [
        {
            field: 'year',
            rowGroup: true,
            hide: true,
        },
        {
            field: 'month',
            rowGroup: true,
            hide: true,
            comparator: function (a, b) {
                const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                                        'August', 'September','October', 'November', 'December'];

                // sorts 'months' in chronological order
                return months.indexOf(a) - months.indexOf(b);
            },
        },
        { field: 'salesRep' },
        { field: 'handset' },
        { field: 'sale' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        sortable: true,
        resizable: true,
    },
    autoGroupColumnDef: {
        sort: 'asc',
        minWidth: 300,
    },
    rowData: salesData,
    groupDefaultExpanded: 1,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
