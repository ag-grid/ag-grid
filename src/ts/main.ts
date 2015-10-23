/// <reference path="grid.ts" />
/// <reference path="components/agGridNg2.ts" />
/// <reference path="components/agGridNg1.ts" />
/// <reference path="components/agGridWebComponent.ts" />
/// <reference path="../../typings/tsd" />

(function() {

    // Establish the root object, `window` or `exports`
    var root = this;

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = angularGridGlobalFunction;
        }
        exports.angularGrid = angularGridGlobalFunction;
    }

    root.agGridGlobalFunc = angularGridGlobalFunction;

    // Global Function - this function is used for creating a grid, outside of any AngularJS
    function angularGridGlobalFunction(element: any, gridOptions: any) {
        // see if element is a query selector, or a real element
        var eGridDiv: any;
        if (typeof element === 'string') {
            eGridDiv = document.querySelector(element);
            if (!eGridDiv) {
                console.warn('WARNING - was not able to find element ' + element + ' in the DOM, ag-Grid initialisation aborted.');
                return;
            }
        } else {
            eGridDiv = element;
        }
        new ag.grid.Grid(eGridDiv, gridOptions);
    }

}).call(window);
