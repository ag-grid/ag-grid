export function extent(values: number[]): [number, number] | undefined {
    const { length } = values;
    if (length === 0) {
        return undefined;
    }

    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < length; i++) {
        let v = values[i];
        if ((v as any) instanceof Date) {
            v = (v as any).getTime();
        }
        if (typeof v !== 'number') {
            continue;
        }
        if (v < min) {
            min = v;
        }
        if (v > max) {
            max = v;
        }
    }
    const extent = [min, max] as [number, number];
    if (extent.some((v) => !isFinite(v))) {
        return undefined;
    }
    return extent;
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
