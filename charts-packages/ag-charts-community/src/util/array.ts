export function extent<T>(values: T[], predicate: (value: T) => boolean): [T, T] | undefined;
export function extent<T, K>(values: T[], predicate: (value: T) => boolean, map: (value: T) => K): [K, K] | undefined;
export function extent<T, K>(
    values: T[],
    predicate: (value: T) => boolean,
    map?: (value: T) => K
): [T | K, T | K] | undefined {
    const { length } = values;
    if (length === 0) {
        return undefined;
    }

    let min = Infinity as any;
    let max = -Infinity as any;

    for (let i = 0; i < length; i++) {
        const v = values[i];
        if (!predicate(v)) {
            continue;
        }
        if (v < min) {
            min = v;
        }
        if (v > max) {
            max = v;
        }
    }
    const extent = [min, max];
    if (extent.some((v) => !isFinite(v))) {
        return undefined;
    }
    if (map) {
        return extent.map(map) as [K, K];
    }
    return extent as [T, T];
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
