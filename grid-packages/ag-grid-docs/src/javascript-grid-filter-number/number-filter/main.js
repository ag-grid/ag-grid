var columnDefs = [
    {
        field: 'sale',
        headerName: 'Sale ($)',
        filter: 'agNumberColumnFilter',
        valueFormatter: function(params) {
            return params.value.toFixed(2);
        }
    },
    {
        field: 'sale',
        headerName: 'Sale',
        filter: 'agNumberColumnFilter',
        filterParams: {
            allowedCharPattern: '\\d\\-\\,\\$',
            numberParser: function(text) {
                return text == null ? null : parseFloat(text.replace(',', '.').replace('$', ''));
            }
        },
        valueFormatter: function(params) {
            var formatted = params.value.toFixed(2).replace('.', ',');

            if (formatted.indexOf('-') === 0) {
                return '-$' + formatted.slice(1);
            }

            return '$' + formatted;
        }
    },
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    rowData: getRowData()
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
