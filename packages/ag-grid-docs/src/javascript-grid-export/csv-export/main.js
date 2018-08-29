var columnDefs = [
    {
        headerName: 'GroupA',
        children: [
            {
                headerName: 'Group1',
                children: [{headerName: 'Group', valueGetter: 'data.country.charAt(0)', width: 75}, {headerName: 'Year', field: 'year', width: 75}]
            },
            {
                headerName: 'Group2',
                children: [
                    {headerName: 'Date', field: 'date', width: 110},
                    {headerName: 'Sport', field: 'sport', width: 110},
                    {headerName: 'Gold', field: 'gold', width: 100}
                ]
            }
        ]
    },
    {
        headerName: 'GroupB',
        children: [
            {
                headerName: 'Group11',
                children: [
                    {headerName: 'Athlete', field: 'athlete', width: 150},
                    {
                        headerName: 'Age',
                        field: 'age',
                        width: 90,
                        cellClassRules: {
                            lessThan23IsGreen: function(params) {
                                return params.value < 23;
                            },
                            lessThan20IsBlue: function(params) {
                                return params.value < 20;
                            }
                        }
                    },
                    {headerName: 'Country', field: 'country', width: 120}
                ]
            },
            {
                headerName: 'Group2',
                children: [
                    {headerName: 'Silver', field: 'silver', width: 100},
                    {headerName: 'Bronze', field: 'bronze', width: 100},
                    {headerName: 'Total', field: 'total', width: 100}
                ]
            }
        ]
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    enableFilter: true,
    enableSorting: true,
    showToolPanel: true,
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

function getBooleanValue(cssSelector) {
    return document.querySelector(cssSelector).checked === true;
}

function onBtExport() {
    var params = {
        skipHeader: getBooleanValue('#skipHeader'),
        columnGroups: getBooleanValue('#columnGroups'),
        skipFooters: getBooleanValue('#skipFooters'),
        skipGroups: getBooleanValue('#skipGroups'),
        skipPinnedTop: getBooleanValue('#skipPinnedTop'),
        skipPinnedBottom: getBooleanValue('#skipPinnedBottom'),
        allColumns: getBooleanValue('#allColumns'),
        onlySelected: getBooleanValue('#onlySelected'),
        suppressQuotes: getBooleanValue('#suppressQuotes'),
        fileName: document.querySelector('#fileName').value,
        columnSeparator: document.querySelector('#columnSeparator').value
    };

    if (getBooleanValue('#skipGroupR')) {
        params.shouldRowBeSkipped = function(params) {
            return params.node.data.country.charAt(0) === 'R';
        };
    }

    if (getBooleanValue('#useCellCallback')) {
        params.processCellCallback = function(params) {
            if (params.value && params.value.toUpperCase) {
                return params.value.toUpperCase();
            } else {
                return params.value;
            }
        };
    }

    if (getBooleanValue('#useSpecificColumns')) {
        params.columnKeys = ['country', 'bronze'];
    }

    if (getBooleanValue('#processHeaders')) {
        params.processHeaderCallback = function(params) {
            return params.column.getColDef().headerName.toUpperCase();
        };
    }

    if (getBooleanValue('#customHeader')) {
        params.customHeader = '[[[ This ia s sample custom header - so meta data maybe?? ]]]\n';
    }
    if (getBooleanValue('#customFooter')) {
        params.customFooter = '[[[ This ia s sample custom footer - maybe a summary line here?? ]]]\n';
    }

    gridOptions.api.exportDataAsCsv(params);
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
        }
    };
});