var gridOptions = {
    columnDefs: [
        { field: 'group', rowGroup: true, editable: true, hide: true},
        { field: 'a', type: 'valueColumn' },
        { field: 'b', type: 'valueColumn' },
        { field: 'c', type: 'valueColumn' },
        { field: 'd', type: 'valueColumn' },
        {
            headerName: 'Total',
            type: 'totalColumn',
            // we use getValue() instead of data.a so that it gets the aggregated values at the group level
            valueGetter: 'getValue("a") + getValue("b") + getValue("c") + getValue("d")'
        }
    ],
    defaultColDef: {
        flex: 1,
        sortable: true
    },
    autoGroupColumnDef: {
        minWidth: 100,
    },
    columnTypes: {
        valueColumn: {
            editable: true,
            aggFunc: 'sum',
            valueParser: 'Number(newValue)',
            cellClass: 'number-cell',
            cellRenderer:'agAnimateShowChangeCellRenderer',
            filter: 'agNumberColumnFilter'
        },
        totalColumn: {
            cellRenderer:'agAnimateShowChangeCellRenderer',
            cellClass: 'number-cell'
        }
    },
    rowData: getRowData(),
    groupDefaultExpanded: 1,
    suppressAggFuncInHeader: true,
    animateRows: true
};

function getRowData() {
    var rowData = [];
    for (var i = 1; i <= 16; i++) {
        rowData.push({
            group: i < 8 ? 'A' : 'B',
            a: (i * 863) % 100,
            b: (i * 811) % 100,
            c: (i * 743) % 100,
            d: (i * 677) % 100,
        });
    }
    return rowData;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
