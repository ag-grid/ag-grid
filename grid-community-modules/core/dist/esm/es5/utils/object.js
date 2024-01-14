var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { missing, exists } from './generic';
export function iterateObject(object, callback) {
    var e_1, _a;
    if (object == null) {
        return;
    }
    if (Array.isArray(object)) {
        for (var i = 0; i < object.length; i++) {
            callback(i.toString(), object[i]);
        }
        return;
    }
    try {
        for (var _b = __values(Object.entries(object)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
            callback(key, value);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
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
    properties.forEach(function (p) { return copyPropertyIfPresent(source, target, p); });
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
        Object.keys(obj).forEach(function (key) { return allValues[key] = null; });
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
    // Create empty objects
    keys.forEach(function (key, i) {
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
// used by GridAPI to remove all references, so keeping grid in memory resulting in a
// memory leak if user is not disposing of the GridAPI references
export function removeAllReferences(obj, preserveKeys, preDestroyLink) {
    if (preserveKeys === void 0) { preserveKeys = []; }
    Object.keys(obj).forEach(function (key) {
        var value = obj[key];
        // we want to replace all the @autowired services, which are objects. any simple types (boolean, string etc)
        // we don't care about
        if (typeof value === 'object' && !preserveKeys.includes(key)) {
            obj[key] = undefined;
        }
    });
    var proto = Object.getPrototypeOf(obj);
    var properties = {};
    var msgFunc = function (key) {
        return "AG Grid: Grid API function ".concat(key, "() cannot be called as the grid has been destroyed.\n    It is recommended to remove local references to the grid api. Alternatively, check gridApi.isDestroyed() to avoid calling methods against a destroyed grid.\n    To run logic when the grid is about to be destroyed use the gridPreDestroy event. See: ").concat(preDestroyLink);
    };
    Object.getOwnPropertyNames(proto).forEach(function (key) {
        var value = proto[key];
        // leave all basic types and preserveKeys this is needed for GridAPI to leave the "destroyed: boolean" attribute and isDestroyed() function.
        if (typeof value === 'function' && !preserveKeys.includes(key)) {
            var func = function () {
                console.warn(msgFunc(key));
            };
            properties[key] = { value: func, writable: true };
        }
    });
    Object.defineProperties(obj, properties);
}
export function isNonNullObject(value) {
    return typeof value === 'object' && value !== null;
}
