/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
import { missing, exists } from './generic';
export function iterateObject(object, callback) {
    if (object == null) {
        return;
    }
    if (Array.isArray(object)) {
        object.forEach((value, index) => callback(`${index}`, value));
    }
    else {
        Object.keys(object).forEach(key => callback(key, object[key]));
    }
}
export function cloneObject(object) {
    const copy = {};
    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = object[key];
        copy[key] = value;
    }
    return copy;
}
export function deepCloneObject(object) {
    return JSON.parse(JSON.stringify(object));
}
// returns copy of an object, doing a deep clone of any objects with that object.
// this is used for eg creating copies of Column Definitions, where we want to
// deep copy all objects, but do not want to deep copy functions (eg when user provides
// a function or class for colDef.cellRenderer)
export function deepCloneDefinition(object, keysToSkip) {
    if (!object) {
        return;
    }
    const obj = object;
    const res = {};
    Object.keys(obj).forEach(key => {
        if (keysToSkip && keysToSkip.indexOf(key) >= 0) {
            return;
        }
        const value = obj[key];
        // 'simple object' means a bunch of key/value pairs, eg {filter: 'myFilter'}. it does
        // NOT include the following:
        // 1) arrays
        // 2) functions or classes (eg ColumnAPI instance)
        const sourceIsSimpleObject = isNonNullObject(value) && value.constructor === Object;
        if (sourceIsSimpleObject) {
            res[key] = deepCloneDefinition(value);
        }
        else {
            res[key] = value;
        }
    });
    return res;
}
export function getProperty(object, key) {
    return object[key];
}
export function setProperty(object, key, value) {
    object[key] = value;
}
/**
 * Will copy the specified properties from `source` into the equivalent properties on `target`, ignoring properties with
 * a value of `undefined`.
 */
export function copyPropertiesIfPresent(source, target, ...properties) {
    properties.forEach(p => copyPropertyIfPresent(source, target, p));
}
/**
 * Will copy the specified property from `source` into the equivalent property on `target`, unless the property has a
 * value of `undefined`. If a transformation is provided, it will be applied to the value before being set on `target`.
 */
export function copyPropertyIfPresent(source, target, property, transform) {
    const value = getProperty(source, property);
    if (value !== undefined) {
        setProperty(target, property, transform ? transform(value) : value);
    }
}
export function getAllKeysInObjects(objects) {
    const allValues = {};
    objects.filter(obj => obj != null).forEach(obj => {
        Object.keys(obj).forEach(key => allValues[key] = null);
    });
    return Object.keys(allValues);
}
export function getAllValuesInObject(obj) {
    if (!obj) {
        return [];
    }
    const anyObject = Object;
    if (typeof anyObject.values === 'function') {
        return anyObject.values(obj);
    }
    const ret = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj.propertyIsEnumerable(key)) {
            ret.push(obj[key]);
        }
    }
    return ret;
}
export function mergeDeep(dest, source, copyUndefined = true, makeCopyOfSimpleObjects = false) {
    if (!exists(source)) {
        return;
    }
    iterateObject(source, (key, sourceValue) => {
        let destValue = dest[key];
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
                // to a Class instance (such as ColumnAPI instance).
                const sourceIsSimpleObject = typeof sourceValue === 'object' && sourceValue.constructor === Object;
                const dontCopy = sourceIsSimpleObject;
                if (dontCopy) {
                    destValue = {};
                    dest[key] = destValue;
                }
            }
        }
        if (isNonNullObject(sourceValue) && isNonNullObject(destValue) && !Array.isArray(destValue)) {
            mergeDeep(destValue, sourceValue, copyUndefined, makeCopyOfSimpleObjects);
        }
        else if (copyUndefined || sourceValue !== undefined) {
            dest[key] = sourceValue;
        }
    });
}
export function missingOrEmptyObject(value) {
    return missing(value) || Object.keys(value).length === 0;
}
export function get(source, expression, defaultValue) {
    if (source == null) {
        return defaultValue;
    }
    const keys = expression.split('.');
    let objectToRead = source;
    while (keys.length > 1) {
        objectToRead = objectToRead[keys.shift()];
        if (objectToRead == null) {
            return defaultValue;
        }
    }
    const value = objectToRead[keys[0]];
    return value != null ? value : defaultValue;
}
export function set(target, expression, value) {
    if (target == null) {
        return;
    }
    const keys = expression.split('.');
    let objectToUpdate = target;
    // Create empty objects
    keys.forEach((key, i) => {
        if (!objectToUpdate[key]) {
            objectToUpdate[key] = {};
        }
        if (i < keys.length - 1) {
            objectToUpdate = objectToUpdate[key];
        }
    });
    objectToUpdate[keys[keys.length - 1]] = value;
}
export function getValueUsingField(data, field, fieldContainsDots) {
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
// used by ColumnAPI and GridAPI to remove all references, so keeping grid in memory resulting in a
// memory leak if user is not disposing of the GridAPI or ColumnApi references
export function removeAllReferences(obj, objectName) {
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        // we want to replace all the @autowired services, which are objects. any simple types (boolean, string etc)
        // we don't care about
        if (typeof value === 'object') {
            obj[key] = undefined;
        }
    });
    const proto = Object.getPrototypeOf(obj);
    const properties = {};
    Object.keys(proto).forEach(key => {
        const value = proto[key];
        // leave all basic types - this is needed for GridAPI to leave the "destroyed: boolean" attribute alone
        if (typeof value === 'function') {
            const func = () => {
                console.warn(`AG Grid: ${objectName} function ${key}() cannot be called as the grid has been destroyed.
                     Please don't call grid API functions on destroyed grids - as a matter of fact you shouldn't
                     be keeping the API reference, your application has a memory leak! Remove the API reference
                     when the grid is destroyed.`);
            };
            properties[key] = { value: func, writable: true };
        }
    });
    Object.defineProperties(obj, properties);
}
export function isNonNullObject(value) {
    return typeof value === 'object' && value !== null;
}
