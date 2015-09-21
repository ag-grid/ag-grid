
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", headerGroup: 'Participant', width: 150, filter: 'text'},
        {headerName: "Age", field: "age", headerGroup: 'Participant', width: 90, filter: 'number'},
        {headerName: "Country", field: "country", headerGroup: 'Participant', width: 120},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Total", headerGroupShow: 'closed', field: "total", headerGroup: 'Medals', width: 100, filter: 'number'},
        {headerName: "Gold", headerGroupShow: 'open', field: "gold", headerGroup: 'Medals', width: 100, filter: 'number'},
        {headerName: "Silver", headerGroupShow: 'open', field: "silver", headerGroup: 'Medals', width: 100, filter: 'number'},
        {headerName: "Bronze", headerGroupShow: 'open', field: "bronze", headerGroup: 'Medals', width: 100, filter: 'number'},
        {headerName: "Year", field: "year", headerGroup: 'Competition', width: 90},
        {headerName: "Date", field: "date", headerGroup: 'Competition', width: 110}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        groupHeaders: true,
        enableColResize: true
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRowData(res.data);
            $scope.gridOptions.api.sizeColumnsToFit();
        });
});
