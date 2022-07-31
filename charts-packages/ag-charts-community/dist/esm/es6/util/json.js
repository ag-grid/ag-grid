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
 * @param opts.stringify properties to stringify for comparison purposes
 *
 * @returns `null` if no differences, or an object with the subset of properties that have changed.
 */
export function jsonDiff(source, target, opts) {
    const { stringify = [] } = opts || {};
    const sourceType = classify(source);
    const targetType = classify(target);
    if (targetType === 'array') {
        if (sourceType !== 'array' || source.length !== target.length) {
            return [...target];
        }
        if (target.some((targetElement, i) => { var _a; return jsonDiff((_a = source) === null || _a === void 0 ? void 0 : _a[i], targetElement) != null; })) {
            return [...target];
        }
        return null;
    }
    if (targetType === 'primitive') {
        if (sourceType !== 'primitive') {
            return Object.assign({}, target);
        }
        if (source !== target) {
            return target;
        }
        return null;
    }
    const lhs = source || {};
    const rhs = target || {};
    const allProps = new Set([...Object.keys(lhs), ...Object.keys(rhs)]);
    let propsChangedCount = 0;
    const result = {};
    for (const prop of allProps) {
        // Cheap-and-easy equality check.
        if (lhs[prop] === rhs[prop]) {
            continue;
        }
        const take = (v) => {
            result[prop] = v;
            propsChangedCount++;
        };
        if (stringify.includes(prop)) {
            if (JSON.stringify(lhs[prop] !== JSON.stringify(rhs[prop]))) {
                take(rhs[prop]);
            }
            continue;
        }
        const lhsType = classify(lhs[prop]);
        const rhsType = classify(rhs[prop]);
        if (lhsType !== rhsType) {
            // Types changed, just take RHS.
            take(rhs[prop]);
            continue;
        }
        if (rhsType === 'primitive' || rhsType === null) {
            take(rhs[prop]);
            continue;
        }
        if (rhsType === 'array' && lhs[prop].length !== rhs[prop].length) {
            // Arrays are different sizes, so just take target array.
            take(rhs[prop]);
            continue;
        }
        if (rhsType === 'class-instance') {
            // Don't try to do anything tricky with array diffs!
            take(rhs[prop]);
            continue;
        }
        if (rhsType === 'function' && lhs[prop] !== rhs[prop]) {
            take(rhs[prop]);
            continue;
        }
        const diff = jsonDiff(lhs[prop], rhs[prop], { stringify });
        if (diff !== null) {
            take(diff);
        }
    }
    return propsChangedCount === 0 ? null : result;
}
/**
 * Special value used by `jsonMerge` to signal that a property should be removed from the merged
 * output.
 */
export const DELETE = Symbol('<delete-property>');
const NOT_SPECIFIED = Symbol('<unspecified-property>');
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
export function jsonMerge(...json) {
    const jsonTypes = json.map((v) => classify(v));
    if (jsonTypes.some((v) => v === 'array')) {
        // Clone final array.
        const finalValue = json[json.length - 1];
        if (finalValue instanceof Array) {
            return finalValue.map((v) => {
                const type = classify(v);
                return type === 'array' ? jsonMerge([], v) : type === 'object' ? jsonMerge({}, v) : v;
            });
        }
        return finalValue;
    }
    const result = {};
    const props = new Set(json.map((v) => (v != null ? Object.keys(v) : [])).reduce((r, n) => r.concat(n), []));
    for (const nextProp of props) {
        const values = json
            .map((j) => (j != null && nextProp in j ? j[nextProp] : NOT_SPECIFIED))
            .filter((v) => v !== NOT_SPECIFIED);
        if (values.length === 0) {
            continue;
        }
        const lastValue = values[values.length - 1];
        if (lastValue === DELETE) {
            continue;
        }
        const types = values.map((v) => classify(v));
        const type = types[0];
        if (types.some((t) => t !== type && t !== null)) {
            // Short-circuit if mismatching types.
            result[nextProp] = lastValue;
            continue;
        }
        if (type === 'array' || type === 'object') {
            result[nextProp] = jsonMerge(...values);
        }
        else {
            // Just directly assign/overwrite.
            result[nextProp] = lastValue;
        }
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
export function jsonApply(target, source, params = {}) {
    var _a, _b, _c, _d;
    const { path = undefined, matcherPath = path ? path.replace(/(\[[0-9+]{1,}\])/i, '[]') : undefined, skip = [], constructors = {}, allowedTypes = {}, } = params;
    if (target == null) {
        throw new Error(`AG Charts - target is uninitialised: ${path || '<root>'}`);
    }
    if (source == null) {
        return target;
    }
    const targetType = classify(target);
    for (const property in source) {
        const propertyMatcherPath = `${matcherPath ? matcherPath + '.' : ''}${property}`;
        if (skip.indexOf(propertyMatcherPath) >= 0) {
            continue;
        }
        const newValue = source[property];
        const propertyPath = `${path ? path + '.' : ''}${property}`;
        const targetAny = target;
        const targetClass = targetAny.constructor;
        const currentValue = targetAny[property];
        let ctr = (_a = constructors[property], (_a !== null && _a !== void 0 ? _a : constructors[propertyMatcherPath]));
        try {
            const currentValueType = classify(currentValue);
            const newValueType = classify(newValue);
            if (targetType === 'class-instance' && !(property in target || targetAny.hasOwnProperty(property))) {
                console.warn(`AG Charts - unable to set [${propertyPath}] in ${(_b = targetClass) === null || _b === void 0 ? void 0 : _b.name} - property is unknown`);
                continue;
            }
            const allowableTypes = allowedTypes[propertyMatcherPath] || [currentValueType];
            if (currentValueType === 'class-instance' && newValueType === 'object') {
                // Allowed, this is the common case! - do not error.
            }
            else if (currentValueType != null && newValueType != null && !allowableTypes.includes(newValueType)) {
                console.warn(`AG Charts - unable to set [${propertyPath}] in ${(_c = targetClass) === null || _c === void 0 ? void 0 : _c.name} - can't apply type of [${newValueType}], allowed types are: [${allowableTypes}]`);
                continue;
            }
            if (newValueType === 'array') {
                ctr = (ctr !== null && ctr !== void 0 ? ctr : constructors[`${propertyMatcherPath}[]`]);
                if (ctr != null) {
                    const newValueArray = newValue;
                    targetAny[property] = newValueArray.map((v) => jsonApply(new ctr(), v, Object.assign(Object.assign({}, params), { path: propertyPath, matcherPath: propertyMatcherPath + '[]' })));
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
                    jsonApply(currentValue, newValue, Object.assign(Object.assign({}, params), { path: propertyPath, matcherPath: propertyMatcherPath }));
                }
                else if (ctr != null) {
                    targetAny[property] = jsonApply(new ctr(), newValue, Object.assign(Object.assign({}, params), { path: propertyPath, matcherPath: propertyMatcherPath }));
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
            console.warn(`AG Charts - unable to set [${propertyPath}] in [${(_d = targetClass) === null || _d === void 0 ? void 0 : _d.name}]; nested error is: ${error.message}`);
            continue;
        }
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
export function jsonWalk(json, visit, opts, ...jsons) {
    var _a;
    const jsonType = classify(json);
    const skip = opts.skip || [];
    if (jsonType === 'array') {
        json.forEach((element, index) => {
            var _a;
            jsonWalk(element, visit, opts, ...(_a = jsons) === null || _a === void 0 ? void 0 : _a.map((o) => { var _a; return (_a = o) === null || _a === void 0 ? void 0 : _a[index]; }));
        });
        return;
    }
    else if (jsonType !== 'object') {
        return;
    }
    visit(jsonType, json, ...jsons);
    for (const property in json) {
        if (skip.indexOf(property) >= 0) {
            continue;
        }
        const value = json[property];
        const otherValues = (_a = jsons) === null || _a === void 0 ? void 0 : _a.map((o) => { var _a; return (_a = o) === null || _a === void 0 ? void 0 : _a[property]; });
        const valueType = classify(value);
        if (valueType === 'object' || valueType === 'array') {
            jsonWalk(value, visit, opts, ...otherValues);
        }
    }
}
/**
 * Classify the type of a value to assist with handling for merge purposes.
 */
export function classify(value) {
    if (value == null) {
        return null;
    }
    else if (value instanceof HTMLElement) {
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
