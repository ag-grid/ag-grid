var columnDefs = [
    {headerName: "Make", field: "make"},
    {headerName: "Model", field: "model"},
    {headerName: "Price", field: "price"}
];

var rowData = [
    {make: "Toyota", model: "Celica", price: 35000},
    {make: "Ford", model: "Mondeo", price: 32000},
    {make: "Porsche", model: "Boxter", price: 72000}
];

var gridOptions = {
    defaultColDef: {
        editable: true
    },
    columnDefs: columnDefs,
    rowData: rowData
};

function getBooleanValue(checkboxSelector) {
    return document.querySelector(checkboxSelector).checked;
}

function getTextValue(inputSelector) {
    return document.querySelector(inputSelector).value;
}

function setCustomValue(value) {
    document.querySelector('#customValue').value = value;
}

var sampleExcelCellContent = [
    [
        {data: {value: "my custom", type: "String"}, mergeAcross: 2},
        {data: {value: "content, containing commas and \"quotes\"", type: "String"}}
    ],
    []
  ]

function getParams() {
    try {
        return {
            suppressQuotes: getBooleanValue('#suppressQuotes'),
            columnSeparator: getBooleanValue('#columnSeparator') && getTextValue('#columnSeparatorValue'),
            customHeader: JSON.parse(getTextValue('#customValue')),
            customFooter: JSON.parse(getTextValue('#customValue'))
        };
    } catch (e) {
        alert("JSON parsing error. Enter a valid JSON literal.");
        throw e;
    }
}

function onBtnExport() {
    gridOptions.api.exportDataAsCsv(getParams());
}

function onBtnUpdate() {
    document.querySelector('#csvResult').value = gridOptions.api.getDataAsCsv(getParams());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});