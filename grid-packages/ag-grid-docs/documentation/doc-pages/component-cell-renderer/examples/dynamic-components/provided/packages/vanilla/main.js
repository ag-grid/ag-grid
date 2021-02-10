const columnDefs = [
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
        width: 120
    },
    {
        headerName: "Child/Parent",
        field: "value",
        cellRenderer: 'childMessageRenderer',
        colId: "params",
        editable: false,
        minWidth: 150
    }
];

const createRowData = () => {
    const rowData = [];

    for (let i = 0; i < 15; i++) {
        rowData.push({
            row: "Row " + i,
            value: i,
            currency: i + Number(Math.random().toFixed(2))
        });
    }

    return rowData;
}

const refreshEvenRowsCurrencyData = () => {
    gridOptions.api.forEachNode(rowNode => {
        if (rowNode.data.value % 2 === 0) {
            rowNode.setDataValue('currency', rowNode.data.value + Number(Math.random().toFixed(2)));
        }
    });

    gridOptions.api.refreshCells({
        columns: ['currency']
    })
}

const methodFromParent = (cell) => {
    alert('Parent Component Method from ' + cell + '!');
}

const gridOptions = {
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
    },
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
