var columnDefs = [
    { field: 'country', minWidth: 120, flex: 1, rowGroup: true },
    { field: 'year', width: 100, rowGroup: true },
    { headerName: 'Name', field: 'athlete', minWidth: 150, flex: 1 },
    { headerName: 'Name Length', valueGetter: 'data ? data.athlete.length : ""' },
    { field: 'sport', width: 120, rowGroup: true },
    { field: 'silver', width: 100 },
    { field: 'bronze', width: 100 },
    { field: 'total', width: 100 }
];

function rowGroupCallback(params) {
    return params.node.key;
}

function getIndentClass(params) {
    var indent = 0;
    var node = params.node;
    while (node && node.parent) {
        indent++;
        node = node.parent;
    }
    return ["indent-" + indent];
}

function onBtnExportDataAsExcel() {
    gridOptions.api.exportDataAsExcel({
        processRowGroupCallback: rowGroupCallback
    });
}

var gridOptions = {
    defaultColDef: {
        sortable: true,
        filter: true
    },

    columnDefs: columnDefs,

    autoGroupColumnDef: {
        cellClass: getIndentClass,
        minWidth: 250,
        flex: 1
    },

    excelStyles: [
        {
            id: 'indent-1',
            alignment: {
                indent: 1
            },
            // note, dataType: 'string' required to ensure that numeric values aren't right-aligned
            dataType: 'string'
        },
        {
            id: 'indent-2',
            alignment: {
                indent: 2
            },
            dataType: 'string'
        },
        {
            id: 'indent-3',
            alignment: {
                indent: 3
            },
            dataType: 'string'
        }
    ]
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
            gridOptions.api.forEachNode(function(node) {
                node.expanded = true;
            });
            gridOptions.api.onGroupExpandedOrCollapsed();
        }
    };
});
