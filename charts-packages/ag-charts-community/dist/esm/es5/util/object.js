export function deepMerge(target, source) {
    if (isPlainObject(target) && isPlainObject(source)) {
        var result_1 = {};
        Object.keys(target).forEach(function (key) {
            if (key in source) {
                result_1[key] = deepMerge(target[key], source[key]);
            }
            else {
                result_1[key] = target[key];
            }
        });
        Object.keys(source).forEach(function (key) {
            if (!(key in target)) {
                result_1[key] = source[key];
            }
        });
        return result_1;
    }
    if ((Array.isArray(target) && !Array.isArray(source)) || (isObject(target) && !isObject(source))) {
        return target;
    }
    return source;
}
function isObject(value) {
    return value && typeof value === 'object';
}
function isPlainObject(x) {
    return isObject(x) && x.constructor === Object;
}
