"use strict";
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Performs a JSON-diff between a source and target JSON structure.
 *
 * On a per property basis, takes the target property value where:
 * - types are different.
 * - type is primitive.
 * - type is array and length or content have changed.
 *
 * Recurses for object types.
 *
 * @param source starting point for diff
 * @param target target for diff vs. source
 *
 * @returns `null` if no differences, or an object with the subset of properties that have changed.
 */
function jsonDiff(source, target) {
    var e_1, _a;
    var lhs = source || {};
    var rhs = target || {};
    var allProps = new Set(__spread(Object.keys(lhs), Object.keys(rhs)));
    var propsChangedCount = 0;
    var result = {};
    var _loop_1 = function (prop) {
        // Cheap-and-easy equality check.
        if (lhs[prop] === rhs[prop]) {
            return "continue";
        }
        var take = function (v) {
            result[prop] = v;
            propsChangedCount++;
        };
        var lhsType = classify(lhs[prop]);
        var rhsType = classify(rhs[prop]);
        if (lhsType !== rhsType) {
            // Types changed, just take RHS.
            take(rhs[prop]);
            return "continue";
        }
        if (rhsType === 'primitive' || rhsType === null) {
            take(rhs[prop]);
            return "continue";
        }
        if (rhsType === 'array' && lhs[prop].length !== rhs[prop].length) {
            // Arrays are different sizes, so just take target array.
            take(rhs[prop]);
            return "continue";
        }
        if (JSON.stringify(lhs[prop]) === JSON.stringify(rhs[prop])) {
            return "continue";
        }
        if (rhsType === 'array') {
            // Don't try to do anything tricky with array diffs!
            take(rhs[prop]);
            return "continue";
        }
        var diff = jsonDiff(lhs[prop], rhs[prop]);
        if (diff !== null) {
            take(diff);
        }
    };
    try {
        for (var allProps_1 = __values(allProps), allProps_1_1 = allProps_1.next(); !allProps_1_1.done; allProps_1_1 = allProps_1.next()) {
            var prop = allProps_1_1.value;
            _loop_1(prop);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (allProps_1_1 && !allProps_1_1.done && (_a = allProps_1.return)) _a.call(allProps_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return propsChangedCount === 0 ? null : result;
}
exports.jsonDiff = jsonDiff;
/**
 * Special value used by `jsonMerge` to signal that a property should be removed from the merged
 * output.
 */
exports.DELETE = Symbol('<delete-property>');
/**
 * Merge together the provide JSON object structures, with the precedence of application running
 * from higher indexes to lower indexes.
 *
 * Deep-clones all objects to avoid mutation of the inputs changing the output object. For arrays,
 * just performs a deep-clone of the entire array, no merging of elements attempted.
 *
 * @param json all json objects to merge
 *
 * @returns the combination of all of the json inputs
 */
function jsonMerge() {
    var e_2, _a;
    var json = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        json[_i] = arguments[_i];
    }
    if (json.some(function (v) { return v instanceof Array; })) {
        throw new Error("AG Charts - merge of arrays not supported: " + JSON.stringify(json));
    }
    var result = deepClone(json[0]);
    try {
        for (var _b = __values(json.slice(1)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var nextJson = _c.value;
            for (var nextProp in nextJson) {
                if (nextJson[nextProp] === exports.DELETE) {
                    delete result[nextProp];
                }
                else if (result[nextProp] instanceof Array) {
                    // Overwrite array properties that already exist.
                    result[nextProp] = deepClone(nextJson[nextProp]);
                }
                else if (typeof result[nextProp] === 'object') {
                    // Recursively merge complex objects.
                    result[nextProp] = jsonMerge(result[nextProp], nextJson[nextProp]);
                }
                else if (typeof nextJson[nextProp] === 'object') {
                    // Deep clone of nested objects.
                    result[nextProp] = deepClone(nextJson[nextProp]);
                }
                else {
                    // Just directly assign/overwrite.
                    result[nextProp] = nextJson[nextProp];
                }
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return result;
}
exports.jsonMerge = jsonMerge;
/**
 * Recursively apply a JSON object into a class-hierarchy, optionally instantiating certain classes
 * by property name.
 *
 * @param target to apply source JSON properties into
 * @param source to be applied
 * @param params.path path for logging/error purposes, to aid with pinpointing problems
 * @param params.skip property names to skip from the source
 * @param params.constructors dictionary of property name to class constructors for properties that
 *                            require object construction
 */
function jsonApply(target, source, params) {
    if (params === void 0) { params = {}; }
    var _a;
    var _b = params.path, path = _b === void 0 ? undefined : _b, _c = params.skip, skip = _c === void 0 ? [] : _c, _d = params.constructors, constructors = _d === void 0 ? {} : _d;
    if (target == null) {
        throw new Error("AG Charts - target is uninitialised: " + (path || '<root>'));
    }
    if (source == null) {
        return target;
    }
    for (var property in source) {
        if (skip.indexOf(property) >= 0) {
            continue;
        }
        var newValue = source[property];
        var propertyPath = "" + (path ? path + '.' : '') + property;
        var targetAny = target;
        var currentValue = targetAny[property];
        var ctr = constructors[property];
        try {
            var targetClass = (_a = targetAny.constructor) === null || _a === void 0 ? void 0 : _a.name;
            var currentValueType = classify(currentValue);
            var newValueType = classify(newValue);
            if (targetClass != null && targetClass !== 'Object' && !(property in target || targetAny.hasOwnProperty(property))) {
                throw new Error("Property doesn't exist in target type: " + targetClass);
            }
            if (currentValueType != null && newValueType != null && currentValueType !== newValueType) {
                throw new Error("Property types don't match, can't apply: currentValueType=" + currentValueType + ", newValueType=" + newValueType);
            }
            if (newValueType === 'array' || currentValue instanceof HTMLElement) {
                targetAny[property] = newValue;
            }
            else if (newValueType === 'object') {
                if (currentValue != null) {
                    jsonApply(currentValue, newValue, { path: propertyPath, skip: skip, constructors: constructors });
                }
                else if (ctr != null) {
                    targetAny[property] = jsonApply(new ctr(), newValue, { path: propertyPath, skip: skip, constructors: constructors });
                }
                else {
                    targetAny[property] = newValue;
                }
            }
            else {
                targetAny[property] = newValue;
            }
        }
        catch (error) {
            throw new Error("AG Charts - unable to set: " + propertyPath + "; nested error is: " + error.message);
        }
    }
    return target;
}
exports.jsonApply = jsonApply;
function deepClone(input) {
    return JSON.parse(JSON.stringify(input));
}
/**
 * Classify the type of a value to assist with handling for merge purposes.
 */
function classify(value) {
    if (value instanceof Array) {
        return 'array';
    }
    else if (typeof value === 'object') {
        return 'object';
    }
    else if (value != null) {
        return 'primitive';
    }
    return null;
}
//# sourceMappingURL=json.js.map