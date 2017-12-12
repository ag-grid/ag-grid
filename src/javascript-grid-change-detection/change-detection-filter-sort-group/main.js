var columnDefs = [
    {headerName: 'Group', field: 'group', rowGroup: true, editable: true},
    {headerName: 'A', field: 'a', type: 'valueColumn'},
    {headerName: 'B', field: 'b', type: 'valueColumn'},
    {headerName: 'C', field: 'c', type: 'valueColumn'},
    {headerName: 'D', field: 'd', type: 'valueColumn'},
    {headerName: 'E', field: 'e', type: 'valueColumn'},
    {headerName: 'F', field: 'f', type: 'valueColumn'},
    {headerName: 'Total',
        type: 'totalColumn',
        // we use getValue() instead of data.a so that it gets the aggregated values at the group level
        valueGetter: 'getValue("a") + getValue("b") + getValue("c") + getValue("d") + getValue("e") + getValue("f")'}
];

function getRowData() {
    var rowData = [];
    for (var i = 1; i <= 10; i++) {
        rowData.push({
            group: i < 5 ? 'A' : 'B',
            a: (i * 863) % 100,
            b: (i * 811) % 100,
            c: (i * 743) % 100,
            d: (i * 677) % 100,
            e: (i * 619) % 100,
            f: (i * 571) % 100
        });
    }
    return rowData;
}


var gridOptions = {
    columnDefs: columnDefs,
    columnTypes: {
        valueColumn: {
            editable: true, aggFunc: 'sum', valueParser: 'Number(newValue)',
            cellClass: 'number-cell', cellRenderer:'agAnimateShowChangeCellRenderer',
            filter: 'agNumberColumnFilter'
        },
        totalColumn: { cellRenderer:'agAnimateShowChangeCellRenderer', cellClass: 'number-cell'}
    },
    rowData: getRowData(),
    groupDefaultExpanded: 1,
    suppressAggFuncInHeader: true,
    animateRows: true,
    enableSorting: true,
    enableFilter: true,
    onCellValueChanged: function(params) {
        var changedData = [params.data];
        params.api.updateRowData({update: changedData});
    },
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
