var columnDefs = [
    { 
        headerName: ' ',
        headerCheckboxSelection: true,
        checkboxSelection: true,
        floatingFilter: false, 
        suppressMenu: true,
        minWidth: 50,
        maxWidth: 50,
        width: 50,
        resizable: false,
        sortable: false,
        editable: false
    },
    {
        headerName: 'Participant',
        children: [
            { field: 'athlete', minWidth: 170 },
            { field: 'country' }
        ],
    },
    { field: 'year', filter: 'agNumberColumnFilter' },
    { field: 'sport' },
    {
        headerName: 'Medals',
        children: [
            { field: 'total', columnGroupShow: 'closed', filter: 'agNumberColumnFilter' },
            { field: 'gold', columnGroupShow: 'open', filter: 'agNumberColumnFilter' },
            { field: 'silver', columnGroupShow: 'open', filter: 'agNumberColumnFilter' },
            { field: 'bronze', columnGroupShow: 'open', filter: 'agNumberColumnFilter' },
        ]
    }
];

var gridOptions = {
    rowData: null,
    columnDefs: columnDefs,
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    rowDeselection: true,
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true,
        floatingFilter: true
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({ url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json' })
        .then(function(data) {
            gridOptions.api.setRowData(data);
        });
});
