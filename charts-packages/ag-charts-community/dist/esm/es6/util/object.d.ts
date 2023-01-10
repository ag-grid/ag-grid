/**
 * Creates a new object with a `parent` as its prototype
 * and copies properties from the `child` into it.
 * @param parent
 * @param child
 */
export declare function chainObjects<P extends object, C extends object>(parent: P, child: C): P & C;
export declare function getValue(object: any, path: string | string[], defaultValue?: any): any;
export declare function defaultIsMergeableObject(value: any): boolean;
export declare function deepMerge(target: any, source: any, options?: any): any;
export declare function isObject(value: any): boolean;
