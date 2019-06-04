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
            sortAscending: '<i class="fa fa-sort-alpha-up"/>',
            sortDescending: '<i class="fa fa-sort-alpha-down"/>'
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
    defaultColDef: {
        sortable: true,
        resizable: true,
        filter: true
    },
    columnDefs: columnDefs,
    rowData: null,
    showToolPanel: true,
    floatingFilter: true,
    autoGroupColumnDef: {
        headerName: "Athlete",
        field: "athlete",
        rowDrag: true,
        // use font awesome for first col, with numbers for sort
        icons: {
            menu: '<i class="fa fa-shower"/>',
            filter: '<i class="fa fa-long-arrow-alt-up"/>',
            columns: '<i class="fa fa-snowflake"/>',
            sortAscending: '<i class="fa fa-sort-alpha-up"/>',
            sortDescending: '<i class="fa fa-sort-alpha-down"/>'
        },
        cellRendererParams: {
            checkbox: true
        },
        headerCheckboxSelection: true,
        width: 250
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
        groupExpanded: '<img src="https://cdn.rawgit.com/ag-grid/ag-grid-docs/56853d5aa6513433f77ac3f808a4681fdd21ea1d/src/javascript-grid-icons/minus.png" style="height: 12px; width: 12px;padding-right: 2px"/>',
        groupContracted: '<img src="https://cdn.rawgit.com/ag-grid/ag-grid-docs/56853d5aa6513433f77ac3f808a4681fdd21ea1d/src/javascript-grid-icons/plus.png" style="height: 12px; width: 12px;padding-right: 2px"/>',
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
        checkboxChecked: '<i class="far fa-check-square"/>',
        checkboxUnchecked: '<i class="far fa-square"/>',
        checkboxIndeterminate: '<i class="far fa-circle"/>',
        checkboxCheckedReadOnly: '<i class="far fa-check-square" style="color: lightgray"/>',
        checkboxUncheckedReadOnly: '<i class="far fa-square" style="color: lightgray" />',
        checkboxIndeterminateReadOnly: '<i class="far fa-circle" style="color: lightgray"/>',
        rowDrag: '<i class="fa fa-circle"/>'
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
