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

/**
 * Returns the minimum and maximum value in the given iterable using natural order.
 * If the iterable contains no comparable values, returns `undefined`.
 * @param values
 */
export function extent<T>(values: T[]): [T, T] | undefined {
    const n = values.length;
    let i = -1;
    let value;
    let min;
    let max;

    while (++i < n) { // Find the first comparable finite value.
        if ((value = values[i]) != null && value >= value) {
            min = max = value;
            while (++i < n) { // Compare the remaining values.
                if ((value = values[i]) != null) {
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

    return typeof min === 'undefined' || typeof max === 'undefined' ? undefined : [min, max];
}

export function finiteExtent<T>(values: T[]): [T, T] | undefined {
    const n = values.length;
    let i = -1;
    let value;
    let min;
    let max;

    while (++i < n) { // Find the first comparable finite value.
        if ((value = values[i]) != null && value >= value && isFinite(value as any)) {
            min = max = value;
            while (++i < n) { // Compare the remaining values.
                if ((value = values[i]) != null && isFinite(value as any)) {
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

    return min === undefined || max === undefined ? undefined : [min, max];
}

/**
 * This method will only return `undefined` if there's not a single valid finite number present
 * in the given array of values. Date values will be converted to timestamps.
 * @param values
 */
export function numericExtent<T>(values: T[]): [number, number] | undefined {
    const calculatedExtent = finiteExtent(values);

    if (typeof calculatedExtent === 'undefined') {
        return;
    }

    const [a, b] = calculatedExtent;
    const min = a instanceof Date ? a.getTime() : a;
    const max = b instanceof Date ? b.getTime() : b;

    if (typeof min === 'number' && isFinite(min) && typeof max === 'number' && isFinite(max)) {
        return [min, max];
    }
}

/**
 * finds the min and max using a process appropriate for stacked values. Ie,
 * summing up the positive and negative numbers, and returning the totals of each
 */
export function findMinMax(values: number[]): { min: number, max: number } {
    let min = 0;
    let max = 0;

    for (const value of values) {
        if (value < 0) {
            min += value;
        } else {
            max += value;
        }
    }

    return {min, max};
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
