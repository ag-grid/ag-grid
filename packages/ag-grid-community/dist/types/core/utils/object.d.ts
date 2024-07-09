export declare const SKIP_JS_BUILTINS: Set<string>;
export declare function _iterateObject<T>(object: {
    [p: string]: T;
} | T[] | null | undefined, callback: (key: string, value: T) => void): void;
export declare function _cloneObject<T extends object>(object: T): T;
export declare function _deepCloneDefinition<T>(object: T, keysToSkip?: string[]): T | undefined;
export declare function _getAllValuesInObject<T extends object, K extends keyof T, O extends T[K]>(obj: T): O[];
export declare function _mergeDeep(dest: any, source: any, copyUndefined?: boolean, makeCopyOfSimpleObjects?: boolean): void;
export declare function _getValueUsingField(data: any, field: string, fieldContainsDots: boolean): any;
export declare function _isNonNullObject(value: any): boolean;
