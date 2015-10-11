
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {
            headerName: "SelectionWithID",
            checkboxSelection: true,
            checkboxSelectionIdGetter: function (data) {
                return 'customID_' + data.node.data.make + '_' + data.rowIndex;
            }
        },
        {headerName: "Make", field: "make"},
        {headerName: "Model", field: "model"}
    ];

    var rowData = [
        {make: "Toyota", model: "Celica", price: 35000},
        {make: "Ford", model: "Mondeo", price: 32000},
        {make: "Porsche", model: "Boxter", price: 72000}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowSelection: 'multiple',
        rowData: rowData
    };
});
