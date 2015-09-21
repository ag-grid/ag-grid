
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 150},
        {headerName: "Age", field: "age", width: 90},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Gold", field: "gold", width: 100},
        {headerName: "Silver", field: "silver", width: 100},
        {headerName: "Bronze", field: "bronze", width: 100},
        {headerName: "Total", field: "total", width: 100}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        enableSorting: true
    };

    $scope.sortByAthleteAsc = function() {
        var sort = [
            {colId: 'athlete', sort: 'asc'}
        ];
        $scope.gridOptions.api.setSortModel(sort);
    };

    $scope.sortByAthleteDesc = function() {
        var sort = [
            {colId: 'athlete', sort: 'desc'}
        ];
        $scope.gridOptions.api.setSortModel(sort);
    };

    $scope.sortByCountryThenSport = function() {
        var sort = [
            {colId: 'country', sort: 'asc'},
            {colId: 'sport', sort: 'asc'}
        ];
        $scope.gridOptions.api.setSortModel(sort);
    };

    $scope.sortBySportThenCountry = function() {
        var sort = [
            {colId: 'sport', sort: 'asc'},
            {colId: 'country', sort: 'asc'}
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
                console.log(i + ' = {colId: ' + item.colId + ', sort: ' + item.sort + '}');
            }
        }
    };

    $scope.clearSort = function() {
        // pass null or undefined or empty list
        $scope.gridOptions.api.setSortModel(null);
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRowData(res.data);
        });
});
