/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    var keyOfGridInScope = $attrs.agGrid;
    gridOptions = $scope.$eval(keyOfGridInScope);
    if (!gridOptions) {
        console.warn("WARNING - grid options for AG Grid not found. Please ensure the attribute ag-grid points to a valid object on the scope");
        return;
    }
    var eGridDiv = $element[0];
    var gridParams = {
        $scope: $scope,
        $compile: $compile
    };
    var grid = new grid_1.Grid(eGridDiv, gridOptions, gridParams);
    var quickFilterOnScope = keyOfGridInScope + '.quickFilterText';
    var quickFilterUnregisterFn = $scope.$watch(quickFilterOnScope, function (newFilter) {
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
