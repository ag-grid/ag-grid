// create array with each entry one letter of alphabet, et ['A','B'...]
var LETTERS_IN_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

var mainRowData = createData(100, 'body');
var floatingTopRowData = createData(3, 'floating');
var floatingBottomRowData = createData(3, 'floating');

function createData(count, prefix) {
    var rowData = [];
    for (var i = 0; i<count; i++) {
        var item = {};
        // mark every third row as full width. how you mark the row is up to you,
        // in this example the example code (not the grid code) looks at the
        // fullWidth attribute in the isFullWidthCell() callback. how you determine
        // if a row is full width or not is totally up to you.
        item.fullWidth = i % 3 === 2;
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
    isFullWidthCell: function(rowNode) {
        // in this example, we check the fullWidth attribute that we set
        // while creating the data. what check you do to decide if you
        // want a row full width is up to you, as long as you return a boolean
        // for this method.
        return rowNode.data.fullWidth;
    },
    // see ag-Grid docs cellRenderer for details on how to build cellRenderers
    // this is a simple function cellRenderer, returns plain HTML, not a component
    fullWidthCellRenderer: function(params) {
        // floating rows will have node.floating set to either 'top' or 'bottom' - see docs for floating
        var cssClass;
        var message;

        if (params.node.floating) {
            cssClass = 'example-full-width-floating-row';
            message = 'Floating full width row at index ' + params.rowIndex;
        } else {
            cssClass = 'example-full-width-row';
            message = 'Normal full width row at index' + params.rowIndex;
        }

        var eDiv = document.createElement('div');
        eDiv.innerHTML = '<div class="'+cssClass+'"><button>Click</button> '+message+'</div>';

        var eButton = eDiv.querySelector('button');
        eButton.addEventListener('click', function() {
            alert('button clicked');
            console.log('setting');
            // params.node.setRowHeight(500);
            // params.api.onRowHeightChanged();
        } );

        return eDiv;
    },
    getRowHeight: function(params) {
        // you can have normal rows and full width rows any height that you want
        var isBodyRow = params.node.floating===undefined;
        var isFullWidth = params.node.data.fullWidth;
        if (isBodyRow && isFullWidth) {
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
