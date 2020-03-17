var gridOptions = {
    defaultColDef: {
        editable: true,
        resizable: true,
        minWidth: 100,
        flex: 1
    },

    columnDefs: [
        { field: 'make' },
        { field: 'model' },
        { field: 'price' }
    ],

    rowData: [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxter', price: 72000 }
    ]
};

function getBooleanValue(checkboxSelector) {
    return document.querySelector(checkboxSelector).checked;
}

function getValue(inputSelector) {
    var text = document.querySelector(inputSelector).value;
    switch (text) {
    case 'string':
        return 'Here is a comma, and a some "quotes". You can see them using the\n'
            + 'api.getDataAsCsv() button but they will not be visible when the downloaded\n'
            + 'CSV file is opened in Excel because string content passed to\n'
            + 'customHeader and customFooter is not escaped.';
    case 'array':
        return [
            [],
            [
                {data: {value: 'Here is a comma, and a some "quotes".', type: "String"}}
            ],
            [
                {data: {value: 'They are visible when the downloaded CSV file is opened in Excel because custom content is properly escaped (provided that suppressQuotes is not set to true)', type: "String"}}
            ],
            [
                {data: {value: "this cell:", type: "String"}, mergeAcross: 1},
                {data: {value: "is empty because the first cell has mergeAcross=1", type: "String"}}
            ],
            []
        ]
        case 'none':
            return;
        case 'tab':
            return '\t';
        case 'true':
            return true;
        case 'none':
            return;
    default:
        return text
    }
}

function getParams() {
    return {
        suppressQuotes: getValue('#suppressQuotes'),
        columnSeparator: getValue('#columnSeparator'),
        customHeader: getValue('#customHeader'),
        customFooter: getValue('#customFooter')
    };
}

function onBtnExport() {
    var params = getParams();
    if (params.suppressQuotes || params.columnSeparator) {
        alert('NOTE: you are downloading a file with non-standard quotes or separators - it may not render correctly in Excel.');
    }
    gridOptions.api.exportDataAsCsv(params);
}

function onBtnUpdate() {
    document.querySelector('#csvResult').value = gridOptions.api.getDataAsCsv(getParams());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});