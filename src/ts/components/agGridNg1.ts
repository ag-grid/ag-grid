
module ag.grid {

    // provide a reference to angular
    var angular = (<any> window).angular;

    // if angular is present, register the directive - checking for 'module' and 'directive' also to make
    // sure it's Angular 1 and not Angular 2
    if (typeof angular !== 'undefined' && typeof angular.module !== 'undefined' && angular.directive !== 'undefined') {
        initialiseAgGridWithAngular1(angular);
    }

    export function initialiseAgGridWithAngular1(angular: any) {
        var angularModule = angular.module("agGrid", []);
        angularModule.directive("agGrid", function() {
            return {
                restrict: "A",
                controller: ['$element', '$scope', '$compile', '$attrs', AngularDirectiveController],
                scope: true
            };
        });
    }

    function AngularDirectiveController($element: any, $scope: any, $compile: any, $attrs: any) {
        var gridOptions: any;
        var quickFilterOnScope: any;

        var keyOfGridInScope = $attrs.agGrid;
        quickFilterOnScope = keyOfGridInScope + '.quickFilterText';
        gridOptions = $scope.$eval(keyOfGridInScope);
        if (!gridOptions) {
            console.warn("WARNING - grid options for ag-Grid not found. Please ensure the attribute ag-grid points to a valid object on the scope");
            return;
        }

        var eGridDiv = $element[0];
        var grid = new ag.grid.Grid(eGridDiv, gridOptions, null, $scope, $compile, quickFilterOnScope);

        $scope.$on("$destroy", function() {
            grid.destroy();
        });
    }

}