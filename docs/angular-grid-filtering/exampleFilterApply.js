
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 150,
            filter: 'text',
            filterParams: { apply: true }
        },
        {headerName: "Age", field: "age", width: 90,
            filter: 'number',
            filterParams: { apply: true }
        },
        {headerName: "Country", field: "country", width: 120,
            filter: 'set',
            filterParams: { apply: true }
        },
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Gold", field: "gold", width: 100, filter: 'number'},
        {headerName: "Silver", field: "silver", width: 100, filter: 'number'},
        {headerName: "Bronze", field: "bronze", width: 100, filter: 'number'},
        {headerName: "Total", field: "total", width: 100, filter: 'number'}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        enableFilter: true,
        onBeforeFilterChanged: function() {console.log('onBeforeFilterChanged');},
        onAfterFilterChanged: function() {console.log('onAfterFilterChanged');},
        onFilterModified: function() {console.log('onFilterModified');}
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRowData(res.data);
        });
});
