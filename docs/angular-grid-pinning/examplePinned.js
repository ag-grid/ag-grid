
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    $scope.jumpToColText = null;
    $scope.jumpToRowText = null;

    var columnDefs = [
        {headerName: "#", valueGetter: "node.id", width: 40, pinned: 'left'},
        {headerName: "Athlete", field: "athlete", width: 150, pinned: 'left'},
        {headerName: "Age", field: "age", width: 90, pinned: 'left'},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Gold", field: "gold", width: 100},
        {headerName: "Silver", field: "silver", width: 100},
        {headerName: "Bronze", field: "bronze", width: 100},
        {headerName: "Total", field: "total", width: 100, pinned: 'right'}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        debug: true,
        rowData: null
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRowData(res.data);
        });

    $scope.clearPinned = function() {
        $scope.gridOptions.columnApi.setColumnPinned('athlete', null);
        $scope.gridOptions.columnApi.setColumnPinned('age', null);
        $scope.gridOptions.columnApi.setColumnPinned('country', null);
        $scope.gridOptions.columnApi.setColumnPinned('total', null);
    };

    $scope.resetPinned = function() {
        $scope.gridOptions.columnApi.setColumnPinned('athlete', 'left');
        $scope.gridOptions.columnApi.setColumnPinned('age', 'left');
        $scope.gridOptions.columnApi.setColumnPinned('country', null);
        $scope.gridOptions.columnApi.setColumnPinned('total', 'right');
    };

    $scope.pinCountry = function() {
        $scope.gridOptions.columnApi.setColumnPinned('athlete', null);
        $scope.gridOptions.columnApi.setColumnPinned('age', null);
        $scope.gridOptions.columnApi.setColumnPinned('country', 'left');
        $scope.gridOptions.columnApi.setColumnPinned('total', null);
    };

    $scope.jumpToCol = function() {
        var index = Number($scope.jumpToColText);
        if (typeof index === 'number' && !isNaN(index)) {
            $scope.gridOptions.api.ensureColIndexVisible(index);
        }
    };

    $scope.jumpToRow = function() {
        var index = Number($scope.jumpToRowText);
        if (typeof index === 'number' && !isNaN(index)) {
            $scope.gridOptions.api.ensureIndexVisible(index);
        }
    };

});
