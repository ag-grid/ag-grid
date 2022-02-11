/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v27.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grid_1 = require("../grid");
function initialiseAgGridWithAngular1(angular) {
    const angularModule = angular.module("agGrid", []);
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
    let grid = new grid_1.Grid(eGridDiv, gridOptions, gridParams);
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

//# sourceMappingURL=agGridNg1.js.map
