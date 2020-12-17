var gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'athlete', minWidth: 180 },
        { field: 'age' },
        { field: 'year' },
        { field: 'date', minWidth: 150 },
        { field: 'sport', minWidth: 150 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: true
    },
    autoGroupColumnDef: {
        minWidth: 200
    },
    groupDefaultExpanded: 1,
};

function onBtForEachNode() {
    console.log('### api.forEachNode() ###');
    gridOptions.api.forEachNode(this.printNode);
}

function onBtForEachNodeAfterFilter() {
    console.log('### api.forEachNodeAfterFilter() ###');
    gridOptions.api.forEachNodeAfterFilter(this.printNode);
}

function onBtForEachNodeAfterFilterAndSort() {
    console.log('### api.forEachNodeAfterFilterAndSort() ###');
    gridOptions.api.forEachNodeAfterFilterAndSort(this.printNode);
}

function onBtForEachLeafNode() {
    console.log('### api.forEachLeafNode() ###');
    gridOptions.api.forEachLeafNode(this.printNode);
}

// inScope[printNode]
function printNode(node, index) {
    if (node.group) {
        console.log(index + ' -> group: ' + node.key);
    } else {
        console.log(index + ' -> data: ' + node.data.country + ', ' + node.data.athlete);
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://www.ag-grid.com/example-assets/olympic-winners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data.slice(0, 50));
        });
});
