var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150, filterParams:{newRowsAction: 'keep'},
        checkboxSelection: function (params) {
            // we put checkbox on the name if we are not doing grouping
            return params.columnApi.getRowGroupColumns().length === 0;
        },
        headerCheckboxSelection: function (params) {
            // we put checkbox on the name if we are not doing grouping
            return params.columnApi.getRowGroupColumns().length === 0;
        },
    },
    {headerName: "Age", field: "age", width: 90, filterParams:{newRowsAction: 'keep'}},
    {headerName: "Country", field: "country", width: 120, filterParams:{newRowsAction: 'keep'}},
    {headerName: "Year", field: "year", width: 90, filterParams:{newRowsAction: 'keep'}},
    {headerName: "Date", field: "date", width: 110, filterParams:{newRowsAction: 'keep'}},
    {headerName: "Sport", field: "sport", width: 110, filterParams:{newRowsAction: 'keep'}},
    {headerName: "Gold", field: "gold", width: 100, filterParams:{newRowsAction: 'keep'}},
    {headerName: "Silver", field: "silver", width: 100, filterParams:{newRowsAction: 'keep'}},
    {headerName: "Bronze", field: "bronze", width: 100, filterParams:{newRowsAction: 'keep'}},
    {headerName: "Total", field: "total", width: 100, filterParams:{newRowsAction: 'keep'}}
];

var groupColumn = {
    headerName: "Group",
    width: 200,
    field: 'athlete',
    valueGetter: function(params) {
        if (params.node.group) {
            return params.node.key;
        } else {
            return params.data[params.colDef.field];
        }
    },
    headerCheckboxSelection: true,
    // headerCheckboxSelectionFilteredOnly: true,
    comparator: agGrid.defaultGroupComparator,
    cellRenderer: 'group',
    cellRendererParams: {
        checkbox: true
    }
};

var gridOptions = {
    floatingFilter:true,
    // note - we do not set 'virtualPaging' here, so the grid knows we are doing standard paging
    enableSorting: true,
    enableFilter: true,
    suppressRowClickSelection: true,
    groupSelectsChildren: true,
    debug: true,
    rowSelection: 'multiple',
    enableColResize: true,
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    enableRangeSelection: true,
    columnDefs: columnDefs,
    paginationPageSize: 10,
    rowModelType: 'clientPagination',
    groupColumnDef: groupColumn,
    defaultColDef:{
        editable: true,
        enableRowGroup:true,
        enablePivot:true,
        enableValue:true
    }
};

function onPageSizeChanged(newPageSize) {
    this.gridOptions.api.paginationSetPageSize (Number(newPageSize));
}

// when json gets loaded, it's put here, and  the datasource reads in from here.
// in a real application, the page will be got from the server.
var allOfTheData;

function createNewDatasource() {
    if (!allOfTheData) {
        // in case user selected 'onPageSizeChanged()' before the json was loaded
        return;
    }

    var dataSource = {
        //rowCount: ???, - not setting the row count, infinite paging will be used
        getRows: function (params) {
            // this code should contact the server for rows. however for the purposes of the demo,
            // the data is generated locally, a timer is used to give the experience of
            // an asynchronous call
            console.log('asking for ' + params.startRow + ' to ' + params.endRow);
            setTimeout( function() {
                // take a chunk of the array, matching the start and finish times
                var rowsThisPage = allOfTheData.slice(params.startRow, params.endRow);
                // see if we have come to the last page. if we have, set lastRow to
                // the very last row of the last page. if you are getting data from
                // a server, lastRow could be returned separately if the lastRow
                // is not in the current page.
                var lastRow = -1;
                if (allOfTheData.length <= params.endRow) {
                    lastRow = allOfTheData.length;
                }
                params.successCallback(rowsThisPage, lastRow);
            }, 500);
        }
    };

    gridOptions.api.setDatasource(dataSource);
}

function setRowData(rowData) {
    allOfTheData = rowData;
    createNewDatasource();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '../olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
