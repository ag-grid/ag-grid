// ag-grid-react v31.0.3
export declare const classesList: (...list: (string | null | undefined)[]) => string;
export declare class CssClasses {
    private classesMap;
    constructor(...initialClasses: string[]);
    setClass(className: string, on: boolean): CssClasses;
    toString(): string;
}
export declare const isComponentStateless: (Component: any) => boolean;
/**
 * Wrapper around flushSync to provide backwards compatibility with React 16-17
 * Also allows us to control via the `useFlushSync` param whether we want to use flushSync or not
 * as we do not want to use flushSync when we are likely to already be in a render cycle
 */
export declare const agFlushSync: (useFlushSync: boolean, fn: () => void) => void;
/**
 * The aim of this function is to maintain references to prev or next values where possible.
 * If there are not real changes then return the prev value to avoid unnecessary renders.
 * @param maintainOrder If we want to maintain the order of the elements in the dom in line with the next array
 * @returns
 */
export declare function getNextValueIfDifferent<T extends {
    getInstanceId: () => string;
}>(prev: T[] | null, next: T[] | null, maintainOrder: boolean): T[] | null;
