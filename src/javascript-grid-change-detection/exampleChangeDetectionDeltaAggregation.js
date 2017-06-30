var columnDefs = [
    {field: 'topGroup', rowGroup: true, hide: true},
    {field: 'group', rowGroup: true, hide: true},
    {headerName: 'ID',field: 'id', type: 'valueColumn'},
    {headerName: 'A', field: 'a', type: 'valueColumn', valueGetter: sharedValueGetter},
    {headerName: 'B', field: 'b', type: 'valueColumn', valueGetter: sharedValueGetter},
    {headerName: 'C', field: 'c', type: 'valueColumn', valueGetter: sharedValueGetter},
    {headerName: 'D', field: 'd', type: 'valueColumn', valueGetter: sharedValueGetter},
    {headerName: 'E', field: 'e', type: 'valueColumn', valueGetter: sharedValueGetter},
    {headerName: 'F', field: 'f', type: 'valueColumn', valueGetter: sharedValueGetter},
    {headerName: 'Total',
        type: 'totalColumn',
        // we use getValue() instead of data.a so that it gets the aggregated values at the group level
        valueGetter: 'getValue("a") + getValue("b") + getValue("c") + getValue("d") + getValue("e") + getValue("f")'}
];

var callCount = 0;

function sharedValueGetter(params) {
    var field = params.colDef.field;
    var result = params.data[field];
    console.log('callCount='+ callCount+ ', valueGetter:('+field+','+params.node.id+')='+result);
    callCount++;
    return result;
}

function createRowData() {
    var result = [];
    var idCounter = 0;
    for (var i = 1; i<=2; i++) {
        for (var j = 1; j <= 5; j++) {
            for (var k = 1; k <= 3; k++) {
                var rowDataItem = {
                    topGroup: i === 1 ? 'Top' : 'Bottom',
                    group: 'Group ' + j,
                    id: idCounter++,
                    a: (j * k * 863) % 100,
                    b: (j * k * 811) % 100,
                    c: (j * k * 743) % 100,
                    d: (j * k * 677) % 100,
                    e: (j * k * 619) % 100,
                    f: (j * k * 571) % 100
                };
                result.push(rowDataItem);
            }
        }
    }
    return result;
}

var gridOptions = {
    columnDefs: columnDefs,
    columnTypes: {
        valueColumn: { editable: true, aggFunc: 'sum', valueParser: 'Number(newValue)', cellClass: 'number-cell',
            cellRenderer: 'animateShowChange', filter: 'number'},
        totalColumn: { cellRenderer: 'animateShowChange', cellClass: 'number-cell'}
    },
    groupDefaultExpanded: 1,
    rowData: createRowData(),
    suppressAggFuncInHeader: true,
    animateRows: true,
    enableSorting: true,
    getRowNodeId: function(rowData) {
        return rowData.id;
    },
    onCellValueChanged: function() {
        callCount = 0;
        console.log('=========== RESET CALL COUNT ===============');
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
