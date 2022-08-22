export declare function find<T>(arr: T[], predicate: (item: T, index: number, arr: T[]) => boolean): T | undefined;
export declare function findIndex<T>(arr: T[], predicate: (item: T, index: number, arr: T[]) => boolean): number;
export declare function extent<T>(values: T[], predicate: (value: T) => boolean): [T, T] | undefined;
export declare function extent<T, K>(values: T[], predicate: (value: T) => boolean, map: (value: T) => K): [K, K] | undefined;
/**
 * finds the min and max using a process appropriate for stacked values. Ie,
 * summing up the positive and negative numbers, and returning the totals of each
 */
export declare function findMinMax(values: number[]): {
    min?: number;
    max?: number;
};
export declare function copy(array: any[], start?: number, count?: number): any[];
