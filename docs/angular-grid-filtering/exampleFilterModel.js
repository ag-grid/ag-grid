
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 150, filter: 'text'},
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

    // this gets set when you hit the button 'save filter'
    var savedModel = null;

    var hardcodedFilter = {
        country: ['Ireland', 'United States'],
        age: {type: 2, filter: '30'},
        athlete: {type: 3, filter: 'Mich'}
    };

    $scope.savedFilters = '[]';

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        enableFilter: true,
        enableSorting: true
    };

    $scope.clearFilters = function() {
        $scope.gridOptions.api.setFilterModel(null);
        $scope.gridOptions.api.onFilterChanged();
    };

    $scope.saveFilterModel = function() {
        savedModel = $scope.gridOptions.api.getFilterModel();
        if (savedModel) {
            $scope.savedFilters = Object.keys(savedModel);
        } else {
            $scope.savedFilters = '-none-';
        }
    };

    $scope.restoreFilterModel = function() {
        $scope.gridOptions.api.setFilterModel(savedModel);
        $scope.gridOptions.api.onFilterChanged();
    };

    $scope.restoreFromHardCoded = function() {
        $scope.gridOptions.api.setFilterModel(hardcodedFilter);
        $scope.gridOptions.api.onFilterChanged();
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });

});
