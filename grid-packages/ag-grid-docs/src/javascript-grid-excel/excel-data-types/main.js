var gridOptions = {
    columnDefs: [
        { headerName: 'As provided', field: "rawValue" },
        { headerName: 'As boolean', field: "rawValue", cellClass: 'booleanType' },
        { headerName: 'As string', field: "rawValue", cellClass: 'stringType' },
        { headerName: 'Date', field: "dateValue", cellClass: 'dateType', minWidth: 220 }
    ],

    defaultColDef: {
        sortable: true,
        filter: true,
        minWidth: 100,
        resizable: true,
        flex: 1
    },

    rowSelection: 'multiple',

    rowData: [{
        rawValue: 1,
        dateValue: '2009-04-20T00:00:00.000'
    }],

    excelStyles:[
        {
            id: 'booleanType',
            dataType: 'boolean'
        },{
            id: 'stringType',
            dataType: 'string'
        },{
            id: 'dateType',
            dataType: 'dateTime'
        }
    ]
};

function getBooleanValue(cssSelector) {
    return document.querySelector(cssSelector).checked === true;
}

function onBtExport() {
    var params = {
        fileName: document.querySelector('#fileName').value,
        sheetName: document.querySelector('#sheetName').value
    };
    gridOptions.api.exportDataAsExcel(params);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
