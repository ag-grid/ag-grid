const gridOptions = {
    columnDefs: [
        { headerName: 'As provided', field: "rawValue" },
        { headerName: 'As boolean', field: "rawValue", cellClass: 'booleanType' },
        { headerName: 'As string', field: "rawValue", cellClass: 'stringType' },
        { headerName: 'Date', field: "dateValue", cellClass: 'dateType', minWidth: 220 }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
    },
    excelStyles: [
        { id: 'booleanType', dataType: 'Boolean' },
        { id: 'stringType', dataType: 'String' },
        { id: 'dateType', dataType: 'DateTime' }
    ],
    rowData: [{rawValue: 1, dateValue: '2009-04-20T00:00:00.000'}],
    popupParent: document.body,
};

function onBtExport() {
    gridOptions.api.exportDataAsExcel();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
