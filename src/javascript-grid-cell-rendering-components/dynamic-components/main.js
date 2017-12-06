var columnDefs = [
    {
        headerName: "Row",
        field: "row",
        width: 150
    },
    {
        headerName: "Square",
        field: "value",
        cellRenderer: 'squareRenderer',
        editable: true,
        colId: "square",
        width: 150
    },
    {
        headerName: "Cube",
        field: "value",
        cellRenderer: 'cubeRenderer',
        colId: "cube",
        width: 150
    },
    {
        headerName: "Row Params",
        field: "row",
        cellRenderer: 'paramsRenderer',
        colId: "params",
        width: 150
    },
    {
        headerName: "Currency (Pipe)",
        field: "currency",
        cellRenderer: 'currencyRenderer',
        colId: "currency",
        width: 100
    },
    {
        headerName: "Child/Parent",
        field: "value",
        cellRenderer: 'childMessageRenderer',
        colId: "params",
        width: 180
    }
];

function createRowData() {
    var rowData = [];

    for (var i = 0; i < 15; i++) {
        rowData.push({
            row: "Row " + i,
            value: i,
            currency: i + Number(Math.random().toFixed(2))
        });
    }

    return rowData;
}

function refreshEvenRowsCurrencyData() {
    gridOptions.api.forEachNode(rowNode => {
        if (rowNode.data.value % 2 === 0) {
            rowNode.setDataValue('currency', rowNode.data.value + Number(Math.random().toFixed(2)))
        }
    });

    gridOptions.api.refreshCells({
        columns: ['currency']
    })
}

// inScope[methodFromParent]
function methodFromParent(cell) {
    alert('Parent Component Method from ' + cell + '!');
}

var gridOptions = {
    columnDefs: columnDefs,
    rowData: createRowData(),
    context: {
        componentParent: this
    },
    components: {
        squareRenderer: SquareRenderer,
        cubeRenderer: CubeRenderer,
        paramsRenderer: ParamsRenderer,
        currencyRenderer: CurrencyRenderer,
        childMessageRenderer: ChildMessageRenderer
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
    gridOptions.api.sizeColumnsToFit();
});
