var countryCodes = {};
var flags = {};

var columnDefs = [
    { 
        field: 'country', 
        headerName: ' ', 
        minWidth: 70,
        width: 70,
        maxWidth: 70,
        cellRenderer: function(params) {
            return '<img src="' + flags[countryCodes[params.data.country]] + '">'
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
    }
};

function onBtExport() {
    gridOptions.api.exportDataAsExcel({
        addImageToCell: function(rowIndex, col, value) {
            if (col.colId === 'country') {
                var countryCode = countryCodes[value];
                return {
                    id: countryCode,
                    base64: flags[countryCode],
                    imageType: 'png',
                    width: 20,
                    height: 11,
                    position: {
                        offsetX: 30,
                        offsetY: 5.5
                    }
                };
            }
        }
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then(function(response) { return response.json()})
        .then(function(data) {
            return fetch('https://flagcdn.com/en/codes.json')
            .then(function(response) { return response.json(); })
            .then(function(codes) {
                Object.keys(codes).forEach(function(code) {
                    countryCodes[codes[code]] = code;
                });
                return data.filter(function(rec) { return rec.country != null; });
            })
        })
        .then(function(data) {
            return createBase64Flags(data);
        })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        })
});


function createBase64Flags(data) {
    var promiseArray = data.map(function(rec) {
        var countryCode = countryCodes[rec.country];

        if (flags[countryCode]) {
            return Promise.resolve(); 
        } else {
            flags[countryCode] = 'pending'
        }

        return fetch('https://flagcdn.com/w20/' + countryCode + '.png')
            .then(function(response) { return response.blob(); })
            .then(function(blob) { return new Promise(function(res) {
                var reader = new FileReader();
                reader.onloadend = function() {
                    flags[countryCode] = reader.result;
                    res(reader.result);
                }
                reader.readAsDataURL(blob);
            })})
    });
    
    return Promise.all(promiseArray).then(function() { return data; })
}