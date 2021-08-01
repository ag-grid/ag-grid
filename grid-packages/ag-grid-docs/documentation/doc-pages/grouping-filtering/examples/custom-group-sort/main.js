var monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

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
            comparator: function (a, b, _, _, inverted) {
                // always return months in 'asc' order
                var aIdx = monthNames.indexOf(a);
                var bIdx = monthNames.indexOf(b);
                return inverted ? bIdx - aIdx : aIdx - bIdx;
            },
        },
        {
            field: 'saleDate',
            hide: true,
            comparator: function (a, b, _, _, inverted) {
                // always return dates in 'desc' order
                return inverted ? a - b : b - a;
            },
        },
        { field: 'sale', aggFunc: 'sum' },
        { field: 'salesRep' },
        { field: 'handset' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        sortable: true,
        resizable: true,
    },
    autoGroupColumnDef: {
        field: 'saleDate',
        valueFormatter: function (params) {
            if (params.data) {
                const d = params.data.saleDate;
                return d.toISOString().substring(0, 10);
            }
        },
        sort: 'desc',
        sortingOrder: ['desc', 'asc'],
        minWidth: 250,
    },
    rowData: generateData(),
    // expand first group level by default
    groupDefaultExpanded: 1,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
