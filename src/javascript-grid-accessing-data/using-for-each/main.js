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
    gridOptions.api.forEachNode(printNode);
}

function onBtForEachNodeAfterFilter() {
    console.log('### api.forEachNodeAfterFilter() ###');
    gridOptions.api.forEachNodeAfterFilter(printNode);
}

function onBtForEachNodeAfterFilterAndSort() {
    console.log('### api.forEachNodeAfterFilterAndSort() ###');
    gridOptions.api.forEachNodeAfterFilterAndSort(printNode);
}

function onBtForEachLeafNode() {
    console.log('### api.forEachLeafNode() ###');
    gridOptions.api.forEachLeafNode(printNode);
}

function printNode(node, index) {
    if (node.group) {
        console.log(index + ' -> group: ' + node.key);
    } else {
        console.log(index + ' -> data: ' + node.data.country + ', ' + node.data.athlete);
    }
}

// do http request to get our sample data - not using any framework to keep the example self contained.
// you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
function fetchData(url, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', url);
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            callback(httpResult);
        }
    };
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetchData('https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinnersSmall.json', function(data) {
        gridOptions.api.setRowData(data.slice(0, 50));
    });
});