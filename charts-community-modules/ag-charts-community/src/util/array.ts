export function extent(values: Array<number | Date>): [number, number] | undefined {
    const { length } = values;
    if (length === 0) {
        return undefined;
    }

    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < length; i++) {
        let v = values[i];
        if (v instanceof Date) {
            v = v.getTime();
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

export function normalisedExtent(d: number[], min: number, max: number) {
    if (d.length > 2) {
        d = extent(d) ?? [NaN, NaN];
    }
    if (!isNaN(min)) {
        d = [min, d[1]];
    }
    if (!isNaN(max)) {
        d = [d[0], max];
    }
    if (d[0] > d[1]) {
        d = [];
    }
    return d;
}
