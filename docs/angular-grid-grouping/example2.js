
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Gold", field: "gold", width: 100},
        {headerName: "Silver", field: "silver", width: 100},
        {headerName: "Bronze", field: "bronze", width: 100},
        {headerName: "Total", field: "total", width: 100},
        {headerName: "Age", field: "age", width: 90},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        groupUseEntireRow: false,
        groupKeys: ['country'],
        groupAggFields: ['gold','silver','bronze','total'],
        groupColumnDef: {headerName: "Athlete",
            field: "athlete",
            width: 200,
            cellRenderer: {
                renderer: 'group',
                padding: 5
            }}
        };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });
});
