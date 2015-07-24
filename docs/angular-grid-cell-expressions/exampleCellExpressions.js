
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope) {

    ///// top table
    var columnDefsTop = [
        {headerName: "Function", field: 'function', width: 150},
        {headerName: "Value", field: 'value', width: 100},
        {headerName: "Times 10", valueGetter: 'getValue("value") * 10', width: 100},
    ];

    var rowDataTop = [
        {function: 'Number Squared', value: '=ctx.theNumber * ctx.theNumber'},
        {function: 'Number x 2', value: '=ctx.theNumber * 2'},
        {function: 'Todays Date', value: '=new Date().toLocaleDateString()'},
        {function: 'Sum A', value: '=ctx.sum("a")'},
        {function: 'Sum B', value: '=ctx.sum("b")'}
    ];

    $scope.gridOptionsTop = {
        enableCellExpressions: true,
        columnDefs: columnDefsTop,
        rowData: rowDataTop,
        context: {
            theNumber: 4
        },
        ready: function(api) {
            api.sizeColumnsToFit();
        }
    };

    ///// bottom table
    var columnDefsBottom = [
        {headerName: 'A', field: 'a', width: 150, editable: true, newValueHandler: numberNewValueHandler, cellValueChanged: cellValueChanged},
        {headerName: 'B', field: 'b', width: 150, editable: true, newValueHandler: numberNewValueHandler, cellValueChanged: cellValueChanged}
    ];

    var rowDataBottom = [
        {a: 1, b: 22},
        {a: 2, b: 33},
        {a: 3, b: 44},
        {a: 4, b: 55},
        {a: 5, b: 66},
        {a: 6, b: 77},
        {a: 7, b: 88}
    ];

    $scope.gridOptionsBottom = {
        columnDefs: columnDefsBottom,
        rowData: rowDataBottom,
        ready: function(api) {
            api.sizeColumnsToFit();
        }
    };

    $scope.gridOptionsTop.context.sum = function(field) {
        var result = 0;
        rowDataBottom.forEach( function(item) {
            result += item[field];
        });
        return result;
    };

    // tell top grid to refresh when number changes
    $scope.onNewNumber = function() {
        $scope.gridOptionsTop.api.refreshView();
    };

    // we want to convert the strings to numbers
    function numberNewValueHandler(params) {
        var valueAsNumber = parseFloat(params.newValue);
        var field = params.colDef.field;
        var data = params.data;
        data[field] = valueAsNumber;
    }

    // we want to tell the top grid to refresh when the bottom grid values change
    function cellValueChanged() {
        $scope.gridOptionsTop.api.refreshView();
    }
});
