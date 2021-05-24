/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
import { missing, exists, values } from './generic';
import { forEach } from './array';
export function iterateObject(object, callback) {
    if (object == null) {
        return;
    }
    if (Array.isArray(object)) {
        forEach(object, function (value, index) { return callback("" + index, value); });
    }
    else {
        forEach(Object.keys(object), function (key) { return callback(key, object[key]); });
    }
}
export function cloneObject(object) {
    var copy = {};
    var keys = Object.keys(object);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = object[key];
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
    var obj = object;
    var res = {};
    Object.keys(obj).forEach(function (key) {
        if (keysToSkip && keysToSkip.indexOf(key) >= 0) {
            return;
        }
        var value = obj[key];
        // 'simple object' means a bunch of key/value pairs, eg {filter: 'myFilter'}. it does
        // NOT include the following:
        // 1) arrays
        // 2) functions or classes (eg ColumnAPI instance)
        var sourceIsSimpleObject = isNonNullObject(value) && value.constructor === Object;
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
export function copyPropertiesIfPresent(source, target) {
    var properties = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        properties[_i - 2] = arguments[_i];
    }
    forEach(properties, function (p) { return copyPropertyIfPresent(source, target, p); });
}
/**
 * Will copy the specified property from `source` into the equivalent property on `target`, unless the property has a
 * value of `undefined`. If a transformation is provided, it will be applied to the value before being set on `target`.
 */
export function copyPropertyIfPresent(source, target, property, transform) {
    var value = getProperty(source, property);
    if (value !== undefined) {
        setProperty(target, property, transform ? transform(value) : value);
    }
}
export function getAllKeysInObjects(objects) {
    var allValues = {};
    objects.filter(function (obj) { return obj != null; }).forEach(function (obj) {
        forEach(Object.keys(obj), function (key) { return allValues[key] = null; });
    });
    return Object.keys(allValues);
}
export function getAllValuesInObject(obj) {
    if (!obj) {
        return [];
    }
    var anyObject = Object;
    if (typeof anyObject.values === 'function') {
        return anyObject.values(obj);
    }
    var ret = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key) && obj.propertyIsEnumerable(key)) {
            ret.push(obj[key]);
        }
    }
    return ret;
}
export function mergeDeep(dest, source, copyUndefined, makeCopyOfSimpleObjects) {
    if (copyUndefined === void 0) { copyUndefined = true; }
    if (makeCopyOfSimpleObjects === void 0) { makeCopyOfSimpleObjects = false; }
    if (!exists(source)) {
        return;
    }
    iterateObject(source, function (key, sourceValue) {
        var destValue = dest[key];
        if (destValue === sourceValue) {
            return;
        }
        // when creating params, we don't want to just copy objects over. otherwise merging ColDefs (eg DefaultColDef
        // and Column Types) would result in params getting shared between objects.
        // by putting an empty value into destValue first, it means we end up copying over values from
        // the source object, rather than just copying in the source object in it's entirety.
        if (makeCopyOfSimpleObjects) {
            var objectIsDueToBeCopied = destValue == null && sourceValue != null;
            if (objectIsDueToBeCopied) {
                // 'simple object' means a bunch of key/value pairs, eg {filter: 'myFilter'}, as opposed
                // to a Class instance (such as ColumnAPI instance).
                var sourceIsSimpleObject = typeof sourceValue === 'object' && sourceValue.constructor === Object;
                var dontCopy = sourceIsSimpleObject;
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
export function assign(object) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    forEach(sources, function (source) { return iterateObject(source, function (key, value) { return object[key] = value; }); });
    return object;
}
export function missingOrEmptyObject(value) {
    return missing(value) || Object.keys(value).length === 0;
}
export function get(source, expression, defaultValue) {
    if (source == null) {
        return defaultValue;
    }
    var keys = expression.split('.');
    var objectToRead = source;
    while (keys.length > 1) {
        objectToRead = objectToRead[keys.shift()];
        if (objectToRead == null) {
            return defaultValue;
        }
    }
    var value = objectToRead[keys[0]];
    return value != null ? value : defaultValue;
}
export function set(target, expression, value) {
    if (target == null) {
        return;
    }
    var keys = expression.split('.');
    var objectToUpdate = target;
    while (keys.length > 1) {
        objectToUpdate = objectToUpdate[keys.shift()];
        if (objectToUpdate == null) {
            return;
        }
    }
    objectToUpdate[keys[0]] = value;
}
export function deepFreeze(object) {
    Object.freeze(object);
    forEach(values(object), function (v) {
        if (isNonNullObject(v) || typeof v === 'function') {
            deepFreeze(v);
        }
    });
    return object;
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
    var fields = field.split('.');
    var currentObject = data;
    for (var i = 0; i < fields.length; i++) {
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
    Object.keys(obj).forEach(function (key) {
        var value = obj[key];
        // we want to replace all the @autowired services, which are objects. any simple types (boolean, string etc)
        // we don't care about
        if (typeof value === 'object') {
            obj[key] = undefined;
        }
    });
    var proto = Object.getPrototypeOf(obj);
    var properties = {};
    Object.keys(proto).forEach(function (key) {
        var value = proto[key];
        // leave all basic types - this is needed for GridAPI to leave the "destroyed: boolean" attribute alone
        if (typeof value === 'function') {
            var func = function () {
                console.warn("AG Grid: " + objectName + " function " + key + "() cannot be called as the grid has been destroyed.\n                     Please don't call grid API functions on destroyed grids - as a matter of fact you shouldn't\n                     be keeping the API reference, your application has a memory leak! Remove the API reference\n                     when the grid is destroyed.");
            };
            properties[key] = { value: func, writable: true };
        }
    });
    Object.defineProperties(obj, properties);
}
export function isNonNullObject(value) {
    return typeof value === 'object' && value !== null;
}
