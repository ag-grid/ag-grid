/// <reference path="../../typings/tsd" />
/// <reference path="./AgGridReact" />

// creating the random local variable was needed to get the unit tests working.
// if not, the tests would not load as we were referencing an undefined window object
var __RANDOM_GLOBAL_VARIABLE_AG_GRID_REACT_COMPONENT_SGFAEWJFKJSDHGFKSDAJ: any;
if (typeof window !== 'undefined') {
    __RANDOM_GLOBAL_VARIABLE_AG_GRID_REACT_COMPONENT_SGFAEWJFKJSDHGFKSDAJ = window;
}

(function() {

    if (typeof exports !== 'undefined') {
        exports = ag.react;
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = ag.react;
        }
    }

}).call(__RANDOM_GLOBAL_VARIABLE_AG_GRID_REACT_COMPONENT_SGFAEWJFKJSDHGFKSDAJ);
