
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 150,
            // for athlete only, have the floating header italics
            floatingCellRenderer: function(params) {
                return '<i>'+params.value+'</i>'
            }},
        {headerName: "Age", field: "age", width: 90},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        pinnedColumnCount: 2,
        enableColResize: true,
        enableSorting: true,
        enableFilter: true,
        rowStyle: function(params) {
            if (params.node.floating) {
                return {'font-weight': 'bold'}
            }
        },
        // no rows to float to start with
        floatingHeaderRowData: [],
        floatingFooterRowData: []
    };

    $scope.headerRowsToFloat = '1';
    $scope.footerRowsToFloat = '1';

    $scope.onFloatingTopCount = function() {
        var count = Number($scope.headerRowsToFloat);
        var rows = createData(count, 'Top');
        $scope.gridOptions.api.setFloatingTopRowData(rows);
    };

    $scope.onFloatingBottomCount = function() {
        var count = Number($scope.footerRowsToFloat);
        var rows = createData(count, 'Bottom');
        $scope.gridOptions.api.setFloatingBottomRowData(rows);
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRows(res.data);
            // initilise the floating rows
            $scope.onFloatingTopCount();
            $scope.onFloatingBottomCount();

            // if this timeout is missing, we size to fix before the scrollbar shows,
            // which doesn't fit the columns very well
            setTimeout( function() {
                $scope.gridOptions.api.sizeColumnsToFit();
            }, 0);
        });

    function createData(count, prefix) {
        var result = [];
        for (var i = 0; i<count; i++) {
            result.push({
                athlete: prefix + ' Athlete ' + i,
                age: prefix + ' Age ' + i,
                country: prefix + ' Country ' + i,
                year: prefix + ' Year ' + i,
                date: prefix + ' Date ' + i,
                sport: prefix + ' Sport ' + i
            });
        }
        return result;
    }
});
