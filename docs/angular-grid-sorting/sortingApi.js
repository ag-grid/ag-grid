
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {displayName: "Athlete", field: "athlete", width: 150},
        {displayName: "Age", field: "age", width: 90},
        {displayName: "Country", field: "country", width: 120},
        {displayName: "Year", field: "year", width: 90},
        {displayName: "Date", field: "date", width: 110},
        {displayName: "Sport", field: "sport", width: 110},
        {displayName: "Gold", field: "gold", width: 100},
        {displayName: "Silver", field: "silver", width: 100},
        {displayName: "Bronze", field: "bronze", width: 100},
        {displayName: "Total", field: "total", width: 100}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        enableSorting: true
    };

    $scope.sortByAthleteAsc = function() {
        var sort = [
            {field: 'athlete', sort: 'asc'}
        ];
        $scope.gridOptions.api.setSortModel(sort);
    };

    $scope.sortByAthleteDesc = function() {
        var sort = [
            {field: 'athlete', sort: 'desc'}
        ];
        $scope.gridOptions.api.setSortModel(sort);
    };

    $scope.sortByCountryThenSport = function() {
        var sort = [
            {field: 'country', sort: 'asc'},
            {field: 'sport', sort: 'asc'}
        ];
        $scope.gridOptions.api.setSortModel(sort);
    };

    $scope.sortBySportThenCountry = function() {
        var sort = [
            {field: 'sport', sort: 'asc'},
            {field: 'country', sort: 'asc'}
        ];
        $scope.gridOptions.api.setSortModel(sort);
    };

    $scope.printSortStateToConsole = function() {
        var sortState = $scope.gridOptions.api.getSortModel();
        if (sortState.length==0) {
            console.log('No sort active');
        } else {
            console.log('State of sorting is:');
            for (var i = 0; i<sortState.length; i++) {
                var item = sortState[i];
                console.log(i + ' = {field: ' + item.field + ', sort: ' + item.sort + '}');
            }
        }
    };

    $scope.clearSort = function() {
        // pass null or undefined or empty list
        $scope.gridOptions.api.setSortModel(null);
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });
});
