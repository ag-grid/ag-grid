export function extent(values) {
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
    const extent = [min, max];
    if (extent.some((v) => !isFinite(v))) {
        return undefined;
    }
    return extent;
}
