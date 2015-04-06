
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
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
        columnDefs: columnDefs
    };

    $http.get("../olympicWinners.json")
        .then(function(result){
            var allOfTheData = result.data;
            // wait for a second before setting the results into the table
            var dataSource = {
                rowCount: allOfTheData.length,
                pageSize: 100,
                getRows: function (start, finish, callbackSuccess, callbackFail) {
                    setTimeout( function() {
                        var rowsThisPage = allOfTheData.slice(start, finish);
                        callbackSuccess(rowsThisPage);
                    }, 1000);
                }
            };
            $scope.gridOptions.api.onNewDataSource(dataSource);
        });
});
