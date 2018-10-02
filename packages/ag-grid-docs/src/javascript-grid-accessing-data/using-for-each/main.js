var columnDefs = [
    {headerName: 'Athlete', field: 'athlete', width: 150},
    {headerName: 'Age', field: 'age', width: 90},
    {headerName: 'Country', field: 'country', width: 120, rowGroupIndex: 0},
    {headerName: 'Group', valueGetter: 'data.country.charAt(0)', width: 120},
    {headerName: 'Year', field: 'year', width: 90},
    {headerName: 'Date', field: 'date', width: 110},
    {headerName: 'Sport', field: 'sport', width: 110},
    {headerName: 'Gold', field: 'gold', width: 100},
    {headerName: 'Silver', field: 'silver', width: 100},
    {headerName: 'Bronze', field: 'bronze', width: 100},
    {headerName: 'Total', field: 'total', width: 100}
];

var gridOptions = {
    groupDefaultExpanded: 1,
    columnDefs: columnDefs,
    enableFilter: true,
    enableSorting: true
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

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data.slice(0, 50));
    });
});