
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        // this row shows the row index, doesn't use any data from the row
        {displayName: "#", width: 50, cellRenderer: function(params) {
            return params.node.id + 1;
        } },
        {displayName: "Athlete", field: "athlete", width: 150},
        {displayName: "Age", field: "age", width: 90},
        {displayName: "Country", field: "country", width: 120},
        {displayName: "Year", field: "year", width: 90},
        {displayName: "Date", field: "date", width: 110},
        {displayName: "Sport", field: "sport", width: 110},
        {displayName: "Gold", field: "gold", width: 100},
        {displayName: "Silver", field: "silver", width: 100},
        {displayName: "Bronze", field: "bronze", width: 100},
        {displayName: "Total", field: "total", width: 100}
    ];

    $scope.gridOptions = {
        enableColResize: true,
        virtualPaging: true, // this is important, if not set, normal paging will be done
        rowSelection: 'single',
        rowDeselection: true,
        columnDefs: columnDefs
    };

    $http.get("../olympicWinners.json")
        .then(function(result){
            var allOfTheData = result.data;
            var dataSource = {
                rowCount: null, // behave as infinite scroll
                pageSize: 100,
                overflowSize: 100,
                maxConcurrentRequests: 2,
                maxPagesInCache: 2,
                getRows: function (start, finish, callbackSuccess, callbackFail) {
                    console.log('asking for ' + start + ' to ' + finish);
                    // At this point in your code, you would call the server, using $http if in AngularJS.
                    // To make the demo look real, wait for 500ms before returning
                    setTimeout( function() {
                        // take a slice of the total rows
                        var rowsThisPage = allOfTheData.slice(start, finish);
                        // if on or after the last page, work out the last row.
                        var lastRow = -1;
                        if (allOfTheData.length <= finish) {
                            lastRow = allOfTheData.length;
                        }
                        // call the success callback
                        callbackSuccess(rowsThisPage, lastRow);
                    }, 500);
                }
            };

            $scope.gridOptions.api.setDatasource(dataSource);
        });
});
