export function convertToMap(list) {
    var map = new Map();
    list.forEach(function (_a) {
        var key = _a[0], value = _a[1];
        return map.set(key, value);
    });
    return map;
}
