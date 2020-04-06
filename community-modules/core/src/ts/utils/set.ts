export function convertToSet<T>(list: T[]): Set<T> {
    const set = new Set<T>();

    list.forEach(x => set.add(x));

    return set;
}
