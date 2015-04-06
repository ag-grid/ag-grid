
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {displayName: "Athlete", field: "athlete", width: 200},
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
        rowData: null,
        groupUseEntireRow: false,
        groupKeys: ['country'],
        groupAggFunction: groupAggFunction
    };

    function groupAggFunction(nodes) {

        var sums = {
            gold: 0,
            silver: 0,
            bronze: 0,
            total: 0
        };

        nodes.forEach(function(node) {
            var data = node.data;
            sums.gold += data.gold;
            sums.silver += data.silver;
            sums.bronze += data.bronze;
            sums.total += data.total;
        });

        return sums;
    }

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });
});
