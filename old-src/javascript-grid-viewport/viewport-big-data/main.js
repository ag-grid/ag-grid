var columnDefs = [{
    field: 'row',
    type: 'numericColumn'
}];

let ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
let BIG_PRIME_NUMBER = 198491317;

var ONE_THOUSAND = 1000;
var ONE_MILLION = ONE_THOUSAND * 1000;
var ONE_BILLION = ONE_MILLION * 1000;

ALPHABET.forEach( function(letter) {
    columnDefs.push({
        field: letter,
        type: 'numericColumn'
    });
});

var gridOptions = {
    defaultColDef: {
        valueFormatter: function(params) {
            return params.value.toLocaleString();
        },
        width: 140,
        type: 'numericColumn'
    },
    enableRangeSelection: true,
    enableColResize: true,
    columnDefs: columnDefs,
    rowModelType: 'viewport',
    viewportDatasource: new MyViewportDataSource(),
    // implement this so that we can do selection
    getRowNodeId: function(data) {
        // the code is unique, so perfect for the id
        return data.code;
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});

function MyViewportDataSource() {}

// setRowCount: (count:number) => void;
// setRowData: (rowData:{[key:number]:any}) => void;
// getRow: (rowIndex: number) => RowNode;

MyViewportDataSource.prototype.init = function(params) {
    this.initParams = params;
    let rowCount = 2 * ONE_MILLION;
    console.log('row count is ' + rowCount.toLocaleString());
    params.setRowCount(rowCount);
};

MyViewportDataSource.prototype.setViewportRange = function(firstRow, lastRow) {

    let rowData = {};

    for (var rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
        let item = {};
        item.row = rowIndex;

        ALPHABET.forEach( function(letter, index) {
            // create some pseudo-random numbers, however do not use fully random,
            // so numbers are deterministic and don't change.
            item[letter] = (BIG_PRIME_NUMBER * (rowIndex+1) * (index+1)) % 100000;
        });

        rowData[rowIndex] = (item);
    }

    this.initParams.setRowData(rowData);
};

MyViewportDataSource.prototype.destroy = function() {

};
