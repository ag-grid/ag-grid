export function convertToMap(list) {
    const map = new Map();
    list.forEach(([key, value]) => map.set(key, value));
    return map;
}
