// deepMerge
function emptyTarget(value: any) {
    return Array.isArray(value) ? [] : {};
}

function cloneUnlessOtherwiseSpecified(value: any, options: any) {
    return (options.clone !== false && options.isMergeableObject(value))
        ? deepMerge(emptyTarget(value), value, options)
        : value;
}

function defaultArrayMerge(target: any, source: any, options: any) {
    return target.concat(source).map(function(element: any) {
        return cloneUnlessOtherwiseSpecified(element, options);
    });
}

function getMergeFunction(key: string, options: any) {
    if (!options.customMerge) {
        return deepMerge;
    }
    const customMerge = options.customMerge(key);
    return typeof customMerge === 'function' ? customMerge : deepMerge;
}

function getEnumerableOwnPropertySymbols(target: any): any[] {
    // @ts-ignore
    return Object.getOwnPropertySymbols 
    // @ts-ignore
        ? Object.getOwnPropertySymbols(target).filter(function(symbol) {
            return target.propertyIsEnumerable(symbol);
        }) 
        : [];
}

function getKeys(target: any): any[] {
    return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
}

function propertyIsOnObject(object: any, property: string) {
    try {
        return property in object;
    } catch (_) {
        return false;
    }
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target: any, key: string) {
    return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
        && !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
            && Object.propertyIsEnumerable.call(target, key)); // and also unsafe if they're nonenumerable.
}

function mergeObject(target: Record<string, any> = {}, source: Record<string, any> = {}, options: any) {
    const destination: any = {};
    if (options.isMergeableObject(target)) {
        getKeys(target).forEach(function(key) {
            destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
        });
    }
    getKeys(source).forEach(function(key) {
        if (propertyIsUnsafe(target, key)) {
            return;
        }
        if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
            destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
        } else {
            destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
        }
    });
    return destination;
}

function defaultIsMergeableObject(value: any): boolean {
    return isNonNullObject(value) && !isSpecial(value);
}

function isNonNullObject(value: any): boolean {
    return !!value && typeof value === 'object';
}

function isSpecial(value: any): boolean {
    const stringValue = Object.prototype.toString.call(value);
    return stringValue === '[object RegExp]' || stringValue === '[object Date]';
}

export function deepMerge(target: any, source: any, options?: any): any {
    options = options || {};
    options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    options.isMergeableObject = options.isMergeableObject || defaultIsMergeableObject;
    // cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
    // implementations can use it. The caller may not replace it.
    options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

    const sourceIsArray = Array.isArray(source);
    const targetIsArray = Array.isArray(target);
    const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

    if (!sourceAndTargetTypesMatch) {
        return cloneUnlessOtherwiseSpecified(source, options);
    } else if (sourceIsArray) {
        return options.arrayMerge(target, source, options);
    } else {
        return mergeObject(target, source, options);
    }
}
// END - deep merge

export function mergeDeep(dest: any, source: any, copyUndefined = true, objectsThatNeedCopy: string[] = [], iteration = 0): void {
    if (!exists(source)) { return; }

    iterateObject(source, (key: string, sourceValue: any) => {
        let destValue: any = dest[key];

        if (destValue === sourceValue) { return; }

        const dontCopyOverSourceObject = iteration == 0 && destValue == null && sourceValue != null && objectsThatNeedCopy.indexOf(key) >= 0;
        if (dontCopyOverSourceObject) {
            // by putting an empty value into destValue first, it means we end up copying over values from
            // the source object, rather than just copying in the source object in it's entirety.
            destValue = {};
            dest[key] = destValue;
        }

        if (typeof destValue === 'object' && typeof sourceValue === 'object' && !Array.isArray(destValue)) {
            mergeDeep(destValue, sourceValue, copyUndefined, objectsThatNeedCopy, iteration++);
        } else if (copyUndefined || sourceValue !== undefined) {
            dest[key] = sourceValue;
        }
    });
}

function iterateObject<T>(object: { [p: string]: T; } | T[] | undefined, callback: (key: string, value: T) => void) {
    if (object == null) { return; }

    if (Array.isArray(object)) {
        forEach(object, (value, index) => callback(`${index}`, value));
    } else {
        forEach(Object.keys(object), key => callback(key, object[key]));
    }
}

export function exists<T>(value: T, allowEmptyString = false): boolean {
    return value != null && (allowEmptyString || value as any !== '');
}

function forEach<T>(list: T[], action: (value: T, index: number) => void): void {
    if (list == null) {
        return;
    }

    for (let i = 0; i < list.length; i++) {
        action(list[i], i);
    }
}