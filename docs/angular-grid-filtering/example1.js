
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var irishAthletes = ['John Joe Nevin','Katie Taylor','Paddy Barnes','Kenny Egan','Darren Sutherland', 'Margaret Thatcher', 'Tony Blair', 'Ronald Regan', 'Barack Obama'];

    var columnDefs = [
        {displayName: "Athlete", field: "athlete", width: 150, filter: 'set',
            filterParams: { cellHeight: 20, values: irishAthletes} },
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
        enableFilter: true
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });
});
