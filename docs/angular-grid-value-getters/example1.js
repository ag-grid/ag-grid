
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var thisYear = new Date().getFullYear();

    var columnDefs = [
        {displayName: "Athlete", field: "athlete", width: 150},
        {displayName: "Age", field: "age", width: 90},
        {displayName: "Year", field: "year", width: 90},
        {displayName: "Age Now", width: 90, valueGetter: ageNowValueGetter},
        {displayName: "Total Medals", width: 90,
            valueGetter: 'data.gold + data.silver + data.bronze'
        }
        //{displayName: "Country", field: "country", width: 120},
        //{displayName: "Date", field: "date", width: 110},
        //{displayName: "Sport", field: "sport", width: 110},
        //{displayName: "Gold", field: "gold", width: 100},
        //{displayName: "Silver", field: "silver", width: 100},
        //{displayName: "Bronze", field: "bronze", width: 100},
        //{displayName: "Total", field: "total", width: 100}
    ];

    function ageNowValueGetter(params) {
        return thisYear - params.data.year + params.data.age;
    }

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        ready: function() {
            $scope.gridOptions.api.sizeColumnsToFit()
        }
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });
});
