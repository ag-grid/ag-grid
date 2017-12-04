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

var pinnedTopRow = { athlete: 'Floating Top Athlete', age: 999, country: 'Floating Top Country', year: 2020,
    date: '01-08-2020', sport: 'Floating Top Sport', gold: 22, silver: '003', bronze: 44, total: 55};

var pinnedBottomRow = { athlete: 'Floating Bottom Athlete', age: 888, country: 'Floating Bottom Country', year: 2030,
    date: '01-08-2030', sport: 'Floating Bottom Sport', gold: 222, silver: '005', bronze: 244, total: 255};

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
    gridOptions.api.exportDataAsExcel();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});