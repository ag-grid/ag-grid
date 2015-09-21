
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http, $timeout) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 150, filter: 'set'},
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
        enableSorting: true
    };

    $scope.irelandAndUk = function() {
        var filterApi = $scope.gridOptions.api.getFilterApi('country');
        filterApi.selectNothing();
        filterApi.selectValue('Ireland');
        filterApi.selectValue('Great Britain');
        $scope.gridOptions.api.onFilterChanged();
    };

    $scope.clearCountryFilter = function() {
        var filterApi = $scope.gridOptions.api.getFilterApi('country');
        filterApi.selectEverything();
        $scope.gridOptions.api.onFilterChanged();
    };

    $scope.endingStan = function() {
        var filterApi = $scope.gridOptions.api.getFilterApi('country');
        filterApi.selectNothing();
        for (var i = 0; i<filterApi.getUniqueValueCount(); i++) {
            var value = filterApi.getUniqueValue(i);
            var valueEndsWithStan = value.indexOf('stan') === value.length - 4;
            if (valueEndsWithStan) {
                filterApi.selectValue(value);
            }
        }
        $scope.gridOptions.api.onFilterChanged();
    };

    $scope.setCountryModel = function() {
        var filterApi = $scope.gridOptions.api.getFilterApi('country');
        var model = ['Algeria','Argentina'];
        filterApi.setModel(model);
        $scope.gridOptions.api.onFilterChanged();
    };

    $scope.printCountryModel = function() {
        var filterApi = $scope.gridOptions.api.getFilterApi('country');
        var model = filterApi.getModel();
        if (model) {
            console.log('Country model is: [' + model.join(',') + ']');
        } else {
            console.log('Country model filter is not active');
        }
    };

    $scope.ageBelow25 = function() {
        var filterApi = $scope.gridOptions.api.getFilterApi('age');
        filterApi.setType(filterApi.LESS_THAN);
        filterApi.setFilter(25);
        $scope.gridOptions.api.onFilterChanged();
    };

    $scope.ageAbove30 = function() {
        var filterApi = $scope.gridOptions.api.getFilterApi('age');
        filterApi.setType(filterApi.GREATER_THAN);
        filterApi.setFilter(30);
        $scope.gridOptions.api.onFilterChanged();
    };

    $scope.clearAgeFilter = function() {
        var filterApi = $scope.gridOptions.api.getFilterApi('age');
        filterApi.setFilter('');
        $scope.gridOptions.api.onFilterChanged();
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRowData(res.data);
        });

});
