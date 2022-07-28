// Custom `Array.find` implementation for legacy browsers.
export function find<T>(arr: T[], predicate: (item: T, index: number, arr: T[]) => boolean): T | undefined {
    for (let i = 0; i < arr.length; i++) {
        const value = arr[i];
        if (predicate(value, i, arr)) {
            return value;
        }
    }
}

export function findIndex<T>(arr: T[], predicate: (item: T, index: number, arr: T[]) => boolean): number {
    for (let i = 0; i < arr.length; i++) {
        if (predicate(arr[i], i, arr)) {
            return i;
        }
    }
    return -1;
}

function identity<T>(value: T): T {
    return value;
}

export function extent<T>(values: T[], predicate: (value: T) => boolean): [T, T] | undefined;
export function extent<T, K>(values: T[], predicate: (value: T) => boolean, map: (value: T) => K): [K, K] | undefined;
export function extent<T, K>(
    values: T[],
    predicate: (value: T) => boolean,
    map?: (value: T) => K
): [T | K, T | K] | undefined {
    const transform = map || identity;
    const n = values.length;
    let i = -1;
    let value;
    let min;
    let max;

    while (++i < n) {
        // Find the first value.
        value = values[i];
        if (predicate(value)) {
            min = max = value;
            while (++i < n) {
                // Compare the remaining values.
                value = values[i];
                if (predicate(value)) {
                    if (min > value) {
                        min = value;
                    }
                    if (max < value) {
                        max = value;
                    }
                }
            }
        }
    }

    return min === undefined || max === undefined ? undefined : [transform(min), transform(max)];
}

/**
 * finds the min and max using a process appropriate for stacked values. Ie,
 * summing up the positive and negative numbers, and returning the totals of each
 */
export function findMinMax(values: number[]): { min?: number; max?: number } {
    let min: number | undefined = undefined;
    let max: number | undefined = undefined;

    for (const value of values) {
        if (value < 0) {
            min = (min ?? 0) + value;
        } else if (value >= 0) {
            max = (max ?? 0) + value;
        }
    }

    return { min, max };
}

export function copy(array: any[], start: number = 0, count: number = array.length): any[] {
    const result = [];
    let n = array.length;

    if (n) {
        for (let i = 0; i < count; i++) {
            result.push(array[(start + i) % n]);
        }
    }

    return result;
}
