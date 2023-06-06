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
import { Logger } from './logger';
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
export function jsonDiff(source, target) {
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
/**
 * Special value used by `jsonMerge` to signal that a property should be removed from the merged
 * output.
 */
export var DELETE = Symbol('<delete-property>');
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
export function jsonMerge(json, opts) {
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
            .map(function (j) { return (j != null && nextProp in j ? j[nextProp] : NOT_SPECIFIED); })
            .filter(function (v) { return v !== NOT_SPECIFIED; });
        if (values.length === 0) {
            return "continue";
        }
        var lastValue = values[values.length - 1];
        if (lastValue === DELETE) {
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
 * @param params.allowedTypes overrides by path for allowed property types
 */
export function jsonApply(target, source, params) {
    var _a, _b;
    if (params === void 0) { params = {}; }
    var _c = params.path, path = _c === void 0 ? undefined : _c, _d = params.matcherPath, matcherPath = _d === void 0 ? path ? path.replace(/(\[[0-9+]+\])/i, '[]') : undefined : _d, _e = params.skip, skip = _e === void 0 ? [] : _e, _f = params.constructors, constructors = _f === void 0 ? {} : _f, _g = params.allowedTypes, allowedTypes = _g === void 0 ? {} : _g, idx = params.idx;
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
                Logger.warn("unable to set [" + propertyPath + "] in " + (targetClass === null || targetClass === void 0 ? void 0 : targetClass.name) + " - property is unknown");
                return "continue";
            }
            var allowableTypes = (_b = allowedTypes[propertyMatcherPath]) !== null && _b !== void 0 ? _b : [currentValueType];
            if (currentValueType === 'class-instance' && newValueType === 'object') {
                // Allowed, this is the common case! - do not error.
            }
            else if (currentValueType != null && newValueType != null && !allowableTypes.includes(newValueType)) {
                Logger.warn("unable to set [" + propertyPath + "] in " + (targetClass === null || targetClass === void 0 ? void 0 : targetClass.name) + " - can't apply type of [" + newValueType + "], allowed types are: [" + allowableTypes + "]");
                return "continue";
            }
            if (newValueType === 'array') {
                ctr = ctr !== null && ctr !== void 0 ? ctr : constructors[propertyMatcherPath + "[]"];
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
            var err = error;
            Logger.warn("unable to set [" + propertyPath + "] in [" + (targetClass === null || targetClass === void 0 ? void 0 : targetClass.name) + "]; nested error is: " + err.message);
            return "continue";
        }
    };
    for (var property in source) {
        _loop_3(property);
    }
    return target;
}
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
export function jsonWalk(json, visit, opts) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlsL2pzb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFzQ2xDOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0gsTUFBTSxVQUFVLFFBQVEsQ0FBb0IsTUFBUyxFQUFFLE1BQVM7O0lBQzVELElBQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQyxJQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFcEMsSUFBSSxVQUFVLEtBQUssT0FBTyxFQUFFO1FBQ3hCLElBQU0sV0FBVyxHQUFHLE1BQWEsQ0FBQztRQUNsQyxJQUFJLFVBQVUsS0FBSyxPQUFPLElBQUssTUFBYyxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsTUFBTSxFQUFFO1lBQ3pFLE9BQU8seUJBQUksV0FBVyxFQUFRLENBQUM7U0FDbEM7UUFFRCxJQUNJLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBQyxhQUFrQixFQUFFLENBQVMsWUFBSyxPQUFBLFFBQVEsQ0FBQyxNQUFDLE1BQWMsMENBQUcsQ0FBQyxDQUFDLEVBQUUsYUFBYSxDQUFDLElBQUksSUFBSSxDQUFBLEVBQUEsQ0FBQyxFQUM1RztZQUNFLE9BQU8seUJBQUksV0FBVyxFQUFRLENBQUM7U0FDbEM7UUFFRCxPQUFPLElBQUksQ0FBQztLQUNmO0lBRUQsSUFBSSxVQUFVLEtBQUssV0FBVyxFQUFFO1FBQzVCLElBQUksVUFBVSxLQUFLLFdBQVcsRUFBRTtZQUM1QixvQkFBYSxNQUFjLEVBQUc7U0FDakM7UUFFRCxJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUU7WUFDbkIsT0FBTyxNQUFNLENBQUM7U0FDakI7UUFFRCxPQUFPLElBQUksQ0FBQztLQUNm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