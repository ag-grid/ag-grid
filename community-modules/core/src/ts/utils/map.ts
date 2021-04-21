export function convertToMap<K, V>(arr: [K, V][]): Map<K, V> {
    const map = new Map<K, V>();

    arr.forEach(pair => map.set(pair[0], pair[1]));

    return map;
}

export function keys<T>(map: Map<T, any>): T[] {
    const arr: T[] = [];

    map.forEach((_, key) => arr.push(key));

    return arr;
}