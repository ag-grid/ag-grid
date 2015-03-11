
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope) {

    var columnDefs = [
        {displayName: "Make", field: "make"},
        {displayName: "Model", field: "model"},
        {displayName: "Price", field: "price"}
    ];

    var rowData = [
        {make: "Toyota", model: "Celica", price: 35000},
        {make: "Ford", model: "Mondeo", price: 32000},
        {make: "Porsche", model: "Boxter", price: 72000}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData,
        dontUseScrolls: true // because so little data, no need to use scroll bars
    };

});