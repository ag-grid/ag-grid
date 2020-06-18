/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
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
export function mergeDeep(dest, source, copyUndefined) {
    if (copyUndefined === void 0) { copyUndefined = true; }
    if (!exists(source)) {
        return;
    }
    iterateObject(source, function (key, newValue) {
        var oldValue = dest[key];
        if (oldValue === newValue) {
            return;
        }
        if (typeof oldValue === 'object' && typeof newValue === 'object' && !Array.isArray(oldValue)) {
            mergeDeep(oldValue, newValue);
        }
        else if (copyUndefined || newValue !== undefined) {
            dest[key] = newValue;
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
        if (v != null && (typeof v === 'object' || typeof v === 'function')) {
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
        currentObject = currentObject[fields[i]];
        if (missing(currentObject)) {
            return null;
        }
    }
    return currentObject;
}
