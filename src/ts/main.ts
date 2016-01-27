/// <reference path="components/agGridNg2.ts" />
/// <reference path="components/agGridNg1.ts" />
/// <reference path="components/agGridWebComponent.ts" />
/// <reference path="../../typings/tsd" />

// creating the random local variable was needed to get the unit tests working.
// if not, the tests would not load as we were referencing an undefined window object
var __RANDOM_GLOBAL_VARIABLE_FSKJFHSKJFHKSDAJF: any;
if (typeof window !== 'undefined') {
    __RANDOM_GLOBAL_VARIABLE_FSKJFHSKJFHKSDAJF = window;
}

(function() {

    // Establish the root object, `window` or `exports`
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = ag.grid;
        } else {
            exports = ag.grid;
        }
    }

    this.agGridGlobalFunc = function() {
        console.warn('ag-Grid: agGridGlobalFunc() is no longer used. Please use "new ag.grid.Grid()" to create a new grid. Check the examples in the documentation.')
    };

}).call(__RANDOM_GLOBAL_VARIABLE_FSKJFHSKJFHKSDAJF);
