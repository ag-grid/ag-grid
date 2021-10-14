var defaultExportParams = {
    getCustomContentBelowRow: function(params) {
        return [
            [
                cell(''),
                cell('Call Id', 'header'),
                cell('Direction', 'header'),
                cell('Number', 'header'),
                cell('Duration', 'header'),
                cell('Switch Code', 'header')
            ]
        ].concat(
            params.node.data.callRecords.map(function(record) {
                return [
                    cell(''),
                    cell(record.callId, 'body'),
                    cell(record.direction, 'body'),
                    cell(record.number, 'body'),
                    cell(record.duration, 'body'),
                    cell(record.switchCode, 'body'),
                ];
            }),
            [[]]
        );
    },
    columnWidth: 120
};

var gridOptions = {
    columnDefs: [
        // group cell renderer needed for expand / collapse icons
        { field: 'name', cellRenderer: 'agGroupCellRenderer' },
        { field: 'account' },
        { field: 'calls' },
        { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" }
    ],
    defaultColDef: {
        flex: 1
    },
    masterDetail: true,
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [
                { field: 'callId' },
                { field: 'direction' },
                { field: 'number', minWidth: 150 },
                { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
                { field: 'switchCode', minWidth: 150 }
            ],
            defaultColDef: {
                flex: 1
            },
        },
        getDetailRowData: function(params) {
            params.successCallback(params.data.callRecords);
        }
    },
    defaultCsvExportParams: defaultExportParams,
    defaultExcelExportParams: defaultExportParams,
    excelStyles: [
        {
            id: 'header',
            interior: {
                color: '#aaaaaa',
                pattern: 'Solid'
            }
        },
        {
            id: 'body',
            interior: {
                color: '#dddddd',
                pattern: 'Solid'
            }
        },
    ]
};

function cell(text, styleId) {
    return {
        styleId: styleId,
        data: { type: /^\d+$/.test(text) ? 'Number' : 'String', value: String(text) }
    };
}

function onBtExport() {
    gridOptions.api.exportDataAsExcel();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://www.ag-grid.com/example-assets/master-detail-data.json' }).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});