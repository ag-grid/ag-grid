var columnDefs = [
    {headerName: 'Gold', field: 'gold', width: 100},
    {headerName: 'Silver', field: 'silver', width: 100},
    {headerName: 'Bronze', field: 'bronze', width: 100},
    {headerName: 'Gold*pie', field: 'goldPie', width: 100},
    {headerName: 'Silver*pie', field: 'silverPie', width: 100},
    {headerName: 'Bronze*pie', field: 'bronzePie', width: 100},
    {headerName: 'Country', field: 'country', width: 120, rowGroup: true, hide: true},
    {headerName: 'Year', field: 'year', width: 90, rowGroup: true, hide: true}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    groupUseEntireRow: false,
    enableSorting: true,
    enableRangeSelection: true,
    groupRowAggNodes: groupRowAggNodes,
    sideBar: true,
    autoGroupColumnDef: {
        headerName: 'Athlete',
        field: 'athlete',
        width: 200
    }
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
    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});