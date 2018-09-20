var columnDefs = [
    {
        headerName: 'Athlete',
        field: 'athlete',
        width: 150,
        pinnedRowCellRenderer: 'customPinnedRowRenderer',
        pinnedRowCellRendererParams: {
            style: {'color': 'blue'}
        }
    },
    {
        headerName: 'Age',
        field: 'age',
        width: 90,
        pinnedRowCellRenderer: 'customPinnedRowRenderer',
        pinnedRowCellRendererParams: {
            style: {'font-style': 'italic'}
        }
    },
    {headerName: 'Country', field: 'country', width: 120},
    {headerName: 'Year', field: 'year', width: 90},
    {headerName: 'Date', field: 'date', width: 110},
    {headerName: 'Sport', field: 'sport', width: 110}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableColResize: true,
    enableSorting: true,
    enableFilter: true,
    getRowStyle: function (params) {
        if (params.node.rowPinned) {
            return {'font-weight': 'bold'};
        }
    },
    // no rows to pin to start with
    pinnedTopRowData: createData(1, 'Top'),
    pinnedBottomRowData: createData(1, 'Bottom'),
    onFirstDataRendered(params) {
        params.api.sizeColumnsToFit();
    },
    components: {
        customPinnedRowRenderer: CustomPinnedRowRenderer
    }
};

function onPinnedRowTopCount() {
    var headerRowsToFloat = document.getElementById('top-row-count').value;
    var count = Number(headerRowsToFloat);
    var rows = createData(count, 'Top');
    gridOptions.api.setPinnedTopRowData(rows);
}

function onPinnedRowBottomCount() {
    var footerRowsToFloat = document.getElementById('bottom-row-count').value;
    var count = Number(footerRowsToFloat);
    var rows = createData(count, 'Bottom');
    gridOptions.api.setPinnedBottomRowData(rows);
}

function createData(count, prefix) {
    var result = [];
    for (var i = 0; i < count; i++) {
        result.push({
            athlete: prefix + ' Athlete ' + i,
            age: prefix + ' Age ' + i,
            country: prefix + ' Country ' + i,
            year: prefix + ' Year ' + i,
            date: prefix + ' Date ' + i,
            sport: prefix + ' Sport ' + i
        });
    }
    return result;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});