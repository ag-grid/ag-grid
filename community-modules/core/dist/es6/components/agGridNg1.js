/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { Grid } from "../grid";
export function initialiseAgGridWithAngular1(angular) {
    var angularModule = angular.module("agGrid", []);
    angularModule.directive("agGrid", function () {
        return {
            restrict: "A",
            controller: ['$element', '$scope', '$compile', '$attrs', AngularDirectiveController],
            scope: true
        };
    });
}
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
    var gridParams = {
        $scope: $scope,
        $compile: $compile,
        quickFilterOnScope: quickFilterOnScope
    };
    var grid = new Grid(eGridDiv, gridOptions, gridParams);
    $scope.$on("$destroy", function () {
        grid.destroy();
        grid = null;
    });
}
