export declare const classesList: (...list: (string | null | undefined)[]) => string;
export declare class CssClasses {
    private classesMap;
    constructor(...initialClasses: string[]);
    setClass(className: string, on: boolean): CssClasses;
    toString(): string;
}
export declare const isComponentStateless: (Component: any) => boolean;
export interface RefPointer<T> {
    instance?: T;
    afterSet?: (ref: T) => void;
}
