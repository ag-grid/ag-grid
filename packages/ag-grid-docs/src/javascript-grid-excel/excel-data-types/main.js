var columnDefs = [
    {
        headerName: 'As provided',
        field: "rawValue",
        width: 150
    },
    {
        headerName: 'As boolean',
        field: "rawValue",
        width: 150,
        cellClass: 'booleanType'
    },
    {
        headerName: 'As string',
        field: "rawValue",
        width: 150,
        cellClass: 'stringType'
    },
    {
        headerName: 'Date',
        field: "dateValue",
        width: 150,
        cellClass: 'dateType'
    }
];

var gridOptions = {
    columnDefs: columnDefs,
    groupHeaders: true,
    enableFilter: true,
    enableSorting: true,
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