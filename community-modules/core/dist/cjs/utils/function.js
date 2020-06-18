/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FUNCTION_STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var FUNCTION_ARGUMENT_NAMES = /([^\s,]+)/g;
var doOnceFlags = {};
/**
 * If the key was passed before, then doesn't execute the func
 * @param {Function} func
 * @param {string} key
 */
function doOnce(func, key) {
    if (doOnceFlags[key]) {
        return;
    }
    func();
    doOnceFlags[key] = true;
}
exports.doOnce = doOnce;
/** @deprecated */
function getFunctionParameters(func) {
    var fnStr = func.toString().replace(FUNCTION_STRIP_COMMENTS, '');
    return fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(FUNCTION_ARGUMENT_NAMES) || [];
}
exports.getFunctionParameters = getFunctionParameters;
function isFunction(val) {
    return !!(val && val.constructor && val.call && val.apply);
}
exports.isFunction = isFunction;
function executeInAWhile(funcs) {
    executeAfter(funcs, 400);
}
exports.executeInAWhile = executeInAWhile;
function executeNextVMTurn(funcs) {
    executeAfter(funcs, 0);
}
exports.executeNextVMTurn = executeNextVMTurn;
function executeAfter(funcs, milliseconds) {
    if (milliseconds === void 0) { milliseconds = 0; }
    if (funcs.length > 0) {
        window.setTimeout(function () { return funcs.forEach(function (func) { return func(); }); }, milliseconds);
    }
}
exports.executeAfter = executeAfter;
/**
 * from https://stackoverflow.com/questions/24004791/can-someone-explain-the-debounce-function-in-javascript
 * @param {Function} func The function to be debounced
 * @param {number} wait The time in ms to debounce
 * @param {boolean} immediate If it should run immediately or wait for the initial debounce delay
 * @return {Function} The debounced function
 */
function debounce(func, wait, immediate) {
    if (immediate === void 0) { immediate = false; }
    // 'private' variable for instance
    // The returned function will be able to reference this due to closure.
    // Each call to the returned function will share this common timer.
    var timeout;
    // Calling debounce returns a new anonymous function
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // reference the context and args for the setTimeout function
        var context = this;
        // Should the function be called now? If immediate is true
        //   and not already in a timeout then the answer is: Yes
        var callNow = immediate && !timeout;
        // This is the basic debounce behaviour where you can call this
        //   function several times, but it will only execute once
        //   [before or after imposing a delay].
        //   Each time the returned function is called, the timer starts over.
        window.clearTimeout(timeout);
        // Set the new timeout
        timeout = window.setTimeout(function () {
            // Inside the timeout function, clear the timeout variable
            // which will let the next execution run when in 'immediate' mode
            timeout = null;
            // Check if the function already ran with the immediate flag
            if (!immediate) {
                // Call the original function with apply
                // apply lets you define the 'this' object as well as the arguments
                //    (both captured before setTimeout)
                func.apply(context, args);
            }
        }, wait);
        // Immediate mode and no wait timer? Execute the function..
        if (callNow) {
            func.apply(context, args);
        }
    };
}
exports.debounce = debounce;
function compose() {
    var fns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fns[_i] = arguments[_i];
    }
    return function (arg) { return fns.reduce(function (composed, f) { return f(composed); }, arg); };
}
exports.compose = compose;
function callIfPresent(func) {
    if (func) {
        func();
    }
}
exports.callIfPresent = callIfPresent;

//# sourceMappingURL=function.js.map
