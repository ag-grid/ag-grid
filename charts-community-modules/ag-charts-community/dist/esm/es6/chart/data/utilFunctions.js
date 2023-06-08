export function extendDomain(values, domain = [Infinity, -Infinity]) {
    for (const value of values) {
        if (typeof value !== 'number') {
            continue;
        }
        if (value < domain[0]) {
            domain[0] = value;
        }
        if (value > domain[1]) {
            domain[1] = value;
        }
    }
    return domain;
}
