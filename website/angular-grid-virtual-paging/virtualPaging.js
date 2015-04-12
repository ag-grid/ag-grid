
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
        //enableSorting: true,
        //enableFilter: true,
        enableColResize: true,
        virtualPaging: true,
        columnDefs: columnDefs
    };

    $http.get("../olympicWinners.json")
        .then(function(result){
            var allOfTheData = result.data;
            //var allOfTheData = simpleData;
            //wait for a second before setting the results into the table
            var dataSource = {
                //rowCount: allOfTheData.length,
                pageSize: 50,
                overflowSize: 500,
                maxConcurrentRequests: 2,
                maxPagesInCache: 2,
                getRows: function (start, finish, callbackSuccess, callbackFail) {
                    console.log('asking for ' + start + ' to ' + finish);
                    setTimeout( function() {
                        var rowsThisPage = allOfTheData.slice(start, finish);
                        var lastRow = -1;
                        if (allOfTheData.length <= finish) {
                            lastRow = allOfTheData.length;
                        }
                        callbackSuccess(rowsThisPage, lastRow);
                    }, 500);
                }
            };

            $scope.gridOptions.api.setDatasource(dataSource);
            //$scope.gridOptions.api.setRows(result.data);
        });
});
