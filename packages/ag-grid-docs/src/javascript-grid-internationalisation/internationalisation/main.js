var columnDefs = [
    // this row just shows the row index, doesn't use any data from the row
    {headerName: "#", width: 50, cellRenderer:  'rowNodeIdRenderer'},
    {headerName: "Athlete", field: "athlete", width: 150},
    {headerName: "Age", field: "age", width: 90},
    {headerName: "Country", field: "country", width: 120},
    {headerName: "Year", field: "year", width: 90, filter: 'agNumberColumnFilter'},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110, filter: 'agTextColumnFilter'},
    {headerName: "Gold", field: "gold", width: 100},
    {headerName: "Silver", field: "silver", width: 100},
    {headerName: "Bronze", field: "bronze", width: 100, enableRowGroup: true, enablePivot: true, enableValue:true, pivot: true},
    {headerName: "Total", field: "total", width: 100}
];

var gridOptions = {
    // note - we do not set 'virtualPaging' here, so the grid knows we are doing standard paging
    components:{
        rowNodeIdRenderer: function(params) {
            return params.node.id + 1;
        }
    },
    enableSorting: true,
    enableFilter: true,
    enableColResize: true,
    columnDefs: columnDefs,
    sideBar: true,
    pagination:true,
    rowGroupPanelShow: 'always',
    statusBar: {
        items: [
            { component: 'agAggregationComponent' }
        ]
    },
    paginationPageSize: 500,
    enableRangeSelection: true,
    localeText: {
        // for filter panel
        page: 'daPage',
        more: 'daMore',
        to: 'daTo',
        of: 'daOf',
        next: 'daNexten',
        last: 'daLasten',
        first: 'daFirsten',
        previous: 'daPreviousen',
        loadingOoo: 'daLoading...',

        // for set filter
        selectAll: 'daSelect Allen',
        searchOoo: 'daSearch...',
        blanks: 'daBlanc',

        // for number filter and text filter
        filterOoo: 'daFilter...',
        applyFilter: 'daApplyFilter...',
        equals: 'daEquals',
        notEqual: 'daNotEqual',

        // for number filter
        lessThan: 'daLessThan',
        greaterThan: 'daGreaterThan',
        lessThanOrEqual: 'daLessThanOrEqual',
        greaterThanOrEqual: 'daGreaterThanOrEqual',
        inRange: 'daInRange',

        // for text filter
        contains: 'daContains',
        notContains: 'daNotContains',
        startsWith: 'daStarts dawith',
        endsWith: 'daEnds dawith',

        // the header of the default group column
        group: 'laGroup',

        // tool panel
        columns: 'laColumns',
        filters: 'laFilters',
        rowGroupColumns: 'laPivot Cols',
        rowGroupColumnsEmptyMessage: 'la drag cols to group',
        valueColumns: 'laValue Cols',
        pivotMode: 'laPivot-Mode',
        groups: 'laGroups',
        values: 'laValues',
        pivots: 'laPivots',
        valueColumnsEmptyMessage: 'la drag cols to aggregate',
        pivotColumnsEmptyMessage: 'la drag here to pivot',
        toolPanelButton: 'la tool panel',

        // other
        noRowsToShow: 'la no rows',

        // enterprise menu
        pinColumn: 'laPin Column',
        valueAggregation: 'laValue Agg',
        autosizeThiscolumn: 'laAutosize Diz',
        autosizeAllColumns: 'laAutsoie em All',
        groupBy: 'laGroup by',
        ungroupBy: 'laUnGroup by',
        resetColumns: 'laReset Those Cols',
        expandAll: 'laOpen-em-up',
        collapseAll: 'laClose-em-up',
        toolPanel: 'laTool Panelo',
        export: 'laExporto',
        csvExport: 'la CSV Exportp',
        excelExport: 'la Excel Exporto',

        // enterprise menu pinning
        pinLeft: 'laPin &lt;&lt;',
        pinRight: 'laPin &gt;&gt;',
        noPin: 'laDontPin &lt;&gt;',

        // enterprise menu aggregation and status bar
        sum: 'laSum',
        min: 'laMin',
        max: 'laMax',
        none: 'laNone',
        count: 'laCount',
        average: 'laAverage',

        // standard menu
        copy: 'laCopy',
        copyWithHeaders: 'laCopy Wit hHeaders',
        ctrlC: 'ctrl n C',
        paste: 'laPaste',
        ctrlV: 'ctrl n V'
    }
};

function setDataSource(allOfTheData) {
    var dataSource = {
        //rowCount: ???, - not setting the row count, infinite paging will be used
        getRows: function (params) {
            // this code should contact the server for rows. however for the purposes of the demo,
            // the data is generated locally, and a timer is used to give the expereince of
            // an asynchronous call
            console.log('asking for ' + params.startRow + ' to ' + params.endRow);
            setTimeout( function() {
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
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});