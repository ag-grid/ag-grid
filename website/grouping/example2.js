
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {displayName: "Athlete", field: "athlete", width: 200, cellStyle: {'padding-left': '40px'} },
        {displayName: "Gold", field: "gold", width: 100},
        {displayName: "Silver", field: "silver", width: 100},
        {displayName: "Bronze", field: "bronze", width: 100},
        {displayName: "Total", field: "total", width: 100},
        {displayName: "Age", field: "age", width: 90},
        {displayName: "Country", field: "country", width: 120},
        {displayName: "Year", field: "year", width: 90},
        {displayName: "Date", field: "date", width: 110},
        {displayName: "Sport", field: "sport", width: 110}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: [],
        groupUseEntireRow: false,
        groupKeys: ['country'],
        groupAggFunction: groupAggFunction
    };

    function groupAggFunction(rows) {

        var sums = {
            gold: 0,
            silver: 0,
            bronze: 0,
            total: 0
        };

        rows.forEach(function(row) {
            sums.gold += row.gold;
            sums.silver += row.silver;
            sums.bronze += row.bronze;
            sums.total += row.total;
        });

        return sums;
    }

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });
});
