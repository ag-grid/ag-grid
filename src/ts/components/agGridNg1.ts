import {Grid, GridParams} from "../grid";

export function initialiseAgGridWithAngular1(angular: any) {
    let angularModule = angular.module("agGrid", []);
    angularModule.directive("agGrid", function() {
        return {
            restrict: "A",
            controller: ['$element', '$scope', '$compile', '$attrs', AngularDirectiveController],
            scope: true
        };
    });
}

function AngularDirectiveController($element: any, $scope: any, $compile: any, $attrs: any) {
    let gridOptions: any;
    let quickFilterOnScope: any;

    let keyOfGridInScope = $attrs.agGrid;
    quickFilterOnScope = keyOfGridInScope + '.quickFilterText';
    gridOptions = $scope.$eval(keyOfGridInScope);
    if (!gridOptions) {
        console.warn("WARNING - grid options for ag-Grid not found. Please ensure the attribute ag-grid points to a valid object on the scope");
        return;
    }

    let eGridDiv = $element[0];
    let gridParams: GridParams = {
        $scope: $scope,
        $compile: $compile,
        quickFilterOnScope: quickFilterOnScope
    };
    let grid = new Grid(eGridDiv, gridOptions, gridParams);

    $scope.$on("$destroy", function() {
        grid.destroy();
        grid = null;
    });
}
