var columnSetA = [
    {
        headerName: 'Group A',
        groupId: 'groupA',
        children: [
            { field: 'athlete' },
            { field: 'age' },
            { field: 'country', columnGroupShow: 'open' },
        ],
    },
    {
        headerName: 'Group B',
        children: [
            { field: 'sport' },
            { field: 'year' },
            { field: 'date', columnGroupShow: 'open' }
        ]
    },
    {
        headerName: 'Group C',
        groupId: 'groupC',
        children: [
            { field: 'total' },
            { field: 'gold', columnGroupShow: 'open' },
            { field: 'silver', columnGroupShow: 'open' },
            { field: 'bronze', columnGroupShow: 'open' }
        ],
    }
];

var columnSetB = [
    {
        headerName: 'GROUP A',
        groupId: 'groupA',
        children: [
            { field: 'athlete' },
            { field: 'age' },
            { field: 'country', columnGroupShow: 'open' },
        ],
    },
    {
        headerName: 'Group B',
        children: [
            { field: 'sport' },
            { field: 'year' },
            { field: 'date', columnGroupShow: 'open' }
        ]
    },
    {
        headerName: 'Group C',
        groupId: 'groupC',
        children: [
            { field: 'total' },
            { field: 'gold', columnGroupShow: 'open' },
            { field: 'silver', columnGroupShow: 'open' },
            { field: 'bronze', columnGroupShow: 'open' },
            { field: 'extraA' },
            { field: 'extraB', columnGroupShow: 'open' }
        ],
    }
];

var gridOptions = {
    defaultColDef: {
        initialWidth: 100,
        sortable: true,
        resizable: true
    }
};

function onBtSetA() {
    gridOptions.api.setColumnDefs(columnSetA);
}

function onBtSetB() {
    gridOptions.api.setColumnDefs(columnSetB);
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://www.ag-grid.com/example-assets/olympic-winners.json' })
        .then(function(data) {
            this.onBtSetA();
            gridOptions.api.setRowData(data);
        });
});
