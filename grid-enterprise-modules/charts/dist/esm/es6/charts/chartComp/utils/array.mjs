export function partition(items, selector) {
    return items.reduce((groupedItems, item) => {
        const key = selector(item);
        const existingItems = groupedItems.get(key);
        return groupedItems.set(key, existingItems ? [...existingItems, item] : [item]);
    }, new Map());
}
export function flatMap(items, iteratee) {
    return items.reduce((acc, item, index, array) => acc.concat(iteratee(item, index, array)), new Array());
}
