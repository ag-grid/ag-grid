// Custom `Array.find` implementation for legacy browsers.
export function find(arr, predicate) {
    for (let i = 0; i < arr.length; i++) {
        const value = arr[i];
        if (predicate(value, i, arr)) {
            return value;
        }
    }
}
export function findIndex(arr, predicate) {
    for (let i = 0; i < arr.length; i++) {
        if (predicate(arr[i], i, arr)) {
            return i;
        }
    }
    return -1;
}
function identity(value) {
    return value;
}
export function extent(values, predicate, map) {
    const transform = map || identity;
    const n = values.length;
    let i = -1;
    let value;
    let min;
    let max;
    while (++i < n) { // Find the first value.
        value = values[i];
        if (predicate(value)) {
            min = max = value;
            while (++i < n) { // Compare the remaining values.
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
export function findMinMax(values) {
    let min = 0;
    let max = 0;
    for (const value of values) {
        if (value < 0) {
            min += value;
        }
        else {
            max += value;
        }
    }
    return { min, max };
}
export function copy(array, start = 0, count = array.length) {
    const result = [];
    const n = array.length;
    if (n) {
        for (let i = 0; i < count; i++) {
            result.push(array[(start + i) % n]);
        }
    }
    return result;
}
