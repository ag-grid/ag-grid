const FUNCTION_STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const FUNCTION_ARGUMENT_NAMES = /([^\s,]+)/g;
const doOnceFlags: { [key: string]: boolean; } = {};

/**
 * If the key was passed before, then doesn't execute the func
 * @param {Function} func
 * @param {string} key
 */
export function doOnce(func: () => void, key: string) {
    if (doOnceFlags[key]) { return; }

    func();
    doOnceFlags[key] = true;
}

export function getFunctionName(funcConstructor: any) {
    // for every other browser in the world
    if (funcConstructor.name) {
        return funcConstructor.name
    }

    // for the pestilence that is ie11
    const matches = /function\s+([^\(]+)/.exec(funcConstructor.toString());
    return matches && matches.length === 2 ? matches[1].trim() : null;
}

/** @deprecated */
export function getFunctionParameters(func: any) {
    const fnStr = func.toString().replace(FUNCTION_STRIP_COMMENTS, '');

    return fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(FUNCTION_ARGUMENT_NAMES) || [];
}

export function isFunction(val: any): boolean {
    return !!(val && val.constructor && val.call && val.apply);
}

export function executeInAWhile(funcs: Function[]): void {
    executeAfter(funcs, 400);
}

export function executeNextVMTurn(funcs: Function[]): void {
    executeAfter(funcs, 0);
}

export function executeAfter(funcs: Function[], milliseconds = 0): void {
    if (funcs.length > 0) {
        window.setTimeout(() => funcs.forEach(func => func()), milliseconds);
    }
}

/**
 * from https://stackoverflow.com/questions/24004791/can-someone-explain-the-debounce-function-in-javascript
 * @param {Function} func The function to be debounced
 * @param {number} wait The time in ms to debounce
 * @param {boolean} immediate If it should run immediately or wait for the initial debounce delay
 * @return {Function} The debounced function
 */
export function debounce(func: (...args: any[]) => void, wait: number, immediate: boolean = false) {
    // 'private' variable for instance
    // The returned function will be able to reference this due to closure.
    // Each call to the returned function will share this common timer.
    let timeout: any;

    // Calling debounce returns a new anonymous function
    return function(...args: any[]) {
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
        timeout = window.setTimeout(function() {
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

export function compose(...fns: Function[]) {
    return (arg: any) => fns.reduce((composed, f) => f(composed), arg);
}

export function callIfPresent(func: Function): void {
    if (func) { func(); }
}
