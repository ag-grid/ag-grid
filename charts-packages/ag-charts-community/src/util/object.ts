/**
 * Creates a new object with a `parent` as its prototype
 * and copies properties from the `child` into it.
 * @param parent
 * @param child
 */
export function chainObjects<P extends object, C extends object>(parent: P, child: C): P & C {
    const obj = Object.create(parent) as P;
    for (const prop in child) {
        if (child.hasOwnProperty(prop)) {
            (obj as any)[prop] = child[prop];
        }
    }
    return obj as P & C;
}

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

function emptyTarget(value: any) {
    return Array.isArray(value) ? [] : {};
}

export function cloneUnlessOtherwiseSpecified(value: any, options: any) {
    return options.clone !== false && options.isMergeableObject(value)
        ? deepMerge(emptyTarget(value), value, options)
        : value;
}

export function defaultArrayMerge(target: any, source: any, options: any) {
    return target.concat(source).map(function (element: any) {
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
    return Object.getOwnPropertySymbols
        ? Object.getOwnPropertySymbols(target).filter(function (symbol) {
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
    return (
        propertyIsOnObject(target, key) && // Properties are safe to merge if they don't exist in the target yet,
        !(
            Object.hasOwnProperty.call(target, key) && // unsafe if they exist up the prototype chain,
            Object.propertyIsEnumerable.call(target, key)
        )
    ); // and also unsafe if they're nonenumerable.
}

function mergeObject(target: any, source: any, options: any) {
    const destination: any = {};
    if (options.isMergeableObject(target)) {
        getKeys(target).forEach(function (key) {
            destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
        });
    }
    getKeys(source).forEach(function (key) {
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

export function defaultIsMergeableObject(value: any): boolean {
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

// Be careful, typeof null === 'object'!
export function isObject(value: any): boolean {
    return value && typeof value === 'object';
}
