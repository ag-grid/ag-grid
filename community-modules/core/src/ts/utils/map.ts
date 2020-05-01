export function keys<T>(map: Map<T, any>): T[] {
    const keys: T[] = [];

    map.forEach((_, key) => keys.push(key));

    return keys;
}
