
export function omit<K extends string, T extends Record<K, unknown>>(input: T, ...omit: K[]): Omit<T, (typeof omit)[number]> {
    const result = {...input};
    omit.forEach(k => delete result[k]);
    return result;
}
