var gridOptions = {
    columnDefs: [
        { field: "country", rowGroup: true, enableRowGroup: true },
        { field: "year", pivot: true, enablePivot: true, pivotComparator: MyYearPivotComparator },
        { field: "date" },
        { field: "sport" },
        { field: "gold", aggFunc: 'sum' },
        { field: "silver", aggFunc: 'sum' },
        { field: "bronze", aggFunc: 'sum' }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
        resizable: true
    },
    autoGroupColumnDef: {
        minWidth: 250,
    },
    sideBar: true,
    pivotMode: true,

    // we don't want the grid putting in 'sum' in the headers for us
    suppressAggFuncInHeader: true,

    // this is a callback that gets called on each column definition
    processSecondaryColDef: function(colDef) {
        // make all the columns upper case
        colDef.headerName = colDef.headerName.toUpperCase();

        // the pivot keys are the keys use for the pivot
        // don't change these, but you can use them for your information
        // console.log('Pivot Keys:');
        // console.log(colDef.pivotKeys);
        // // the value column is the value we are aggregating on
        // console.log('Pivot Value Keys:');
        // console.log(colDef.pivotValueColumn);
    },

    // this is a callback that gets called on each group definition
    processSecondaryColGroupDef: function(colGroupDef) {
        // for fun, add a css class for 2002
        if (colGroupDef.pivotKeys[0] === '2002') {
            colGroupDef.headerClass = 'color-background';
        }
        // put 'year' in front of each group
        colGroupDef.headerName = 'Year ' + colGroupDef.headerName;
    }
};

function MyYearPivotComparator(a, b) {
    var requiredOrder = ['2012', '2010', '2008', '2006', '2004', '2002', '2000'];
    return requiredOrder.indexOf(a) - requiredOrder.indexOf(b);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinners.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
