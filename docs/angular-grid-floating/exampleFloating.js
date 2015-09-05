
var module = angular.module("example", ["angularGrid"]);

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
        pinnedColumnCount: 2,
        // no rows to float to start with
        floatingHeaderRowData: [],
        floatingFooterRowData: []
    };

    $scope.headerRowsToFloat = '0';
    $scope.footerRowsToFloat = '0';

    $scope.onFrozenTopCount = function() {
        var count = Number($scope.headerRowsToFloat);
        var rows = createData(count, 'H');
        $scope.gridOptions.api.setFrozenTopRowData(rows);
    };

    $scope.onFrozenBottomCount = function() {
        var count = Number($scope.footerRowsToFloat);
        var rows = createData(count, 'F');
        $scope.gridOptions.api.setFrozenBottomRowData(rows);
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRows(res.data);
        });

    function createData(count, prefix) {
        var result = [];
        for (var i = 0; i<count; i++) {
            result.push({
                athlete: prefix + ' Athlete ' + i,
                age: prefix + ' Age ' + i,
                country: prefix + ' Country ' + i
            });
        }
        return result;
    }

});
