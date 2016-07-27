/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.6
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var grid_1 = require("../grid");
function initialiseAgGridWithAngular1(angular) {
    var angularModule = angular.module("agGrid", []);
    angularModule.directive("agGrid", function () {
        return {
            restrict: "A",
            controller: ['$element', '$scope', '$compile', '$attrs', AngularDirectiveController],
            scope: true
        };
    });
}
exports.initialiseAgGridWithAngular1 = initialiseAgGridWithAngular1;
function AngularDirectiveController($element, $scope, $compile, $attrs) {
    var gridOptions;
    var quickFilterOnScope;
    var keyOfGridInScope = $attrs.agGrid;
    quickFilterOnScope = keyOfGridInScope + '.quickFilterText';
    gridOptions = $scope.$eval(keyOfGridInScope);
    if (!gridOptions) {
        console.warn("WARNING - grid options for ag-Grid not found. Please ensure the attribute ag-grid points to a valid object on the scope");
        return;
    }
    var eGridDiv = $element[0];
    var grid = new grid_1.Grid(eGridDiv, gridOptions, null, $scope, $compile, quickFilterOnScope);
    $scope.$on("$destroy", function () {
        grid.destroy();
    });
}
