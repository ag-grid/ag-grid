
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {displayName: "Make", field: "make"},
        {displayName: "Model", field: "model"},
        {displayName: "Price", field: "price"}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: [],
        enableSorting: true
    };

    $http.get("../sampleData.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });
});
