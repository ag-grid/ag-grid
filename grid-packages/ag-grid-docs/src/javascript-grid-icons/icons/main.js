var columnDefs = [
    {
        field: 'athlete', rowGroup: true, hide: true
    },
    {
        field: 'age',
        width: 90,
        enableValue: true,
        icons: {
            // not very useful, but demonstrates you can just have strings
            sortAscending: 'U',
            sortDescending: 'D'
        }
    },
    {
        field: 'country',
        width: 150,
        rowGroupIndex: 0,
        icons: {
            sortAscending: '<i class="fa fa-sort-alpha-up"/>',
            sortDescending: '<i class="fa fa-sort-alpha-down"/>'
        }
    },
    { field: 'year', width: 90, enableRowGroup: true },
    { field: 'date' },
    {
        field: 'sport',
        width: 110,
        icons: {
            sortAscending: function() {
                return 'ASC';
            },
            sortDescending: function() {
                return 'DESC';
            }
        }
    },
    { field: 'gold', width: 100 },
    { field: 'silver', width: 100 },
    { field: 'bronze', width: 100 },
    { field: 'total', width: 100 }
];

var gridOptions = {
    defaultColDef: {
        width: 150,
        sortable: true,
        resizable: true,
        filter: true,
        floatingFilter: true,
    },
    columnDefs: columnDefs,
    rowData: null,
    showToolPanel: true,
    autoGroupColumnDef: {
        headerName: 'Athlete',
        field: 'athlete',
        rowDrag: true,
        // use font awesome for first col, with numbers for sort
        icons: {
            menu: '<i class="fa fa-shower"/>',
            filter: '<i class="fa fa-long-arrow-alt-up"/>',
            columns: '<i class="fa fa-snowflake"/>',
            sortAscending: '<i class="fa fa-sort-alpha-up"/>',
            sortDescending: '<i class="fa fa-sort-alpha-down"/>'
        },
        headerCheckboxSelection: true,
        width: 300
    },
    // override all the defaults with font awesome
    icons: {
        // use font awesome for menu icons
        menu: '<i class="fa fa-bath" style="width: 10px"/>',
        filter: '<i class="fa fa-long-arrow-alt-down"/>',
        columns: '<i class="fa fa-handshake"/>',
        sortAscending: '<i class="fa fa-long-arrow-alt-down"/>',
        sortDescending: '<i class="fa fa-long-arrow-alt-up"/>',
        // use some strings from group
        groupExpanded: '<img src="https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/javascript-grid-icons/minus.png" style="height: 12px; width: 12px;padding-right: 2px"/>',
        groupContracted: '<img src="https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/javascript-grid-icons/plus.png" style="height: 12px; width: 12px;padding-right: 2px"/>',
        columnMovePin: '<i class="far fa-hand-rock"/>',
        columnMoveAdd: '<i class="fa fa-plus-square"/>',
        columnMoveHide: '<i class="fa fa-times"/>',
        columnMoveMove: '<i class="fa fa-link"/>',
        columnMoveLeft: '<i class="fa fa-arrow-left"/>',
        columnMoveRight: '<i class="fa fa-arrow-right"/>',
        columnMoveGroup: '<i class="fa fa-users"/>',
        rowGroupPanel: '<i class="fa fa-university"/>',
        pivotPanel: '<i class="fa fa-magic"/>',
        valuePanel: '<i class="fa fa-magnet"/>',
        menuPin: 'P', // just showing letters, no graphic
        menuValue: 'V',
        menuAddRowGroup: 'A',
        menuRemoveRowGroup: 'R',
        clipboardCopy: '>>',
        clipboardPaste: '>>',
        rowDrag: '<i class="fa fa-circle"/>'
    },
    rowSelection: 'multiple'
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
