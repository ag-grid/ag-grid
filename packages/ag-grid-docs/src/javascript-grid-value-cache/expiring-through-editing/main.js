var callCount = 1;

var columnDefs = [
    {headerName: "Q1", field: "q1", type: 'quarterFigure'},
    {headerName: "Q2", field: "q2", type: 'quarterFigure'},
    {headerName: "Q3", field: "q3", type: 'quarterFigure'},
    {headerName: "Q4", field: "q4", type: 'quarterFigure'},
    {headerName: "Year", field: "year", rowGroup: true, hide: true},
    {headerName: "Total", colId: "total", cellClass: 'number-cell total-col', aggFunc: "sum",
        valueFormatter: formatNumber,
        valueGetter: function(params) {
            var q1 = params.getValue('q1');
            var q2 = params.getValue('q2');
            var q3 = params.getValue('q3');
            var q4 = params.getValue('q4');
            var result = q1 + q2 + q3 + q4;
            console.log('Total Value Getter ('+callCount+', '+params.column.getId()+'): ' + [q1,q2,q3,q4].join(', ') + ' = ' + result);
            callCount++;
            return result;
        }
    },
    {headerName: "Total x 10", cellClass: 'number-cell total-col', aggFunc: "sum",
        valueFormatter: formatNumber,
        valueGetter: function(params) {
            var total = params.getValue('total');
            return total * 10;
        }
    }
];

function createRowData() {
    var rowData = [];

    for (var i = 0; i<10; i++) {
        rowData.push({
            id: i,
            numberGood: Math.floor(((i+2) * 476321) % 10000),
            q1: Math.floor(((i+2) * 173456) % 10000),
            q2: Math.floor(((i+200) * 173456) % 10000),
            q3: Math.floor(((i+20000) * 173456) % 10000),
            q4: Math.floor(((i+2000000) * 173456) % 10000),
            year: i % 2 == 0 ? '2015' : '2016'
        });
    }

    return rowData;
}

function formatNumber(params) {
    var number = params.value;
    // this puts commas into the number eg 1000 goes to 1,000,
    // i pulled this from stack overflow, i have no idea how it works
    return Math.floor(number).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function onExpireValueCache(){
    console.log('onInvalidateValueCache -> start');
    gridOptions.api.expireValueCache();
    console.log('onInvalidateValueCache -> end');
}

function onRefreshCells(){
    console.log('onRefreshCells -> start');
    gridOptions.api.refreshCells();
    console.log('onRefreshCells -> end');
}

function onUpdateOneValue() {
    var randomId = Math.floor(Math.random()*10);
    var rowNode = gridOptions.api.getRowNode(randomId);
    var randomCol = ['q1','q2','q3','q4'][Math.floor(Math.random()*4)];
    var newValue = Math.floor(Math.random() * 1000);
    console.log('onUpdateOneValue -> start');
    rowNode.setDataValue(randomCol, newValue);
    console.log('onUpdateOneValue -> end');
}

var gridOptions = {
    columnTypes: {
        quarterFigure: {
            editable: true, cellClass: 'number-cell', aggFunc: 'sum',
            valueFormatter: formatNumber,
            valueParser: function numberParser(params) {
                return Number(params.newValue);
            }
        }
    },
    getRowNodeId: function(data) { return data.id; },
    suppressAggFuncInHeader: true,
    enableCellChangeFlash: true,
    columnDefs: columnDefs,
    rowData: createRowData(),
    enableColResize: true,
    enableRangeSelection: true,
    groupDefaultExpanded: 1,
    valueCache:true,
    onCellValueChanged: function() {
        console.log('onCellValueChanged');
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
    gridOptions.api.sizeColumnsToFit();
});
