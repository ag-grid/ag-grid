/// <reference path="grid.ts" />
/// <reference path="agGridNg2.ts" />

declare var exports: any;
declare var module: any;

(function() {

    // Establish the root object, `window` or `exports`
    var root = this;

    // provide a reference to angular
    var angular = (<any> window).angular;

    // if angular is present, register the directive - checking for 'module' and 'directive' also to make
    // sure it's Angular 1 and not Angular 2
    if (typeof angular !== 'undefined' && typeof angular.module !== 'undefined' && angular.directive !== 'undefined') {
        var angularModule = angular.module("angularGrid", []);
        angularModule.directive("angularGrid", function() {
            return {
                restrict: "A",
                controller: ['$element', '$scope', '$compile', AngularDirectiveController],
                scope: {
                    angularGrid: "="
                }
            };
        });
        angularModule.directive("agGrid", function() {
            return {
                restrict: "A",
                controller: ['$element', '$scope', '$compile', '$attrs', AngularDirectiveController],
                scope: true
            };
        });
    }

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = angularGridGlobalFunction;
        }
        exports.angularGrid = angularGridGlobalFunction;
    }

    // register web component if browser allows it
    if ((<any>document).registerElement) {
        registerWebComponent();
    }

    root.angularGrid = angularGridGlobalFunction;

    function AngularDirectiveController($element: any, $scope: any, $compile: any, $attrs: any) {
        var gridOptions: any;
        var quickFilterOnScope: any;
        if ($attrs) {
            // new directive of ag-grid
            var keyOfGridInScope = $attrs.agGrid;
            quickFilterOnScope = keyOfGridInScope + '.quickFilterText';
            gridOptions = $scope.$eval(keyOfGridInScope);
            if (!gridOptions) {
                console.warn("WARNING - grid options for Angular Grid not found. Please ensure the attribute ag-grid points to a valid object on the scope");
                return;
            }
        } else {
            // old directive of angular-grid
            console.warn("WARNING - Directive angular-grid is deprecated, you should use the ag-grid directive instead.");
            gridOptions = $scope.angularGrid;
            quickFilterOnScope = 'angularGrid.quickFilterText';
            if (!gridOptions) {
                console.warn("WARNING - grid options for Angular Grid not found. Please ensure the attribute angular-grid points to a valid object on the scope");
                return;
            }
        }

        var eGridDiv = $element[0];
        var grid = new awk.grid.Grid(eGridDiv, gridOptions, null, $scope, $compile, quickFilterOnScope);

        $scope.$on("$destroy", function() {
            grid.setFinished();
        });
    }

    function registerWebComponent() {
        var AgileGridProto = Object.create(HTMLElement.prototype);
        AgileGridProto.setGridOptions = function(options: any) {
            angularGridGlobalFunction(this, options);
        };
        (<any>document).registerElement('agile-grid', {prototype: AgileGridProto});
    }

    // Global Function - this function is used for creating a grid, outside of any AngularJS
    function angularGridGlobalFunction(element: any, gridOptions: any) {
        // see if element is a query selector, or a real element
        var eGridDiv: any;
        if (typeof element === 'string') {
            eGridDiv = document.querySelector(element);
            if (!eGridDiv) {
                console.warn('WARNING - was not able to find element ' + element + ' in the DOM, Angular Grid initialisation aborted.');
                return;
            }
        } else {
            eGridDiv = element;
        }
        new awk.grid.Grid(eGridDiv, gridOptions);
    }

}).call(window);
