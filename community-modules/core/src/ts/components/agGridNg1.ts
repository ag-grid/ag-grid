import { Grid, GridParams } from "../grid";
import { GridOptions } from "../entities/gridOptions";

export function initialiseAgGridWithAngular1(angular: any) {
    const angularModule = angular.module("agGrid", []);
    angularModule.directive("agGrid", function() {
        return {
            restrict: "A",
            controller: ['$element', '$scope', '$compile', '$attrs', AngularDirectiveController],
            scope: true
        };
    });
}

function AngularDirectiveController($element: any, $scope: any, $compile: any, $attrs: any) {
    let gridOptions: GridOptions;

    const keyOfGridInScope = $attrs.agGrid;
    gridOptions = $scope.$eval(keyOfGridInScope);
    if (!gridOptions) {
        console.warn("WARNING - grid options for AG Grid not found. Please ensure the attribute ag-grid points to a valid object on the scope");
        return;
    }

    const eGridDiv = $element[0];
    const gridParams: GridParams = {
        $scope: $scope,
        $compile: $compile
    };
    let grid: Grid | null = new Grid(eGridDiv, gridOptions, gridParams);

    const quickFilterOnScope = keyOfGridInScope + '.quickFilterText';
    const quickFilterUnregisterFn = $scope.$watch(
        quickFilterOnScope,
        (newFilter: any) => {
            gridOptions.api!.setQuickFilter(newFilter);
        }
    );

    $scope.$on("$destroy", function() {
        quickFilterUnregisterFn();
        if (grid) {
            grid.destroy();
        }
        grid = null;
    });
}
