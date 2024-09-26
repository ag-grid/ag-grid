import { _exists } from './generic';

// Prevents the risk of prototype pollution
export const SKIP_JS_BUILTINS = new Set<string>(['__proto__', 'constructor', 'prototype']);

export function _iterateObject<T>(
    object: { [p: string]: T } | T[] | null | undefined,
    callback: (key: string, value: T) => void
) {
    if (object == null) {
        return;
    }

    if (Array.isArray(object)) {
        for (let i = 0; i < object.length; i++) {
            callback(i.toString(), object[i]);
        }
        return;
    }

    for (const [key, value] of Object.entries<T>(object)) {
        callback(key, value);
    }
}

export function _cloneObject<T extends object>(object: T): T {
    const copy = {} as T;
    const keys = Object.keys(object);

    for (let i = 0; i < keys.length; i++) {
        if (SKIP_JS_BUILTINS.has(keys[i])) {
            continue;
        }

        const key = keys[i];
        const value = (object as any)[key];
        (copy as any)[key] = value;
    }

    return copy;
}

// returns copy of an object, doing a deep clone of any objects with that object.
// this is used for eg creating copies of Column Definitions, where we want to
// deep copy all objects, but do not want to deep copy functions (eg when user provides
// a function or class for colDef.cellRenderer)
export function _deepCloneDefinition<T>(object: T, keysToSkip?: string[]): T | undefined {
    if (!object) {
        return;
    }

    const obj = object as any;
    const res: any = {};

    Object.keys(obj).forEach((key) => {
        if ((keysToSkip && keysToSkip.indexOf(key) >= 0) || SKIP_JS_BUILTINS.has(key)) {
            return;
        }

        const value = obj[key];

        // 'simple object' means a bunch of key/value pairs, eg {filter: 'myFilter'}. it does
        // NOT include the following:
        // 1) arrays
        // 2) functions or classes (eg api instance)
        const sourceIsSimpleObject = _isNonNullObject(value) && value.constructor === Object;

        if (sourceIsSimpleObject) {
            res[key] = _deepCloneDefinition(value);
        } else {
            res[key] = value;
        }
    });

    return res;
}

export function _getAllValuesInObject<T extends object, K extends keyof T, O extends T[K]>(obj: T): O[] {
    if (!obj) {
        return [];
    }
    const anyObject = Object as any;
    if (typeof anyObject.values === 'function') {
        return anyObject.values(obj);
    }

    const ret: any[] = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj.propertyIsEnumerable(key)) {
            ret.push(obj[key]);
        }
    }

    return ret;
}

export function _mergeDeep(dest: any, source: any, copyUndefined = true, makeCopyOfSimpleObjects = false): void {
    if (!_exists(source)) {
        return;
    }

    _iterateObject(source, (key: string, sourceValue: any) => {
        if (SKIP_JS_BUILTINS.has(key)) {
            return;
        }

        let destValue: any = dest[key];

        if (destValue === sourceValue) {
            return;
        }

        // when creating params, we don't want to just copy objects over. otherwise merging ColDefs (eg DefaultColDef
        // and Column Types) would result in params getting shared between objects.
        // by putting an empty value into destValue first, it means we end up copying over values from
        // the source object, rather than just copying in the source object in it's entirety.
        if (makeCopyOfSimpleObjects) {
            const objectIsDueToBeCopied = destValue == null && sourceValue != null;

            if (objectIsDueToBeCopied) {
                // 'simple object' means a bunch of key/value pairs, eg {filter: 'myFilter'}, as opposed
                // to a Class instance (such as api instance).
                const sourceIsSimpleObject = typeof sourceValue === 'object' && sourceValue.constructor === Object;
                const dontCopy = sourceIsSimpleObject;

                if (dontCopy) {
                    destValue = {};
                    dest[key] = destValue;
                }
            }
        }

        if (_isNonNullObject(sourceValue) && _isNonNullObject(destValue) && !Array.isArray(destValue)) {
            _mergeDeep(destValue, sourceValue, copyUndefined, makeCopyOfSimpleObjects);
        } else if (copyUndefined || sourceValue !== undefined) {
            dest[key] = sourceValue;
        }
    });
}

export function _getValueUsingField(data: any, field: string, fieldContainsDots: boolean): any {
    if (!field || !data) {
        return;
    }

    // if no '.', then it's not a deep value
    if (!fieldContainsDots) {
        return data[field];
    }

    // otherwise it is a deep value, so need to dig for it
    const fields = field.split('.');
    let currentObject = data;

    for (let i = 0; i < fields.length; i++) {
        if (currentObject == null) {
            return undefined;
        }
        currentObject = currentObject[fields[i]];
    }

    return currentObject;
}

export function _isNonNullObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
}
