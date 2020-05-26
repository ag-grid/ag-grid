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
        flex: 0,
        resizable: false,
        sortable: false,
        editable: false,
        filter: false
    },
    {
        headerName: 'Participant',
        children: [
            { field: 'athlete', minWidth: 170 },
            { field: 'country', minWidth: 150 }
        ],
    },
    { field: 'sport' },
    {
        headerName: 'Medals',
        children: [
            { field: 'total', columnGroupShow: 'closed', filter: 'agNumberColumnFilter', width: 120, flex: 0 },
            { field: 'gold', columnGroupShow: 'open', filter: 'agNumberColumnFilter', width: 100, flex: 0 },
            { field: 'silver', columnGroupShow: 'open', filter: 'agNumberColumnFilter', width: 100, flex: 0 },
            { field: 'bronze', columnGroupShow: 'open', filter: 'agNumberColumnFilter',  width: 100, flex: 0 },
        ]
    },
    { field: 'year', filter: 'agNumberColumnFilter'}
];

var gridOptions = {
    rowData: null,
    columnDefs: columnDefs,
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    multiSortKey: 'ctrl',
    rowDeselection: true,
    defaultColDef: {
        editable: true,
        sortable: true,
        minWidth: 100,
        filter: true,
        resizable: true,
        floatingFilter: true,
        flex: 1
    },
    sideBar: {
        toolPanels: ['filters'],
        defaultToolPanel: ''
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
