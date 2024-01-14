/**
 * If the key was passed before, then doesn't execute the func
 * @param {Function} func
 * @param {string} key
 */
export declare function doOnce(func: () => void, key: string): void;
export declare function warnOnce(msg: string): void;
export declare function errorOnce(msg: string): void;
export declare function getFunctionName(funcConstructor: any): any;
export declare function isFunction(val: any): boolean;
export declare function executeInAWhile(funcs: Function[]): void;
export declare function executeNextVMTurn(func: () => void): void;
export declare function executeAfter(funcs: Function[], milliseconds?: number): void;
/**
 * @param {Function} func The function to be debounced
 * @param {number} delay The time in ms to debounce
 * @return {Function} The debounced function
 */
export declare function debounce(func: (...args: any[]) => void, delay: number): (...args: any[]) => void;
/**
 * @param {Function} func The function to be throttled
 * @param {number} wait The time in ms to throttle
 * @return {Function} The throttled function
 */
export declare function throttle(func: (...args: any[]) => void, wait: number): (...args: any[]) => void;
export declare function waitUntil(condition: () => boolean, callback: () => void, timeout?: number, timeoutMessage?: string): void;
export declare function compose(...fns: Function[]): (arg: any) => any;
export declare function callIfPresent(func: Function): void;
export declare const noop: () => void;
