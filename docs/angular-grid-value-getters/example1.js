
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var thisYear = new Date().getFullYear();

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 150},
        {headerName: "Age", field: "age", width: 90},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Age Now", width: 90, valueGetter: ageNowValueGetter, filter: 'number'},
        {headerName: "Total Medals", width: 90,
            valueGetter: 'data.gold + data.silver + data.bronze'
        }
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
        onReady: function() {
            $scope.gridOptions.api.sizeColumnsToFit()
        }
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRowData(res.data);
        });
});
