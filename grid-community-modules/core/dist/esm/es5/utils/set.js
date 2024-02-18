export function convertToSet(list) {
    var set = new Set();
    list.forEach(function (x) { return set.add(x); });
    return set;
}
