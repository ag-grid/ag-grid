/**
 * Returns the minimum and maximum value in the given iterable using natural order.
 * If the iterable contains no comparable values, returns `[undefined, undefined]`.
 * @param values
 */
export function extent<T>(values: T[]): [T | undefined, T | undefined] {
    const n = values.length;
    let i = -1;
    let value;
    let min;
    let max;

    while (++i < n) { // Find the first comparable value.
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

    return [min, max];
}

export function find<T>(arr: T[], predicate: (value: T, index: number, arr: T[]) => boolean): T | undefined {
    for (let i = 0, ln = arr.length; i < ln; i++) {
        const value = arr[i];
        if (predicate(value, i, arr)) {
            return value;
        }
    }
}

// This method will only return `undefined`, if there's not a single valid finite number
// in the given array of values.
export function numericExtent<T>(values: T[]): [number, number] | undefined {
    const [min, max] = extent(values);
    if (typeof min === 'number' && isFinite(min) && typeof max === 'number' && isFinite(max)) {
        return [min, max];
    }
}
