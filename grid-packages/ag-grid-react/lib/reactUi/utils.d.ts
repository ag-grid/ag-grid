// ag-grid-react v29.3.3
export declare const classesList: (...list: (string | null | undefined)[]) => string;
export declare class CssClasses {
    private classesMap;
    constructor(...initialClasses: string[]);
    setClass(className: string, on: boolean): CssClasses;
    toString(): string;
}
export declare const isComponentStateless: (Component: any) => boolean;
export declare const FlushSyncToggle: {
    on: () => boolean;
    off: () => boolean;
};
/**
 * Wrapper around flushSync to provide backwards compatibility with React 16-17
 * @param fn
 */
export declare const agFlushSync: (fn: () => void) => void;
