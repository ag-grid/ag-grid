
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 150},
        {headerName: "Age", field: "age", width: 90, filter: 'number'},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Gold", field: "gold", width: 100, filter: 'number'},
        {headerName: "Silver", field: "silver", width: 100, filter: 'number'},
        {headerName: "Bronze", field: "bronze", width: 100, filter: 'number'},
        {headerName: "Total", field: "total", width: 100, filter: 'number'}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        enableFilter: true,
        isExternalFilterPresent: isExternalFilterPresent,
        doesExternalFilterPass: doesExternalFilterPass
    };

    function isExternalFilterPresent() {
        // if ageType is not everyone, then we are filtering
        return $scope.ageType != 'everyone';
    }

    function doesExternalFilterPass(node) {
        switch ($scope.ageType) {
            case 'below30': return node.data.age < 30;
            case 'between30and50': return node.data.age >= 30 && node.data.age <= 50;
            case 'above50': return node.data.age > 50;
            default: return true;
        }
    }

    $scope.ageType = 'everyone';

    $scope.externalFilterChanged = function () {
        // inform the grid that it needs to filter the data
        $scope.gridOptions.api.onFilterChanged();
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRowData(res.data);
        });
});
