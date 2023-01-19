export function getValue(object: any, path: string | string[], defaultValue?: any): any {
    const parts = Array.isArray(path) ? path : path.split('.');
    let value = object;
    try {
        parts.forEach((part) => {
            value = value[part];
        });
    } catch (e) {
        if (arguments.length === 3) {
            value = defaultValue;
        } else {
            throw e;
        }
    }
    return value;
}

export function deepMerge(target: any, source: any) {
    if (isPlainObject(target) && isPlainObject(source)) {
        const result: Record<string, any> = {};
        Object.keys(target).forEach((key) => {
            if (key in source) {
                result[key] = deepMerge(target[key], source[key]);
            } else {
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

export function isObject(value: any): value is Object {
    return value && typeof value === 'object';
}

function isPlainObject(x: any): x is Object {
    return isObject(x) && x.constructor === Object;
}
