var gridOptions = {
    columnDefs: [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { headerName: 'Gold*pie', field: 'goldPie', minWidth: 200 },
        { headerName: 'Silver*pie', field: 'silverPie', minWidth: 200 },
        { headerName: 'Bronze*pie', field: 'bronzePie', minWidth: 200 },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
        sortable: true,
    },
    autoGroupColumnDef: {
        headerName: 'Athlete',
        field: 'athlete',
        minWidth: 250
    },
    sideBar: true,
    groupUseEntireRow: false,
    enableRangeSelection: true,
    groupRowAggNodes: groupRowAggNodes,
};

function groupRowAggNodes(nodes) {
    var result = {
        gold: 0,
        silver: 0,
        bronze: 0,
        goldPie: 0,
        silverPie: 0,
        bronzePie: 0
    };
    nodes.forEach(function(node) {
        var data = node.group ? node.aggData : node.data;
        if (typeof data.gold === 'number') {
            result.gold += data.gold;
            result.goldPie += data.gold * Math.PI;
        }
        if (typeof data.silver === 'number') {
            result.silver += data.silver;
            result.silverPie += data.silver * Math.PI;
        }
        if (typeof data.bronze === 'number') {
            result.bronze += data.bronze;
            result.bronzePie += data.bronze * Math.PI;
        }
    });
    return result;
}

function expandAll() {
    gridOptions.api.expandAll();
}

function collapseAll() {
    gridOptions.api.collapseAll();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});
