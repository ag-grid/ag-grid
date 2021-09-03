var gridOptions = {
    columnDefs: [
        { field: 'symbol' },
        {
            field: 'shortName',
            headerName: 'Name',
        },
        {
            field: 'history',
            headerName: 'Close History',
            minWidth: 100,
            cellRenderer: 'agSparklineCellRenderer',
            cellRendererParams: {
                sparklineOptions: { type: 'area' },
            },
        },
        {
            field: 'regularMarketDayHigh',
        },
        {
            field: 'regularMarketDayLow',
        }
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        resizable: true,
    },
    rowData: generateRowData()
};

function updateData() {
    const itemsToUpdate = [];
    gridOptions.api.forEachNodeAfterFilterAndSort(function (rowNode, index) {
        let data = rowNode.data;
        const n = data.history.length;
        data.history = [...data.history.slice(1, n), randomNumber(0, 10)];
        itemsToUpdate.push(data);
    });
    gridOptions.api.applyTransaction({ update: itemsToUpdate });
}

function updateSparklineType(type, el) {
    const toggleButtons = document.getElementsByClassName('toggle-button');

    for (const b of toggleButtons) {
        b.setAttribute('class', 'toggle-button');
    }
    el.setAttribute('class', 'toggle-button active');

    gridOptions.columnDefs[2].cellRendererParams.sparklineOptions.type = type;
    gridOptions.api.setColumnDefs(gridOptions.columnDefs);
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function addSparklineData(data) {
    data.forEach(function (d) {
        d.results = [];
        for (let i = 0; i < NUM_VALUES; i++) {
            d.results.push(randomNumber(1, 10));
        }
    });
    return data;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
