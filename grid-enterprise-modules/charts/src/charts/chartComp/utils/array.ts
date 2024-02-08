export function partition<T, K>(items: T[], selector: (item: T) => K): Map<K, T[]> {
    return items.reduce(
        (groupedItems, item) => {
            const key = selector(item);
            const existingItems = groupedItems.get(key);
            return groupedItems.set(key, existingItems ? [...existingItems, item] : [item]);
        },
        new Map<K, T[]>(),
    )
}

export function flatMap<T, V>(items: T[], iteratee: (item: T) => V[]): V[] {
    return items.reduce((acc, item) => acc.concat(iteratee(item)), new Array<V>());
}