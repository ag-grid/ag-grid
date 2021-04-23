var countryCodes = {};
var base64flags = {};

var columnDefs = [
    { 
        field: 'country', 
        headerName: ' ', 
        minWidth: 70,
        width: 70,
        maxWidth: 70,
        cellRenderer: function(params) {
            return '<img src="' + base64flags[countryCodes[params.data.country]] + '">'
        }
    },
    { field: 'country'},
    { field: 'athlete'},
    { field: 'age' },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' }
];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        width: 150,
        resizable: true
    },
    defaultExcelExportParams: {
        addImageToCell: function(rowIndex, col, value) {
            if (col.colId === 'country') {
                var countryCode = countryCodes[value];
                return {
                    image: {
                        id: countryCode,
                        base64: base64flags[countryCode],
                        imageType: 'png',
                        width: 20,
                        height: 11,
                        position: {
                            offsetX: 30,
                            offsetY: 5.5
                        }
                    }
                };
            }
        }
    }
};

function onBtExport() {
    gridOptions.api.exportDataAsExcel();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then(function(response) { return createBase64FlagsFromResponse(response, countryCodes, base64flags)})
        .then(function(data) {
            gridOptions.api.setRowData(data);
        })
});

