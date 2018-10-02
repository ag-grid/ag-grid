var callCount = 1;

var columnDefs = [
    {headerName: "Q1", field: "q1", type: 'quarterFigure'},
    {headerName: "Q2", field: "q2", type: 'quarterFigure'},
    {headerName: "Q3", field: "q3", type: 'quarterFigure'},
    {headerName: "Q4", field: "q4", type: 'quarterFigure'},
    {headerName: "Year", field: "year", rowGroup: true, hide: true},
    {
        headerName: "Total", colId: "total", cellClass: 'number-cell total-col', valueFormatter: formatNumber,
        aggFunc: "sum",
        valueGetter: function (params) {
            var q1 = params.getValue('q1');
            var q2 = params.getValue('q2');
            var q3 = params.getValue('q3');
            var q4 = params.getValue('q4');
            var result = q1 + q2 + q3 + q4;
            console.log('Total Value Getter (' + callCount + ', ' + params.column.getId() + '): ' + [q1, q2, q3, q4].join(', ') + ' = ' + result);
            callCount++;
            return result;
        }
    }
];

function createRowData() {
    var rowData = [];

    for (var i = 0; i < 100; i++) {
        rowData.push({
            id: i,
            numberGood: Math.floor(((i + 2) * 476321) % 10000),
            q1: Math.floor(((i + 2) * 173456) % 10000),
            q2: Math.floor(((i + 200) * 173456) % 10000),
            q3: Math.floor(((i + 20000) * 173456) % 10000),
            q4: Math.floor(((i + 2000000) * 173456) % 10000),
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

var gridOptions = {
    // we set the value cache in the function createGrid below
    // valueCache = true / false;
    columnTypes: {
        quarterFigure: {
            cellClass: 'number-cell', aggFunc: 'sum',
            valueFormatter: formatNumber,
            valueParser: function numberParser(params) {
                return Number(params.newValue);
            }
        }
    },
    getRowNodeId: function (data) {
        return data.id;
    },
    suppressAggFuncInHeader: true,
    enableCellChangeFlash: true,
    columnDefs: columnDefs,
    rowData: createRowData(),
    enableColResize: true,
    enableRangeSelection: true,
    groupDefaultExpanded: 1,
    onCellValueChanged: function () {
        console.log('onCellValueChanged');
    }
};

function onValueCache(valueCacheOn) {
    destroyOldGridIfExists();
    createGrid(valueCacheOn);
}

function destroyOldGridIfExists() {
    if (gridOptions.api) {
        console.log('==========> destroying old grid');
        gridOptions.api.destroy();
    }
}

function createGrid(valueCacheOn) {
    console.log('==========> creating grid');
    callCount = 1;
    gridOptions.valueCache = valueCacheOn;

    // then similar to all the other examples, create the grid
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
    gridOptions.onFirstDataRendered = function (params) {
        params.api.sizeColumnsToFit();
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    onValueCache(false);
});
