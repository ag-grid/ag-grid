var gridOptions = {
    columnDefs: [
        { field: "athlete", minWidth: 180 },
        { field: "age" },
        { field: "country", minWidth: 150 },
        { field: "year"},
        { field: "date", minWidth: 130 },
        { field: "sport", minWidth: 100},
        { field: "gold"},
        { field: "silver"},
        { field: "bronze"},
        { field: "total"}
    ],

    defaultColDef: {
        resizable: true,
        minWidth: 80,
        flex: 1
    },

    rowData: []
};

// XMLHttpRequest in promise format
function makeRequest(method, url, success, error) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", url, true);
    httpRequest.responseType = "arraybuffer";

    httpRequest.open(method, url);
    httpRequest.onload = function () {
        success(httpRequest.response);
    };
    httpRequest.onerror = function () {
        error(httpRequest.response);
    };
    httpRequest.send();
}

// read the raw data and convert it to a XLSX workbook
function convertDataToWorkbook(data) {
    /* convert data to binary string */
    var data = new Uint8Array(data);
    var arr = new Array();

    for (var i = 0; i !== data.length; ++i) {
        arr[i] = String.fromCharCode(data[i]);
    }

    var bstr = arr.join("");

    return XLSX.read(bstr, {type: "binary"});
}

// pull out the values we're after, converting it into an array of rowData

function populateGrid(workbook) {
    // our data is in the first sheet
    var firstSheetName = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[firstSheetName];

    // we expect the following columns to be present
    var columns = {
        'A': 'athlete',
        'B': 'age',
        'C': 'country',
        'D': 'year',
        'E': 'date',
        'F': 'sport',
        'G': 'gold',
        'H': 'silver',
        'I': 'bronze',
        'J': 'total'
    };

    var rowData = [];

    // start at the 2nd row - the first row are the headers
    var rowIndex = 2;

    // iterate over the worksheet pulling out the columns we're expecting
    while (worksheet['A' + rowIndex]) {
        var row = {};
        Object.keys(columns).forEach(function(column) {
            row[columns[column]] = worksheet[column + rowIndex].w;
        });

        rowData.push(row);

        rowIndex++;
    }

    // finally, set the imported rowData into the grid
    gridOptions.api.setRowData(rowData);
}

function importExcel() {
    makeRequest('GET',
        'https://www.ag-grid.com/example-excel-import/OlymicData.xlsx',
        // success
        function (data) {
            var workbook = convertDataToWorkbook(data);

            populateGrid(workbook);
        },
        // error
        function (error) {
            throw error;
        }
    );
}

// wait for the document to be loaded, otherwise
// ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function () {

    // lookup the container we want the Grid to use
    var eGridDiv = document.querySelector('#myGrid');

    // create the grid passing in the div to use together with the columns & data we want to use
    new agGrid.Grid(eGridDiv, gridOptions);
});
