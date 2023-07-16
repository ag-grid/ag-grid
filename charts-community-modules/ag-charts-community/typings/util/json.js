"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
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
exports.jsonWalk = exports.jsonApply = exports.jsonMerge = exports.DELETE = exports.jsonDiff = void 0;
var logger_1 = require("./logger");
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
    var sourceType = classify(source);
    var targetType = classify(target);
    if (targetType === 'array') {
        var targetArray = target;
        if (sourceType !== 'array' || source.length !== targetArray.length) {
            return __spreadArray([], __read(targetArray));
        }
        if (targetArray.some(function (targetElement, i) { var _a; return jsonDiff((_a = source) === null || _a === void 0 ? void 0 : _a[i], targetElement) != null; })) {
            return __spreadArray([], __read(targetArray));
        }
        return null;
    }
    if (targetType === 'primitive') {
        if (sourceType !== 'primitive') {
            return __assign({}, target);
        }
        if (source !== target) {
            return target;
        }
        return null;
    }
    var lhs = source || {};
    var rhs = target || {};
    var allProps = new Set(__spreadArray(__spreadArray([], __read(Object.keys(lhs))), __read(Object.keys(rhs))));
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
        if (rhsType === 'class-instance') {
            // Don't try to do anything tricky with array diffs!
            take(rhs[prop]);
            return "continue";
        }
        if (rhsType === 'function' && lhs[prop] !== rhs[prop]) {
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
var NOT_SPECIFIED = Symbol('<unspecified-property>');
/**
 * Merge together the provide JSON object structures, with the precedence of application running
 * from higher indexes to lower indexes.
 *
 * Deep-clones all objects to avoid mutation of the inputs changing the output object. For arrays,
 * just performs a deep-clone of the entire array, no merging of elements attempted.
 *
 * @param json all json objects to merge
 * @param opts merge options
 * @param opts.avoidDeepClone contains a list of properties where deep clones should be avoided
 *
 * @returns the combination of all of the json inputs
 */
function jsonMerge(json, opts) {
    var e_2, _a;
    var _b;
    var avoidDeepClone = (_b = opts === null || opts === void 0 ? void 0 : opts.avoidDeepClone) !== null && _b !== void 0 ? _b : [];
    var jsonTypes = json.map(function (v) { return classify(v); });
    if (jsonTypes.some(function (v) { return v === 'array'; })) {
        // Clone final array.
        var finalValue = json[json.length - 1];
        if (finalValue instanceof Array) {
            return finalValue.map(function (v) {
                var type = classify(v);
                if (type === 'array')
                    return jsonMerge([[], v], opts);
                if (type === 'object')
                    return jsonMerge([{}, v], opts);
                return v;
            });
        }
        return finalValue;
    }
    var result = {};
    var props = new Set(json.map(function (v) { return (v != null ? Object.keys(v) : []); }).reduce(function (r, n) { return r.concat(n); }, []));
    var _loop_2 = function (nextProp) {
        var values = json
            .map(function (j) {
            if (j != null && typeof j === 'object' && nextProp in j) {
                return j[nextProp];
            }
            return NOT_SPECIFIED;
        })
            .filter(function (v) { return v !== NOT_SPECIFIED; });
        if (values.length === 0) {
            return "continue";
        }
        var lastValue = values[values.length - 1];
        if (lastValue === exports.DELETE) {
            return "continue";
        }
        var types = values.map(function (v) { return classify(v); });
        var type = types[0];
        if (types.some(function (t) { return t !== type; })) {
            // Short-circuit if mismatching types.
            result[nextProp] = lastValue;
            return "continue";
        }
        if ((type === 'array' || type === 'object') && !avoidDeepClone.includes(nextProp)) {
            result[nextProp] = jsonMerge(values, opts);
        }
        else if (type === 'array') {
            // Arrays need to be shallow copied to avoid external mutation and allow jsonDiff to
            // detect changes.
            result[nextProp] = __spreadArray([], __read(lastValue));
        }
        else {
            // Just directly assign/overwrite.
            result[nextProp] = lastValue;
        }
    };
    try {
        for (var props_1 = __values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
            var nextProp = props_1_1.value;
            _loop_2(nextProp);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (props_1_1 && !props_1_1.done && (_a = props_1.return)) _a.call(props_1);
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
 * @param params.matcherPath path for pattern matching, to lookup allowedTypes override.
 * @param params.skip property names to skip from the source
 * @param params.constructors dictionary of property name to class constructors for properties that
 *                            require object construction
 * @param params.constructedArrays map stores arrays which items should be initialised
 *                                 using a class constructor
 * @param params.allowedTypes overrides by path for allowed property types
 */
function jsonApply(target, source, params) {
    var _a, _b, _c;
    if (params === void 0) { params = {}; }
    var _d = params.path, path = _d === void 0 ? undefined : _d, _e = params.matcherPath, matcherPath = _e === void 0 ? path ? path.replace(/(\[[0-9+]+\])/i, '[]') : undefined : _e, _f = params.skip, skip = _f === void 0 ? [] : _f, _g = params.constructors, constructors = _g === void 0 ? {} : _g, _h = params.constructedArrays, constructedArrays = _h === void 0 ? new WeakMap() : _h, _j = params.allowedTypes, allowedTypes = _j === void 0 ? {} : _j, idx = params.idx;
    if (target == null) {
        throw new Error("AG Charts - target is uninitialised: " + (path !== null && path !== void 0 ? path : '<root>'));
    }
    if (source == null) {
        return target;
    }
    var targetAny = target;
    if (idx != null && '_declarationOrder' in targetAny) {
        targetAny['_declarationOrder'] = idx;
    }
    var targetType = classify(target);
    var _loop_3 = function (property) {
        var propertyMatcherPath = "" + (matcherPath ? matcherPath + '.' : '') + property;
        if (skip.indexOf(propertyMatcherPath) >= 0) {
            return "continue";
        }
        var newValue = source[property];
        var propertyPath = "" + (path ? path + '.' : '') + property;
        var targetClass = targetAny.constructor;
        var currentValue = targetAny[property];
        var ctr = (_a = constructors[propertyMatcherPath]) !== null && _a !== void 0 ? _a : constructors[property];
        try {
            var currentValueType = classify(currentValue);
            var newValueType = classify(newValue);
            if (targetType === 'class-instance' &&
                !(property in target || Object.prototype.hasOwnProperty.call(targetAny, property))) {
                logger_1.Logger.warn("unable to set [" + propertyPath + "] in " + (targetClass === null || targetClass === void 0 ? void 0 : targetClass.name) + " - property is unknown");
                return "continue";
            }
            var allowableTypes = (_b = allowedTypes[propertyMatcherPath]) !== null && _b !== void 0 ? _b : [currentValueType];
            if (currentValueType === 'class-instance' && newValueType === 'object') {
                // Allowed, this is the common case! - do not error.
            }
            else if (currentValueType != null && newValueType != null && !allowableTypes.includes(newValueType)) {
                logger_1.Logger.warn("unable to set [" + propertyPath + "] in " + (targetClass === null || targetClass === void 0 ? void 0 : targetClass.name) + " - can't apply type of [" + newValueType + "], allowed types are: [" + allowableTypes + "]");
                return "continue";
            }
            if (newValueType === 'array') {
                ctr = (_c = ctr !== null && ctr !== void 0 ? ctr : constructedArrays.get(currentValue)) !== null && _c !== void 0 ? _c : constructors[propertyMatcherPath + "[]"];
                if (ctr != null) {
                    var newValueArray = newValue;
                    targetAny[property] = newValueArray.map(function (v, idx) {
                        return jsonApply(new ctr(), v, __assign(__assign({}, params), { path: propertyPath, matcherPath: propertyMatcherPath + '[]', idx: idx }));
                    });
                }
                else {
                    targetAny[property] = newValue;
                }
            }
            else if (newValueType === 'class-instance') {
                targetAny[property] = newValue;
            }
            else if (newValueType === 'object') {
                if (currentValue != null) {
                    jsonApply(currentValue, newValue, __assign(__assign({}, params), { path: propertyPath, matcherPath: propertyMatcherPath, idx: undefined }));
                }
                else if (ctr != null) {
                    targetAny[property] = jsonApply(new ctr(), newValue, __assign(__assign({}, params), { path: propertyPath, matcherPath: propertyMatcherPath, idx: undefined }));
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
            logger_1.Logger.warn("unable to set [" + propertyPath + "] in [" + (targetClass === null || targetClass === void 0 ? void 0 : targetClass.name) + "]; nested error is: " + error.message);
            return "continue";
        }
    };
    for (var property in source) {
        _loop_3(property);
    }
    return target;
}
exports.jsonApply = jsonApply;
/**
 * Walk the given JSON object graphs, invoking the visit() callback for every object encountered.
 * Arrays are descended into without a callback, however their elements will have the visit()
 * callback invoked if they are objects.
 *
 * @param json to traverse
 * @param visit callback for each non-primitive and non-array object found
 * @param opts.skip property names to skip when walking
 * @param jsons to traverse in parallel
 */
function jsonWalk(json, visit, opts) {
    var _a;
    var jsons = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        jsons[_i - 3] = arguments[_i];
    }
    var jsonType = classify(json);
    var skip = (_a = opts.skip) !== null && _a !== void 0 ? _a : [];
    if (jsonType === 'array') {
        json.forEach(function (element, index) {
            jsonWalk.apply(void 0, __spreadArray([element, visit, opts], __read((jsons !== null && jsons !== void 0 ? jsons : []).map(function (o) { return o === null || o === void 0 ? void 0 : o[index]; }))));
        });
        return;
    }
    else if (jsonType !== 'object') {
        return;
    }
    visit.apply(void 0, __spreadArray([jsonType, json], __read(jsons)));
    var _loop_4 = function (property) {
        if (skip.indexOf(property) >= 0) {
            return "continue";
        }
        var value = json[property];
        var otherValues = jsons === null || jsons === void 0 ? void 0 : jsons.map(function (o) { return o === null || o === void 0 ? void 0 : o[property]; });
        var valueType = classify(value);
        if (valueType === 'object' || valueType === 'array') {
            jsonWalk.apply(void 0, __spreadArray([value, visit, opts], __read(otherValues)));
        }
    };
    for (var property in json) {
        _loop_4(property);
    }
}
exports.jsonWalk = jsonWalk;
var isBrowser = typeof window !== 'undefined';
/**
 * Classify the type of a value to assist with handling for merge purposes.
 */
function classify(value) {
    if (value == null) {
        return null;
    }
    else if (isBrowser && value instanceof HTMLElement) {
        return 'primitive';
    }
    else if (value instanceof Array) {
        return 'array';
    }
    else if (value instanceof Date) {
        return 'primitive';
    }
    else if (typeof value === 'object' && value.constructor === Object) {
        return 'object';
    }
    else if (typeof value === 'function') {
        return 'function';
    }
    else if (typeof value === 'object' && value.constructor != null) {
        return 'class-instance';
    }
    return 'primitive';
}
//# sourceMappingURL=json.js.map