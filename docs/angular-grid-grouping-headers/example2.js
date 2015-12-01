
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: 'Participant', subHeaders: [
            {headerName: "Athlete", field: "athlete", width: 150, filter: 'text'},
            {headerName: "Age", field: "age", width: 90, filter: 'number'},
            {headerName: "Country", field: "country", width: 120}
        ]},
        {headerName: 'Achievements', subHeaders: [
            {headerName: "Sport", field: "sport", width: 110},
            {headerName: 'Medals', subHeaders: [
                {headerName: "Total", headerGroupShow: 'closed', field: "total", width: 100, filter: 'number'},
                {headerName: "Gold", headerGroupShow: 'open', field: "gold", width: 100, filter: 'number'},
                {headerName: "Silver", headerGroupShow: 'open', field: "silver", width: 100, filter: 'number'},
                {headerName: "Bronze", headerGroupShow: 'open', field: "bronze", width: 100, filter: 'number'}
            ]},
            {headerName: 'Competition', subHeaders: [
                {headerName: "Year", field: "year", width: 90},
                {headerName: "Date", field: "date", width: 110}
            ]}
        ]}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        enableColResize: true
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRowData(res.data);
            $scope.gridOptions.api.sizeColumnsToFit();
        });
});
