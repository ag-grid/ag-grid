export function convertToMap<K, V>(arr: [K, V][]): Map<K, V> {
    const map = new Map<K, V>();

    arr.forEach(pair => map.set(pair[0], pair[1]));

    return map;
}

// handy for organising a list into a map, where each item is mapped by an attribute, eg mapping Columns by ID
export function mapById<V>(arr: V[], callback: (obj: V) => string): Map<string, V> {
    const map = new Map<string, V>();

    arr.forEach(item => map.set(callback(item), item));

    return map;
}

export function keys<T>(map: Map<T, any>): T[] {
    const arr: T[] = [];

    map.forEach((_, key) => arr.push(key));

    return arr;
}