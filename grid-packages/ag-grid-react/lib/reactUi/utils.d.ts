// ag-grid-react v27.3.0
export declare const classesList: (...list: string[]) => string;
export declare class CssClasses {
    private classesMap;
    constructor(...initialClasses: string[]);
    setClass(className: string, on: boolean): CssClasses;
    toString(): string;
}
export declare const isComponentStateless: (Component: any) => boolean;
