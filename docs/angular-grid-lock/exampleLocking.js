
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

    var gridOptionsTop = {
        columnDefs: columnDefs,
        groupHeaders: true,
        rowData: null,
        enableColResize: true,
        slaveGrids: []
    };

    var gridOptionsBottom = {
        columnDefs: columnDefs,
        groupHeaders: true,
        rowData: null,
        enableColResize: true,
        suppressHorizontalScroll: true,
        slaveGrids: []
    };

    $scope.gridOptionsTop = gridOptionsTop;
    $scope.gridOptionsBottom = gridOptionsBottom;

    gridOptionsTop.slaveGrids.push(gridOptionsBottom);
    gridOptionsBottom.slaveGrids.push(gridOptionsTop);

    $http.get("../olympicWinners.json")
        .then(function(res){
            gridOptionsTop.api.setRows(res.data);
            gridOptionsBottom.api.setRows(res.data);
        });
});
