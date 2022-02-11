/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { Grid } from "../grid";
export function initialiseAgGridWithAngular1(angular) {
    const angularModule = angular.module("agGrid", []);
    angularModule.directive("agGrid", function () {
        return {
            restrict: "A",
            controller: ['$element', '$scope', '$compile', '$attrs', AngularDirectiveController],
            scope: true
        };
    });
}
function AngularDirectiveController($element, $scope, $compile, $attrs) {
    let gridOptions;
    const keyOfGridInScope = $attrs.agGrid;
    gridOptions = $scope.$eval(keyOfGridInScope);
    if (!gridOptions) {
        console.warn("WARNING - grid options for AG Grid not found. Please ensure the attribute ag-grid points to a valid object on the scope");
        return;
    }
    const eGridDiv = $element[0];
    const gridParams = {
        $scope: $scope,
        $compile: $compile
    };
    let grid = new Grid(eGridDiv, gridOptions, gridParams);
    const quickFilterOnScope = keyOfGridInScope + '.quickFilterText';
    const quickFilterUnregisterFn = $scope.$watch(quickFilterOnScope, (newFilter) => {
        gridOptions.api.setQuickFilter(newFilter);
    });
    $scope.$on("$destroy", function () {
        quickFilterUnregisterFn();
        if (grid) {
            grid.destroy();
        }
        grid = null;
    });
}
