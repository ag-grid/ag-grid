export function deepMerge(target, source) {
    if (isPlainObject(target) && isPlainObject(source)) {
        const result = {};
        Object.keys(target).forEach((key) => {
            if (key in source) {
                result[key] = deepMerge(target[key], source[key]);
            }
            else {
                result[key] = target[key];
            }
        });
        Object.keys(source).forEach((key) => {
            if (!(key in target)) {
                result[key] = source[key];
            }
        });
        return result;
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
