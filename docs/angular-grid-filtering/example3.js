
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http, $timeout) {

    var columnDefs = [
        {displayName: "Athlete", field: "athlete", width: 150, filter: 'set'},
        {displayName: "Age", field: "age", width: 90, filter: 'number'},
        {displayName: "Country", field: "country", width: 120},
        {displayName: "Year", field: "year", width: 90},
        {displayName: "Date", field: "date", width: 110},
        {displayName: "Sport", field: "sport", width: 110},
        {displayName: "Gold", field: "gold", width: 100, filter: 'number'},
        {displayName: "Silver", field: "silver", width: 100, filter: 'number'},
        {displayName: "Bronze", field: "bronze", width: 100, filter: 'number'},
        {displayName: "Total", field: "total", width: 100, filter: 'number'}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        enableFilter: true,
        enableSorting: true
    };

    $scope.irelandAndUk = function() {
        var countryColDef = $scope.gridOptions.columnDefs[2];
        var filterApi = $scope.gridOptions.api.getFilterApiForColDef(countryColDef);
        filterApi.selectNothing();
        filterApi.selectValue('Ireland');
        filterApi.selectValue('Great Britain');
        $scope.gridOptions.api.onFilterChanged();
    };

    $scope.clearCountryFilter = function() {
        var countryColDef = $scope.gridOptions.columnDefs[2];
        var filterApi = $scope.gridOptions.api.getFilterApiForColDef(countryColDef);
        filterApi.selectEverything();
        $scope.gridOptions.api.onFilterChanged();
    };

    $scope.endingStan = function() {
        var countryColDef = $scope.gridOptions.columnDefs[2];
        var filterApi = $scope.gridOptions.api.getFilterApiForColDef(countryColDef);
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

    $scope.ageBelow25 = function() {
        var ageColDef = $scope.gridOptions.columnDefs[1];
        var filterApi = $scope.gridOptions.api.getFilterApiForColDef(ageColDef);
        filterApi.setType(filterApi.LESS_THAN);
        filterApi.setFilter(25);
        $scope.gridOptions.api.onFilterChanged();
    };

    $scope.ageAbove30 = function() {
        var ageColDef = $scope.gridOptions.columnDefs[1];
        var filterApi = $scope.gridOptions.api.getFilterApiForColDef(ageColDef);
        filterApi.setType(filterApi.GREATER_THAN);
        filterApi.setFilter(30);
        $scope.gridOptions.api.onFilterChanged();
    };

    $scope.clearAgeFilter = function() {
        var ageColDef = $scope.gridOptions.columnDefs[1];
        var filterApi = $scope.gridOptions.api.getFilterApiForColDef(ageColDef);
        filterApi.setFilter('');
        $scope.gridOptions.api.onFilterChanged();
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });

});
