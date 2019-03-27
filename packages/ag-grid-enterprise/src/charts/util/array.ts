/**
 * Returns the minimum and maximum value in the given iterable using natural order.
 * If the iterable contains no comparable values, returns `[undefined, undefined]`.
 * @param values
 */
export function extent<T>(values: T[]): [T?, T?] {
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
