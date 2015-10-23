
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 150},
        {headerName: "Age", field: "age", width: 90},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Group", valueGetter: "data.country.charAt(0)", width: 120},
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
        enableFilter: true,
        enableSorting: true,
        showToolPanel: true
    };

    $scope.onBtForEachNode = function() {
        console.log('### api.forEachNode() ###');
        $scope.gridOptions.api.forEachNode(printNode);
    };

    $scope.onBtForEachNodeAfterFilter = function() {
        console.log('### api.forEachNodeAfterFilter() ###');
        $scope.gridOptions.api.forEachNodeAfterFilter(printNode);
    };

    $scope.onBtForEachNodeAfterFilterAndSort = function() {
        console.log('### api.forEachNodeAfterFilterAndSort() ###');
        $scope.gridOptions.api.forEachNodeAfterFilterAndSort(printNode);
    };

    function printNode(node, index) {
        if (node.data) {
            console.log(index + ' -> data: ' + node.data.country + ', ' + node.data.athlete);
        } else {
            console.log(index + ' -> group: ' + node.key);
        }
    }

    $http.get("../olympicWinners.json")
        .then(function(res){
            // because we are printing to the console,
            // we only use 50 rows
            var subsetOfRows = res.data.slice(0,50);
            $scope.gridOptions.api.setRowData(subsetOfRows);
        });
});
