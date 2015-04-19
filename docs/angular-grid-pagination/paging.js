
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        // this row just shows the row index, doesn't use any data from the row
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
        // note - we do not set 'virtualPaging' here, so the grid knows we are doing standard paging
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        columnDefs: columnDefs
    };

    $http.get("../olympicWinners.json")
        .then(function(result){
            var allOfTheData = result.data;
            var dataSource = {
                //rowCount: ???, - not setting the row count, infinite paging will be used
                pageSize: 500,
                overflowSize: 500,
                getRows: function (start, finish, callbackSuccess, callbackFail) {
                    // this code should contact the server for rows. however for the purposes of the demo,
                    // the data is generated locally, and a timer is used to give the expereince of
                    // an asynchronous call
                    console.log('asking for ' + start + ' to ' + finish);
                    setTimeout( function() {
                        // take a chunk of the array, matching the start and finish times
                        var rowsThisPage = allOfTheData.slice(start, finish);
                        var lastRow = -1;
                        // see if we have come to the last page, and if so, return it
                        if (allOfTheData.length <= finish) {
                            lastRow = allOfTheData.length;
                        }
                        callbackSuccess(rowsThisPage, lastRow);
                    }, 500);
                }
            };

            $scope.gridOptions.api.setDatasource(dataSource);
        });
});
