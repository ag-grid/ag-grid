/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const doOnceFlags = {};
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
function getFunctionName(funcConstructor) {
    // for every other browser in the world
    if (funcConstructor.name) {
        return funcConstructor.name;
    }
    // for the pestilence that is ie11
    const matches = /function\s+([^\(]+)/.exec(funcConstructor.toString());
    return matches && matches.length === 2 ? matches[1].trim() : null;
}
exports.getFunctionName = getFunctionName;
function isFunction(val) {
    return !!(val && val.constructor && val.call && val.apply);
}
exports.isFunction = isFunction;
function executeInAWhile(funcs) {
    executeAfter(funcs, 400);
}
exports.executeInAWhile = executeInAWhile;
const executeNextVMTurnFuncs = [];
let executeNextVMTurnPending = false;
function executeNextVMTurn(func) {
    executeNextVMTurnFuncs.push(func);
    if (executeNextVMTurnPending) {
        return;
    }
    executeNextVMTurnPending = true;
    window.setTimeout(() => {
        const funcsCopy = executeNextVMTurnFuncs.slice();
        executeNextVMTurnFuncs.length = 0;
        executeNextVMTurnPending = false;
        funcsCopy.forEach(func => func());
    }, 0);
}
exports.executeNextVMTurn = executeNextVMTurn;
function executeAfter(funcs, milliseconds = 0) {
    if (funcs.length > 0) {
        window.setTimeout(() => funcs.forEach(func => func()), milliseconds);
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
function debounce(func, wait, immediate = false) {
    // 'private' variable for instance
    // The returned function will be able to reference this due to closure.
    // Each call to the returned function will share this common timer.
    let timeout;
    // Calling debounce returns a new anonymous function
    return function (...args) {
        // reference the context and args for the setTimeout function
        const context = this;
        // Should the function be called now? If immediate is true
        //   and not already in a timeout then the answer is: Yes
        const callNow = immediate && !timeout;
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
/**
 * @param {Function} func The function to be throttled
 * @param {number} wait The time in ms to throttle
 * @return {Function} The throttled function
 */
function throttle(func, wait) {
    let previousCall = 0;
    return function (...args) {
        const context = this;
        const currentCall = new Date().getTime();
        if (currentCall - previousCall < wait) {
            return;
        }
        previousCall = currentCall;
        func.apply(context, args);
    };
}
exports.throttle = throttle;
function waitUntil(condition, callback, timeout = 100, timeoutMessage) {
    const timeStamp = new Date().getTime();
    let interval = null;
    let executed = false;
    const internalCallback = () => {
        const reachedTimeout = ((new Date().getTime()) - timeStamp) > timeout;
        if (condition() || reachedTimeout) {
            callback();
            executed = true;
            if (interval != null) {
                window.clearInterval(interval);
                interval = null;
            }
            if (reachedTimeout && timeoutMessage) {
                console.warn(timeoutMessage);
            }
        }
    };
    internalCallback();
    if (!executed) {
        interval = window.setInterval(internalCallback, 10);
    }
}
exports.waitUntil = waitUntil;
function compose(...fns) {
    return (arg) => fns.reduce((composed, f) => f(composed), arg);
}
exports.compose = compose;
function callIfPresent(func) {
    if (func) {
        func();
    }
}
exports.callIfPresent = callIfPresent;
exports.noop = () => { return; };
