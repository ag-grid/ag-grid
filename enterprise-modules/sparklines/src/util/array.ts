function identity<T>(value: T): T {
    return value;
}

export function extent<T>(values: T[], predicate: (value: T) => boolean): [T, T] | undefined;
export function extent<T, K>(values: T[], predicate: (value: T) => boolean, map: (value: T) => K): [K, K] | undefined;
export function extent<T, K>(values: T[], predicate: (value: T) => boolean, map?: (value: T) => K): [T | K, T | K] | undefined {
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
