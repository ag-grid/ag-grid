var columnDefs = [
    {
        headerName: "Athlete", field: "athlete", rowGroupIndex: 1, hide: true
    },
    {
        headerName: "Age", field: "age", width: 90, enableValue: true,
        icons: {
            // not very useful, but demonstrates you can just have strings
            sortAscending: 'U',
            sortDescending: 'D'
        }
    },
    {
        headerName: "Country", field: "country", width: 120, rowGroupIndex: 0,
        icons: {
            sortAscending: '<i class="fa fa-sort-alpha-asc"/>',
            sortDescending: '<i class="fa fa-sort-alpha-desc"/>'
        }
    },
    {
        headerName: "Year", field: "year", width: 90, enableRowGroup: true
    },
    {headerName: "Date", field: "date", width: 110},
    {
        headerName: "Sport", field: "sport", width: 110,
        icons: {
            sortAscending: function () {
                return 'ASC';
            },
            sortDescending: function () {
                return 'DESC';
            }
        }
    },
    {headerName: "Gold", field: "gold", width: 100},
    {headerName: "Silver", field: "silver", width: 100},
    {headerName: "Bronze", field: "bronze", width: 100},
    {headerName: "Total", field: "total", width: 100}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    showToolPanel: true,
    enableSorting: true,
    enableFilter: true,
    floatingFilter: true,
    enableColResize: true,
    autoGroupColumnDef: {
        headerName: "Athlete", field: "athlete", width: 180,
        // use font awesome for first col, with numbers for sort
        icons: {
            menu: '<i class="fa fa-shower"/>',
            filter: '<i class="fa fa-long-arrow-up"/>',
            columns: '<i class="fa fa-snowflake-o"/>',
            sortAscending: '<i class="fa fa-sort-alpha-asc"/>',
            sortDescending: '<i class="fa fa-sort-alpha-desc"/>'
        },
        cellRendererParams: {
            checkbox: true
        },
        headerCheckboxSelection: true
    },
    // override all the defaults with font awesome
    icons: {
        // use font awesome for menu icons
        menu: '<i class="fa fa-bath" style="width: 10px"/>',
        filter: '<i class="fa fa-long-arrow-down"/>',
        columns: '<i class="fa fa-handshake-o"/>',
        sortAscending: '<i class="fa fa-long-arrow-down"/>',
        sortDescending: '<i class="fa fa-long-arrow-up"/>',
        // use some strings from group
        groupExpanded: '<img src="https://cdn.rawgit.com/ag-grid/ag-grid-docs/56853d5aa6513433f77ac3f808a4681fdd21ea1d/src/javascript-grid-icons/minus.png" style="width: 12px;padding-right: 2px"/>',
        groupContracted: '<img src="https://cdn.rawgit.com/ag-grid/ag-grid-docs/56853d5aa6513433f77ac3f808a4681fdd21ea1d/src/javascript-grid-icons/plus.png" style="width: 12px;padding-right: 2px"/>',
        columnMovePin: '<i class="fa fa-hand-grab-o"/>',
        columnMoveAdd: '<i class="fa fa-plus-square-o"/>',
        columnMoveHide: '<i class="fa fa-remove"/>',
        columnMoveMove: '<i class="fa fa-chain"/>',
        columnMoveLeft: '<i class="fa fa-arrow-left"/>',
        columnMoveRight: '<i class="fa fa-arrow-right"/>',
        columnMoveGroup: '<i class="fa fa-group"/>',
        rowGroupPanel: '<i class="fa fa-bank"/>',
        pivotPanel: '<i class="fa fa-magic"/>',
        valuePanel: '<i class="fa fa-magnet"/>',
        menuPin: 'P', // just showing letters, no graphic
        menuValue: 'V',
        menuAddRowGroup: 'A',
        menuRemoveRowGroup: 'R',
        clipboardCopy: '>>',
        clipboardPaste: '>>',
        checkboxChecked: '<i class="fa fa-check-square-o"/>',
        checkboxUnchecked: '<i class="fa fa-square-o"/>',
        checkboxIndeterminate: '<i class="fa fa-circle-o"/>'
    },
    rowSelection: 'multiple'
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
