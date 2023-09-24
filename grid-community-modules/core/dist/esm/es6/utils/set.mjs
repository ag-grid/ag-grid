export function convertToSet(list) {
    const set = new Set();
    list.forEach(x => set.add(x));
    return set;
}
