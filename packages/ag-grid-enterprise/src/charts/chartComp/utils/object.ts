// Prevents the risk of prototype pollution
const SKIP_JS_BUILTINS = new Set<string>(['__proto__', 'constructor', 'prototype']);

export function get(source: any, expression: string, defaultValue: any): any {
    if (source == null) {
        return defaultValue;
    }

    const keys = expression.split('.');
    let objectToRead = source;

    while (keys.length > 1) {
        objectToRead = objectToRead[keys.shift()!];

        if (objectToRead == null) {
            return defaultValue;
        }
    }

    const value = objectToRead[keys[0]];

    return value != null ? value : defaultValue;
}

export function set(target: any, expression: string, value: any) {
    if (target == null) {
        return;
    }

    const keys = expression.split('.');

    let objectToUpdate = target;
    // Create empty objects
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (SKIP_JS_BUILTINS.has(key)) {
            continue;
        }
        if (!objectToUpdate[key]) {
            objectToUpdate[key] = {};
        }
        if (i < keys.length - 1) {
            objectToUpdate = objectToUpdate[key];
        }
    }

    objectToUpdate[keys[keys.length - 1]] = value;
}
