var gridOptions = {
    columnDefs: [
        { field: 'country', minWidth: 120, rowGroup: true },
        { field: 'year', rowGroup: true },
        { headerName: 'Name', field: 'athlete', minWidth: 150 },
        { headerName: 'Name Length', valueGetter: 'data ? data.athlete.length : ""' },
        { field: 'sport', minWidth: 120, rowGroup: true },
        { field: 'silver' },
        { field: 'bronze ' },
        { field: 'total' }
    ],

    defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 100,
        flex: 1
    },

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

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
            gridOptions.api.forEachNode(function(node) {
                node.expanded = true;
            });
            gridOptions.api.onGroupExpandedOrCollapsed();
        });
});
