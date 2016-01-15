
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Gold", field: "gold", width: 100, aggFunc: 'sum'},
        {headerName: "Silver", field: "silver", width: 100, aggFunc: 'sum'},
        {headerName: "Bronze", field: "bronze", width: 100, aggFunc: 'sum'},
        {headerName: "Total", field: "total", width: 100, aggFunc: 'sum'},
        {headerName: "Age", field: "age", width: 90},
        {headerName: "Country", field: "country", width: 120, rowGroupIndex: 0},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        groupIncludeFooter: true,
        groupColumnDef: {headerName: "Athlete",
            field: "athlete",
            width: 200,
            cellRenderer: {
                renderer: 'group',
                footerValueGetter: '"Total (" + x + ")"',
                padding: 5
            }}
        };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRowData(res.data);
        });
});
