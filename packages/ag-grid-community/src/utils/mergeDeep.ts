import { _exists } from '../agStack/utils/generic';

// Prevents the risk of prototype pollution
export const SKIP_JS_BUILTINS = new Set<string>(['__proto__', 'constructor', 'prototype']);

function _iterateObject<T>(
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

    for (const key of Object.keys(object).filter((key) => !SKIP_JS_BUILTINS.has(key))) {
        callback(key, object[key]);
    }
}

export function _mergeDeep(dest: any, source: any, copyUndefined = true, makeCopyOfSimpleObjects = false): void {
    if (!_exists(source)) {
        return;
    }

    _iterateObject(source, (key: string, sourceValue: any) => {
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
                const doNotCopyAsSourceIsSimpleObject =
                    typeof sourceValue === 'object' && sourceValue.constructor === Object;

                if (doNotCopyAsSourceIsSimpleObject) {
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

function _isNonNullObject(value: any): value is object {
    return typeof value === 'object' && value !== null;
}
