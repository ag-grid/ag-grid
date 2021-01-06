var columnDefs = [
    {
        headerName: 'Top Level Column Group',
        children: [
            {
                headerName: 'Group A',
                children: [
                    { field: 'athlete', minWidth: 200 },
                    {
                        field: 'age',
                        cellClassRules: {
                            greenBackground: function(params) { return params.value < 30; },
                            blueBackground: function(params) { return params.value < 20; }
                        }
                    },
                    { field: 'country', minWidth: 200, },
                    { headerName: 'Group', valueGetter: 'data.country.charAt(0)', },
                    { field: 'year' }
                ]
            },
            {
                headerName: 'Group B',
                children: [
                    {
                        field: 'date',
                        minWidth: 150,
                        valueGetter: function(params) {
                            var val = params.data.date;

                            if (val.indexOf('/') < 0) { return val; }

                            var split = val.split('/');

                            return split[2] + '-' + split[1] + '-' + split[0];

                        }
                    },
                    { field: 'sport', minWidth: 150 },
                    { field: 'gold' },
                    { field: 'silver' },
                    { field: 'bronze' },
                    { field: 'total', }
                ]
            }
        ]
    }
];

var gridOptions = {
    defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 100,
        flex: 1
    },

    columnDefs: columnDefs,
    rowSelection: 'multiple',

    pinnedTopRowData: [
        {
            athlete: 'Floating <Top> Athlete',
            age: 999,
            country: 'Floating <Top> Country',
            year: 2020,
            date: '2020-08-01',
            sport: 'Track & Field',
            gold: 22,
            silver: '003',
            bronze: 44,
            total: 55
        }
    ],

    pinnedBottomRowData: [
        {
            athlete: 'Floating <Bottom> Athlete',
            age: 888,
            country: 'Floating <Bottom> Country',
            year: 2030,
            date: '2030-08-01',
            sport: 'Track & Field',
            gold: 222,
            silver: '005',
            bronze: 244,
            total: 255
        }
    ]
};

function getBooleanValue(cssSelector) {
    return document.querySelector(cssSelector).checked === true;
}

function getTextValue(cssSelector) {
    return document.querySelector(cssSelector).value;
}

function getNumericValue(cssSelector) {
    var value = parseFloat(getTextValue(cssSelector));
    if (isNaN(value)) {
        var message = "Invalid number entered in " + cssSelector + " field";
        alert(message);
        throw new Error(message);
    }
    return value;
}

function myColumnWidthCallback(params) {
    var originalWidth = params.column.getActualWidth();
    if (params.index < 7) {
        return originalWidth;
    }
    return 30;
}

function onBtExport() {
    var columnWidth = getBooleanValue('#columnWidth') ? getTextValue('#columnWidthValue') : undefined;
    var params = {
        columnWidth: columnWidth === 'myColumnWidthCallback' ? myColumnWidthCallback : parseFloat(columnWidth),
        sheetName: getBooleanValue('#sheetName') && getTextValue('#sheetNameValue'),
        exportMode: getBooleanValue('#exportModeXml') ? "xml" : undefined,
        suppressTextAsCDATA: getBooleanValue('#suppressTextAsCDATA'),
        rowHeight: getBooleanValue('#rowHeight') ? getNumericValue('#rowHeightValue') : undefined,
        headerRowHeight: getBooleanValue('#headerRowHeight') ? getNumericValue('#headerRowHeightValue') : undefined
    };

    gridOptions.api.exportDataAsExcel(params);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://www.ag-grid.com/example-assets/olympic-winners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
