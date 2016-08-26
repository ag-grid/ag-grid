// create array with each entry one letter of alphabet, et ['A','B'...]
var LETTERS_IN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

var mainRowData = createData(100, 'body');
var floatingTopRowData = createData(3, 'floating');
var floatingBottomRowData = createData(3, 'floating');

function createData(count, prefix) {
    var rowData = [];
    for (var i = 0; i<count; i++) {
        var item = {};
        // mark every third row as nested. how you mark the row is up to you,
        // in this example the example code (not the grid code) looks at the
        // nested attribute in the isNestedRow() callback. how you determine
        // if a row is nested or not is totally up to you.
        item.nested = i % 3 === 2;
        // put in a column for each letter of the alphabet
        LETTERS_IN_ALPHABET.forEach( function(letter) {
            item[letter] = prefix + ' (' + letter + ',' + i + ')';
        });
        rowData.push(item);
    }
    return rowData;
}

var columnDefs = [];
LETTERS_IN_ALPHABET.forEach( function(letter) {
    var colDef = {
        headerName: letter,
        field: letter,
        width: 100
    };
    if (letter==='A') {
        colDef.pinned = 'left';
    }
    if (letter==='Z') {
        colDef.pinned = 'right';
    }
    columnDefs.push(colDef);
});

var gridOptions = {
    columnDefs: columnDefs,
    rowData: mainRowData,
    floatingTopRowData: floatingTopRowData,
    floatingBottomRowData: floatingTopRowData,
    isNestedRow: function(rowNode) {
        // in this example, we check the nested attribute that we set
        // while creating the data. what check you do to decide if you
        // want to nest a row is up to you, as long as you return a boolean
        // for this method.
        return rowNode.data.nested;
    },
    // see ag-Grid docs cellRenderer for details on how to build cellRenderers
    // this is a simple function cellRenderer, returns plain HTML, not a component
    nestedRowRenderer: function(params) {
        // floating rows will have node.floating set to either 'top' or 'bottom' - see docs for floating
        var cssClass;
        var message;

        if (params.node.floating) {
            cssClass = 'example-nested-floating-row';
            message = 'Floating nested row at index ' + params.rowIndex;
        } else {
            cssClass = 'example-nested-row';
            message = 'Normal nested row at index' + params.rowIndex;
        }

        var template = '<div class="'+cssClass+'"><button onclick="window.alert(\'Clicked!!\')">Click</button> '+message+'</div>';

        return template;
    },
    getRowHeight: function(params) {
        // you can have normal rows and nested rows any height that you want
        var isBodyRow = params.node.floating===undefined;
        var isNestedRow = params.node.data.nested;
        if (isBodyRow && isNestedRow) {
            return 55;
        } else {
            return 25;
        }
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
