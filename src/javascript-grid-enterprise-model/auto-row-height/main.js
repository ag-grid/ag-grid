var columnDefs = [
    {
        field: 'group',
        rowGroup: true,
        cellClass: 'cell-wrap-text',
        hide: true
    },
    {
        field: 'autoA',
        cellClass: 'cell-wrap-text',
        autoHeight: true,
        width: 300
    },
    {
        field: 'autoB',
        cellClass: 'cell-wrap-text',
        autoHeight: true,
        width: 300
    },
    {
        field: 'autoC',
        cellClass: 'cell-wrap-text',
        autoHeight: true,
        width: 300
    }
];

var gridOptions = {
    defaultColDef: {
        width: 100
    },
    columnDefs: columnDefs,
    enableColResize: true,
    rowModelType: 'enterprise',
    animateRows: true,
    enterpriseDatasource: new SimpleDatasource(),
    icons: {
        groupLoading: '<img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/javascript-grid-enterprise-model/spinner.gif" style="width:22px;height:22px;">'
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
