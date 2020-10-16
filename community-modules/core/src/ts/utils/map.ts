export function keys<T>(map: Map<T, any>): T[] {
    const arr: T[] = [];

    map.forEach((_, key) => arr.push(key));

    return arr;
}
