export function convertToMap<T1, T2>(list: [T1, T2][]): Map<T1, T2> {
    const map = new Map<T1, T2>();

    list.forEach(([key, value]) => map.set(key, value));

    return map;
}
