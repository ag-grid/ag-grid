
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {
            headerName: "Group 1",
            groupId: "Group1",
            children: [
                {headerName: "AAA", field: "athlete", pinned: true, width: 100},
                {headerName: "BBB", field: "age", pinned: true, columnGroupShow: 'open', width: 100},
                {headerName: "CCC", field: "country", width: 100},
                {headerName: "DDD", field: "year", columnGroupShow: 'open', width: 100},
                {headerName: "EEE", field: "date", width: 100},
                {headerName: "FFF", field: "sport", columnGroupShow: 'open', width: 100},
                {headerName: "GGG", field: "date", width: 100},
                {headerName: "HHH", field: "sport", columnGroupShow: 'open', width: 100}
            ]
        },
        {
            headerName: "Group 2",
            groupId: "Group2",
            children: [
                {headerName: "AAA", field: "athlete", pinned: true, width: 100},
                {headerName: "BBB", field: "age", pinned: true, columnGroupShow: 'open', width: 100},
                {headerName: "CCC", field: "country", width: 100},
                {headerName: "DDD", field: "year", columnGroupShow: 'open', width: 100},
                {headerName: "EEE", field: "date", width: 100},
                {headerName: "FFF", field: "sport", columnGroupShow: 'open', width: 100},
                {headerName: "GGG", field: "date", width: 100},
                {headerName: "HHH", field: "sport", columnGroupShow: 'open', width: 100}
            ]
        }
    ];

    // this is the grid options for the top grid
    var gridOptionsTop = {
        columnDefs: columnDefs,
        groupHeaders: true,
        rowData: null,
        enableColResize: true,
        debug: true,
        slaveGrids: []
    };

    // this is the grid options for the bottom grid
    var gridOptionsBottom = {
        columnDefs: columnDefs,
        groupHeaders: true,
        rowData: null,
        enableColResize: true,
        debug: true,
        slaveGrids: []
    };

    $scope.gridOptionsTop = gridOptionsTop;
    $scope.gridOptionsBottom = gridOptionsBottom;

    gridOptionsTop.slaveGrids.push(gridOptionsBottom);
    gridOptionsBottom.slaveGrids.push(gridOptionsTop);

    $scope.cbAthlete = true;
    $scope.cbAge = true;
    $scope.cbCountry = true;

    $http.get("../olympicWinners.json")
        .then(function(res){
            gridOptionsTop.api.setRowData(res.data);
            gridOptionsBottom.api.setRowData(res.data);
            gridOptionsTop.api.sizeColumnsToFit();

            // mix up some columns
            gridOptionsTop.columnApi.moveColumn(11,4);
            gridOptionsTop.columnApi.moveColumn(11,4);
        });
});
