var columnDefs = [
    // this row just shows the row index, doesn't use any data from the row
    {headerName: '#', cellRenderer: 'rowNodeIdRenderer', checkboxSelection: true, headerCheckboxSelection: true},
    {field: 'athlete', filterParams: {buttons: ['clear', 'reset', 'apply']}},
    {field: 'age', filterParams: {buttons: ['apply', 'cancel']}, enablePivot: true},
    {field: 'country', enableRowGroup: true},
    {field: 'year', filter: 'agNumberColumnFilter'},
    {field: 'date'},
    {
        field: 'sport',
        filter: 'agMultiColumnFilter',
        filterParams: {
            filters: [
                {
                    filter: 'agTextColumnFilter',
                    display: 'accordion'
                },
                {
                    filter: 'agSetColumnFilter',
                    display: 'accordion'
                }
            ]
        }
    },
    {field: 'gold', enableValue: true},
    {field: 'silver', enableValue: true},
    {field: 'bronze', enableValue: true},
    {field: 'total', enableValue: true}
];


var localeText = AG_GRID_LOCALE_ZZZ;

var gridOptions = {
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true
    },
    // note - we do not set 'virtualPaging' here, so the grid knows we are doing standard paging
    components: {
        rowNodeIdRenderer: function (params) {
            return params.node.id + 1;
        }
    },
    columnDefs: columnDefs,
    sideBar: true,
    pagination: true,
    rowGroupPanelShow: 'always',
    statusBar: {
        statusPanels: [
            {statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left'},
            {statusPanel: 'agAggregationComponent'}
        ]
    },
    paginationPageSize: 500,
    enableRangeSelection: true,
    enableCharts: true,
    localeText: localeText
};

function setDataSource(allOfTheData) {
    var dataSource = {
        //rowCount: ???, - not setting the row count, infinite paging will be used
        getRows: function (params) {
            // this code should contact the server for rows. however for the purposes of the demo,
            // the data is generated locally, and a timer is used to give the expereince of
            // an asynchronous call
            console.log('asking for ' + params.startRow + ' to ' + params.endRow);
            setTimeout(function () {
                // take a chunk of the array, matching the start and finish times
                var rowsThisPage = allOfTheData.slice(params.startRow, params.endRow);
                var lastRow = -1;
                // see if we have come to the last page, and if so, return it
                if (allOfTheData.length <= params.endRow) {
                    lastRow = allOfTheData.length;
                }
                params.successCallback(rowsThisPage, lastRow);
            }, 500);
        }
    };
    gridOptions.api.setDatasource(dataSource);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => gridOptions.api.setRowData(data));
});
