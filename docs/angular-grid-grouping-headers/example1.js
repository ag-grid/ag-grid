
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {
            headerName: "Athlete Details",
            children: [
                {headerName: "Athlete", field: "athlete", width: 150, filter: 'text'},
                {headerName: "Age", field: "age", width: 90, filter: 'number'},
                {headerName: "Country", field: "country", width: 120}
            ]
        },
        {
            headerName: "Sports Results",
            children: [
                {headerName: "Sport", field: "sport", width: 110},
                {headerName: "Total", columnGroupShow: 'closed', field: "total", width: 100, filter: 'number'},
                {headerName: "Gold", columnGroupShow: 'open', field: "gold", width: 100, filter: 'number'},
                {headerName: "Silver", columnGroupShow: 'open', field: "silver", width: 100, filter: 'number'},
                {headerName: "Bronze", columnGroupShow: 'open', field: "bronze", width: 100, filter: 'number'},
            ]
        }
    ];

    $scope.gridOptions = {
        debug: true,
        columnDefs: columnDefs,
        rowData: null,
        groupHeaders: true,
        enableSorting: true,
        enableFilter: true,
        enableColResize: true
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRowData(res.data);
            //$scope.gridOptions.api.sizeColumnsToFit();
        });
});
