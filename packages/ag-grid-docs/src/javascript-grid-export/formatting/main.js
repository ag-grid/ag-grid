var columnDefs = [
    {
        headerName: 'Athlete Fields',
        children: [
            {
                headerName: 'When and Where',
                children: [
                    {headerName: 'Country', field: 'country', width: 120, rowGroup: true},
                    {headerName: 'Year', field: 'year', width: 75, rowGroup: true}
                ]
            },
            {
                headerName: 'Athlete',
                children: [
                    {headerName: 'Name', field: 'athlete', width: 150},
                    {headerName: 'Name Length', valueGetter: 'data ? data.athlete.length : ""'},
                    {
                        headerName: 'Age',
                        field: 'age',
                        width: 90
                    },
                    {headerName: 'Sport', field: 'sport', width: 120, rowGroup: true}
                ]
            }
        ]
    },
    {
        headerName: 'Medal Fields',
        children: [
            {headerName: 'Date', field: 'date', width: 110},
            {
                headerName: 'Medal Types',
                children: [
                    {headerName: 'Silver', field: 'silver', width: 100},
                    {headerName: 'Bronze', field: 'bronze', width: 100},
                    {headerName: 'Total', field: 'total', width: 100}
                ]
            }
        ]
    },
];

var gridOptions = {
    defaultColDef: {
        sortable: true,
        filter: true
    },
    columnDefs: columnDefs,
    rowSelection: 'multiple',
    pinnedTopRowData: [
        {
            athlete: 'Floating Top Athlete',
            age: 999,
            country: 'Floating Top Country',
            year: 2020,
            date: '01-08-2020',
            sport: 'Floating Top Sport',
            gold: 22,
            silver: 33,
            bronze: 44,
            total: 55
        }
    ],
    pinnedBottomRowData: [
        {
            athlete: 'Floating Bottom Athlete',
            age: 888,
            country: 'Floating Bottom Country',
            year: 2030,
            date: '01-08-2030',
            sport: 'Floating Bottom Sport',
            gold: 222,
            silver: 233,
            bronze: 244,
            total: 255
        }
    ]
};

function getBooleanValue(checkboxSelector) {
    return document.querySelector(checkboxSelector).checked;
}

function getUIValue(checkboxSelector, onWindow) {
    if (!getBooleanValue(checkboxSelector)) {
        return false;
    }
    var factory = document.querySelector(checkboxSelector + 'Value').value;
    return factory();
}

function skipPinnedRowsCallback(params) {
    return params.node.isRowPinned();
}

function makeCustomContent () {
    return [
        [],
        [{data: {type: 'String', value: 'Summary'}}],
        [{data: {type: 'String', value: 'Sales'}, mergeAcross: 2}, {data: {type: 'Number', value: '3695.36'}}],
        []
    ]
}

function myCellCallback(params) {
    if (params.value && params.value.toUpperCase) {
        return params.value.toUpperCase();
    } else {
        return params.value;
    }
}

function myGroupHeaderCallback(params) {
    var displayName = params.columnApi.getDisplayNameForColumnGroup(params.columnGroup);
    return displayName.toUpperCase();
}

function myHeaderCallback(params) {
    return params.column.getColDef().headerName.toUpperCase();
}

function myRowGroupCallback(params) {
    var indent = '--';
    var node = params.node;
    var label = node.key.toUpperCase();
    if (!node.parent.parent) {
        return label; // top level node, parent is root node
    }
    label = '> ' + label;
    // indent once per level in the row group hierarchy
    while (node.parent.parent) {
        label = indent + label;
        node = node.parent;
    }
    return label;
}


function getParams() {
    return {
        columnGroups: true,
        customHeader: getBooleanValue('#customHeader') && makeCustomContent(),
        customFooter: getBooleanValue('#customFooter') && makeCustomContent(),
        fileName: getUIValue('#fileName'),
        processCellCallback: getBooleanValue('#processCellCallback') && myCellCallback,
        processGroupHeaderCallback: getBooleanValue('#processGroupHeaderCallback') && myGroupHeaderCallback,
        processHeaderCallback: getBooleanValue('#processHeaderCallback') && myHeaderCallback,
        processRowGroupCallback: getBooleanValue('#processRowGroupCallback') && myRowGroupCallback
    };
}

function onBtnExportDataAsCsv() {
    gridOptions.api.exportDataAsCsv(getParams());
}

function onBtnExportDataAsExcel() {
    var params = getParams();
    if (typeof params.customHeader === 'string' || typeof params.customFooter === 'string') {
        alert('Excel does not support strings in customHeader or customFooter');
        return;
    }
    gridOptions.api.exportDataAsExcel(params);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
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