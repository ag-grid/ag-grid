/**
 * If the key was passed before, then doesn't execute the func
 * @param {Function} func
 * @param {string} key
 */
export declare function doOnce(func: () => void, key: string): void;
export declare function getFunctionName(funcConstructor: any): any;
/** @deprecated */
export declare function getFunctionParameters(func: any): any;
export declare function isFunction(val: any): boolean;
export declare function executeInAWhile(funcs: Function[]): void;
export declare function executeNextVMTurn(func: () => void): void;
export declare function executeAfter(funcs: Function[], milliseconds?: number): void;
/**
 * from https://stackoverflow.com/questions/24004791/can-someone-explain-the-debounce-function-in-javascript
 * @param {Function} func The function to be debounced
 * @param {number} wait The time in ms to debounce
 * @param {boolean} immediate If it should run immediately or wait for the initial debounce delay
 * @return {Function} The debounced function
 */
export declare function debounce(func: (...args: any[]) => void, wait: number, immediate?: boolean): (...args: any[]) => void;
export declare function waitUntil(condition: () => boolean, callback: () => void, timeout?: number, timeoutMessage?: string): void;
export declare function compose(...fns: Function[]): (arg: any) => any;
export declare function callIfPresent(func: Function): void;
