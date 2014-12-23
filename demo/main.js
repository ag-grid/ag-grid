
var gridsModule = angular.module("grids", ["angularGrid"]);

gridsModule.controller('mainController', function($scope) {

    var colNames = ["Country","Station","Railway","Game","Street","Address","Toy","Soft Box","Make and Model","Longest Day","Shortest Night"];

    $scope.colCount = 50;
    $scope.rowCount = 50;

    var pinnedColCount = 1;

    $scope.width = "1600px";
    $scope.height = "600px";

    $scope.angularGrid = {
        columnDefs: [],
        rowData: [],
        pinnedColumnCount: pinnedColCount, //and integer, zero or more, default is 0
        rowHeight: 25, // defaults to 25, can be any integer
        enableColResize: true, //one of [true, false]
        enableSorting: true, //one of [true, false]
        rowSelection: "single", // one of ['single','multiple']
        rowSelected: function(row) {console.log("Callback rowSelected: " + row); }, //callback when row selected
        selectionChanged: function() {console.log("Callback selectionChanged"); } //callback when selection changed
    };

    createCols();
    createData();

    $scope.onNewData = function() {
        createData();
        $scope.angularGrid.api.onNewRows();
    };

    $scope.onNewCols = function() {
        createCols();
        $scope.angularGrid.api.onNewCols();
    };

    function createCols() {
        var columns = [];
        var colCount = parseInt($scope.colCount);
        for (var col = 0; col<colCount; col++) {
            var colDef = {displayName: colNames[col % colNames.length], field: "col"+col, width: 200, enableColumnResizing: true};
            //colDef.width = Math.round(50+Math.random()*200);
            columns.push(colDef);
        }
        $scope.angularGrid.columnDefs = columns;
    }

    function createData() {
        var rowCount = parseInt($scope.rowCount);
        var colCount = parseInt($scope.colCount);
        var data = [];
        for (var row = 0; row<rowCount; row++) {
            var rowItem = {};
            for (var col = 0; col<colCount; col++) {
                var randomBit = Math.random().toString().substring(2,5);
                rowItem["col"+col] = colNames[col % colNames.length]+"-"+randomBit +" - (" +row+","+col+")";
            }
            data.push(rowItem);
        }
        $scope.angularGrid.rowData = data;
    }

});
