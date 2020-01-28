var columnDefs = [
    {field: 'a'},
    {field: 'b'},
    {field: 'c'},
    {field: 'd'},
    {field: 'e'},
    {field: 'f'},
    {field: 'g'},
    {field: 'h'},
    {field: 'i'},
    {field: 'j'},
    {field: 'k'},
];

function createRowData() {
    var data = [];
    for (var i = 0; i<20; i++) {
        data.push({
            a: 'Green ' + (i*2),
            b: 'Green ' + (i*3) + 11,
            c: 'Green ' + (i*4) + 14,
            d: 'Green ' + (i*2) + 13,
            e: 'Blue ' + (i*3) + 155,
            f: 'Red ' + (i*4) + 265,
            g: 'Yellow ' + (i) + 23,
            h: 'Green ' + (i*3) + 23,
            i: 'Green ' + (i*7) + 23,
            j: 'Green ' + (i*9) + 23,
            k: 'Green ' + (i*13) + 23,
        });
    }
    return data;
}

var gridOptions = {
    rowData: createRowData(),
    columnDefs: columnDefs,
    enableRangeSelection: true,
    defaultColDef: {
        editable: true,
        width: 100,
        cellClassRules: {
            'cell-green': 'value.startsWith("Green")',
            'cell-blue': 'value.startsWith("Blue")',
            'cell-red': 'value.startsWith("Red")',
            'cell-yellow': 'value.startsWith("Yellow")',
            'cell-orange': 'value.startsWith("Orange")',
            'cell-grey': 'value.startsWith("Grey")'
        }
    },
    processDataFromClipboard: function(params) {
        var containsRed;
        var containsYellow;

        var data = params.data;

        for (var i = 0; i<data.length; i++) {
            var row = data[i];
            for (var j = 0; j<row.length; j++) {
                var value = row[j];
                if (value) {
                    if (value.startsWith('Red')) {
                        containsRed = true;
                    } else if (value.startsWith('Yellow')) {
                        containsYellow = true;
                    }
                }
            }
        }

        if (containsRed) {
            // replace the paste request with another
            return [
                ['Orange','Orange'],
                ['Grey','Grey'],
            ];
        } else if (containsYellow) {
            // cancels the paste
            return null;
        } else {
            return data;
        }

    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});