export declare function extent(values: Array<number | Date>): [number, number] | undefined;
/**
 * finds the min and max using a process appropriate for stacked values. Ie,
 * summing up the positive and negative numbers, and returning the totals of each
 */
export declare function findMinMax(values: number[]): {
    min?: number;
    max?: number;
};
