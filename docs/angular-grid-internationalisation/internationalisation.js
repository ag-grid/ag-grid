
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        // this row just shows the row index, doesn't use any data from the row
        {headerName: "#", width: 50, cellRenderer: function(params) {
            return params.node.id + 1;
        } },
        {headerName: "Athlete", field: "athlete", width: 150},
        {headerName: "Age", field: "age", width: 90},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Year", field: "year", width: 90, filter: 'number'},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110, filter: 'text'},
        {headerName: "Gold", field: "gold", width: 100},
        {headerName: "Silver", field: "silver", width: 100},
        {headerName: "Bronze", field: "bronze", width: 100},
        {headerName: "Total", field: "total", width: 100}
    ];

    $scope.gridOptions = {
        // note - we do not set 'virtualPaging' here, so the grid knows we are doing standard paging
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        columnDefs: columnDefs,
        showToolPanel: true,
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
            // for number filter and string filter
            filterOoo: 'daFilter...',
            applyFilter: 'daApplyFilter...',
            // for number filter
            equals: 'daEquals',
            lessThan: 'daLessThan',
            greaterThan: 'daGreaterThan',
            // for text filter
            contains: 'daContains',
            startsWith: 'daStarts dawith',
            endsWith: 'daEnds dawith',
            // tool panel
            columns: 'laColumns',
            pivotedColumns: 'laPivot Cols',
            pivotedColumnsEmptyMessage: 'la please drag cols to here',
            valueColumns: 'laValue Cols',
            valueColumnsEmptyMessage: 'la please drag cols to here'
        }
    };

    $http.get("../olympicWinners.json")
        .then(function(result){
            var allOfTheData = result.data;
            var dataSource = {
                //rowCount: ???, - not setting the row count, infinite paging will be used
                pageSize: 500,
                overflowSize: 500,
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

            $scope.gridOptions.api.setDatasource(dataSource);
        });
});
