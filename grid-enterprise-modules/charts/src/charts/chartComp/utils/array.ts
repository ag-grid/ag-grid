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
