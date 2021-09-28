export declare function firstExistingValue<A>(...values: A[]): A | null;
/** @deprecated */
export declare function anyExists(values: any[]): boolean;
export declare function existsAndNotEmpty<T>(value?: T[]): boolean;
export declare function last<T>(arr: T[]): T;
export declare function last<T extends Node>(arr: NodeListOf<T>): T;
export declare function areEqual<T>(a?: T[] | null, b?: T[] | null, comparator?: (a: T, b: T) => boolean): boolean;
/** @deprecated */
export declare function compareArrays(array1?: any[], array2?: any[]): boolean;
/** @deprecated */
export declare function shallowCompare(arr1: any[], arr2: any[]): boolean;
export declare function sortNumerically(array: number[]): number[];
export declare function removeRepeatsFromArray<T>(array: T[], object: T): void;
export declare function removeFromArray<T>(array: T[], object: T): void;
export declare function removeAllFromArray<T>(array: T[], toRemove: T[]): void;
export declare function insertIntoArray<T>(array: T[], object: T, toIndex: number): void;
export declare function insertArrayIntoArray<T>(dest: T[], src: T[], toIndex: number): void;
export declare function moveInArray<T>(array: T[], objectsToMove: T[], toIndex: number): void;
export declare function includes<T>(array: T[], value: T): boolean;
export declare function flatten(arrayOfArrays: any[]): any[];
export declare function pushAll<T>(target: T[], source: T[]): void;
export declare function toStrings<T>(array: T[]): ((string | null)[]) | null;
export declare function findIndex<T>(collection: T[], predicate: (item: T, idx: number, collection: T[]) => boolean): number;
export declare function fill(collection: any[], value?: any, start?: number, end?: number): any[];
/**
 * The implementation of Array.prototype.every in browsers is always slower than just using a simple for loop, so
 * use this for improved performance.
 * https://jsbench.me/bek91dtit8/
 */
export declare function every<T>(list: T[], predicate: (value: T, index: number) => boolean): boolean;
/**
 * The implementation of Array.prototype.some in browsers is always slower than just using a simple for loop, so
 * use this for improved performance.
 * https://jsbench.me/5dk91e4tmt/
 */
export declare function some<T>(list: T[], predicate: (value: T, index: number) => boolean): boolean;
/**
 * The implementation of Array.prototype.forEach in browsers is often slower than just using a simple for loop, so
 * use this for improved performance.
 * https://jsbench.me/apk91elt8a/
 */
export declare function forEach<T>(list: T[], action: (value: T, index: number) => void): void;
export declare function forEachReverse<T>(list: T[], action: (value: T, index: number) => void): void;
/**
 * The implementation of Array.prototype.map in browsers is generally the same as just using a simple for loop. However,
 * Firefox does exhibit some difference, and this performs no worse in other browsers, so use this if you want improved
 * performance.
 * https://jsbench.me/njk91ez8pc/
 */
export declare function map<T, V>(list: T[], process: (value: T, index: number) => V): V[] | null;
/**
 * The implementation of Array.prototype.filter in browsers is always slower than just using a simple for loop, so
 * use this for improved performance.
 * https://jsbench.me/7bk91fk08c/
 */
export declare function filter<T>(list: T[], predicate: (value: T, index: number) => boolean): T[] | null;
/**
 * The implementation of Array.prototype.reduce in browsers is generally the same as just using a simple for loop. However,
 * Chrome does exhibit some difference, and this performs no worse in other browsers, so use this if you want improved
 * performance.
 * https://jsbench.me/7vk92n6u1f/
 */
export declare function reduce<T, V>(list: T[], step: (acc: V, value: T, index: number) => V, initial: V): V | null;
/** @deprecated */
export declare function forEachSnapshotFirst<T>(list: T[], callback: (item: T) => void): void;
