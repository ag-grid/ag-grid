
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 200},
        {headerName: "Age", field: "age", width: 100},
        {headerName: "Country", field: "country", width: 150},
        {headerName: "Year", field: "year", width: 120},
        {headerName: "Sport", field: "sport", width: 200},
        // in the total col, we have a value getter, which usually means we don't need to provide a field
        // however the master/slave depends on the column id (which is derived from the field if provided) in
        // order ot match up the columns
        {headerName: "Total", field: "total",
            valueGetter: "data.gold + data.silver + data.bronze", width: 200},
        {headerName: "Gold", field: "gold", width: 100},
        {headerName: "Silver", field: "silver", width: 100},
        {headerName: "Bronze", field: "bronze", width: 100}
    ];

    var dataForBottomGrid = [
        {
            athlete: 'Total',
            age: '15 - 61',
            country: 'Ireland',
            year: '2020',
            date: '26/11/1970',
            sport: 'Synchronised Riding',
            gold: 55,
            silver: 65,
            bronze: 12
        }
    ];

    // this is the grid options for the top grid
    var gridOptionsTop = {
        columnDefs: columnDefs,
        rowData: null,
        enableColResize: true,
        debug: true,
        // don't show the horizontal scrollbar on the top grid
        suppressHorizontalScroll: true,
        enableSorting: true,
        slaveGrids: []
    };

    // this is the grid options for the bottom grid
    var gridOptionsBottom = {
        columnDefs: columnDefs,
        // we are hard coding the data here, it's just for demo purposes
        rowData: dataForBottomGrid,
        enableColResize: true,
        debug: true,
        rowClass: 'bold-row',
        // hide the header on the bottom grid
        headerHeight: 0,
        slaveGrids: []
    };

    $scope.gridOptionsTop = gridOptionsTop;
    $scope.gridOptionsBottom = gridOptionsBottom;

    gridOptionsTop.slaveGrids.push(gridOptionsBottom);
    gridOptionsBottom.slaveGrids.push(gridOptionsTop);

    $http.get("../olympicWinners.json")
        .then(function(res){
            gridOptionsTop.api.setRowData(res.data);
        });

    $scope.btSizeColsToFix = function() {
        gridOptionsTop.api.sizeColumnsToFit();
        console.log('btSizeColsToFix ');
    };
});
