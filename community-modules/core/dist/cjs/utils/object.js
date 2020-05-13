/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.1.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var generic_1 = require("./generic");
function iterateObject(object, callback) {
    if (!object || generic_1.missing(object)) {
        return;
    }
    if (Array.isArray(object)) {
        object.forEach(function (value, index) { return callback("" + index, value); });
    }
    else {
        Object.keys(object).forEach(function (key) { return callback(key, object[key]); });
    }
}
exports.iterateObject = iterateObject;
function cloneObject(object) {
    var copy = {};
    var keys = Object.keys(object);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = object[key];
        copy[key] = value;
    }
    return copy;
}
exports.cloneObject = cloneObject;
function deepCloneObject(object) {
    return JSON.parse(JSON.stringify(object));
}
exports.deepCloneObject = deepCloneObject;
function getProperty(object, key) {
    return object[key];
}
exports.getProperty = getProperty;
function setProperty(object, key, value) {
    object[key] = value;
}
exports.setProperty = setProperty;
/**
 * Will copy the specified properties from `source` into the equivalent properties on `target`, ignoring properties with
 * a value of `undefined`.
 */
function copyPropertiesIfPresent(source, target) {
    var properties = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        properties[_i - 2] = arguments[_i];
    }
    properties.forEach(function (p) { return copyPropertyIfPresent(source, target, p); });
}
exports.copyPropertiesIfPresent = copyPropertiesIfPresent;
/**
 * Will copy the specified property from `source` into the equivalent property on `target`, unless the property has a
 * value of `undefined`. If a transformation is provided, it will be applied to the value before being set on `target`.
 */
function copyPropertyIfPresent(source, target, property, transform) {
    var value = getProperty(source, property);
    if (value !== undefined) {
        setProperty(target, property, transform ? transform(value) : value);
    }
}
exports.copyPropertyIfPresent = copyPropertyIfPresent;
function getAllKeysInObjects(objects) {
    var allValues = {};
    objects.filter(function (obj) { return obj != null; }).forEach(function (obj) {
        Object.keys(obj).forEach(function (key) { return allValues[key] = null; });
    });
    return Object.keys(allValues);
}
exports.getAllKeysInObjects = getAllKeysInObjects;
function mergeDeep(dest, source, copyUndefined) {
    if (copyUndefined === void 0) { copyUndefined = true; }
    if (!generic_1.exists(source)) {
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
exports.mergeDeep = mergeDeep;
function assign(object) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    sources.forEach(function (source) {
        if (generic_1.exists(source)) {
            iterateObject(source, function (key, value) {
                object[key] = value;
            });
        }
    });
    return object;
}
exports.assign = assign;
function missingOrEmptyObject(value) {
    return generic_1.missing(value) || Object.keys(value).length === 0;
}
exports.missingOrEmptyObject = missingOrEmptyObject;
function get(source, expression, defaultValue) {
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
exports.get = get;
function set(target, expression, value) {
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
exports.set = set;
function deepFreeze(object) {
    Object.freeze(object);
    generic_1.values(object).filter(function (v) { return v != null; }).forEach(function (v) {
        if (typeof v === 'object' || typeof v === 'function') {
            deepFreeze(v);
        }
    });
    return object;
}
exports.deepFreeze = deepFreeze;
function getValueUsingField(data, field, fieldContainsDots) {
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
        if (generic_1.missing(currentObject)) {
            return null;
        }
    }
    return currentObject;
}
exports.getValueUsingField = getValueUsingField;

//# sourceMappingURL=object.js.map
