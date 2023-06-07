// deepMerge
function emptyTarget(value) {
    return Array.isArray(value) ? [] : {};
}
function cloneUnlessOtherwiseSpecified(value, options) {
    return (options.clone !== false && options.isMergeableObject(value))
        ? deepMerge(emptyTarget(value), value, options)
        : value;
}
function defaultArrayMerge(target, source, options) {
    return target.concat(source).map(function (element) {
        return cloneUnlessOtherwiseSpecified(element, options);
    });
}
function getMergeFunction(key, options) {
    if (!options.customMerge) {
        return deepMerge;
    }
    var customMerge = options.customMerge(key);
    return typeof customMerge === 'function' ? customMerge : deepMerge;
}
function getEnumerableOwnPropertySymbols(target) {
    // @ts-ignore
    return Object.getOwnPropertySymbols
        // @ts-ignore
        ? Object.getOwnPropertySymbols(target).filter(function (symbol) {
            return target.propertyIsEnumerable(symbol);
        })
        : [];
}
function getKeys(target) {
    return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
}
function propertyIsOnObject(object, property) {
    try {
        return property in object;
    }
    catch (_) {
        return false;
    }
}
// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target, key) {
    return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
        && !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
            && Object.propertyIsEnumerable.call(target, key)); // and also unsafe if they're nonenumerable.
}
function mergeObject(target, source, options) {
    if (target === void 0) { target = {}; }
    if (source === void 0) { source = {}; }
    var destination = {};
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
        }
        else {
            destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
        }
    });
    return destination;
}
function defaultIsMergeableObject(value) {
    return isNonNullObject(value) && !isSpecial(value);
}
function isNonNullObject(value) {
    return !!value && typeof value === 'object';
}
function isSpecial(value) {
    var stringValue = Object.prototype.toString.call(value);
    return stringValue === '[object RegExp]' || stringValue === '[object Date]';
}
export function deepMerge(target, source, options) {
    options = options || {};
    options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    options.isMergeableObject = options.isMergeableObject || defaultIsMergeableObject;
    // cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
    // implementations can use it. The caller may not replace it.
    options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;
    var sourceIsArray = Array.isArray(source);
    var targetIsArray = Array.isArray(target);
    var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
    if (!sourceAndTargetTypesMatch) {
        return cloneUnlessOtherwiseSpecified(source, options);
    }
    else if (sourceIsArray) {
        return options.arrayMerge(target, source, options);
    }
    else {
        return mergeObject(target, source, options);
    }
}
// END - deep merge
export function mergeDeep(dest, source, copyUndefined, objectsThatNeedCopy, iteration) {
    if (copyUndefined === void 0) { copyUndefined = true; }
    if (objectsThatNeedCopy === void 0) { objectsThatNeedCopy = []; }
    if (iteration === void 0) { iteration = 0; }
    if (!exists(source)) {
        return;
    }
    iterateObject(source, function (key, sourceValue) {
        var destValue = dest[key];
        if (destValue === sourceValue) {
            return;
        }
        var dontCopyOverSourceObject = iteration == 0 && destValue == null && sourceValue != null && objectsThatNeedCopy.indexOf(key) >= 0;
        if (dontCopyOverSourceObject) {
            // by putting an empty value into destValue first, it means we end up copying over values from
            // the source object, rather than just copying in the source object in it's entirety.
            destValue = {};
            dest[key] = destValue;
        }
        if (typeof destValue === 'object' && typeof sourceValue === 'object' && !Array.isArray(destValue)) {
            mergeDeep(destValue, sourceValue, copyUndefined, objectsThatNeedCopy, iteration++);
        }
        else if (copyUndefined || sourceValue !== undefined) {
            dest[key] = sourceValue;
        }
    });
}
function iterateObject(object, callback) {
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
export function exists(value, allowEmptyString) {
    if (allowEmptyString === void 0) { allowEmptyString = false; }
    return value != null && (allowEmptyString || value !== '');
}
function forEach(list, action) {
    if (list == null) {
        return;
    }
    for (var i = 0; i < list.length; i++) {
        action(list[i], i);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0cy9jaGFydENvbXAvdXRpbHMvb2JqZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVk7QUFDWixTQUFTLFdBQVcsQ0FBQyxLQUFVO0lBQzNCLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDMUMsQ0FBQztBQUVELFNBQVMsNkJBQTZCLENBQUMsS0FBVSxFQUFFLE9BQVk7SUFDM0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEtBQUssS0FBSyxJQUFJLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRSxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDO1FBQy9DLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDaEIsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQUMsTUFBVyxFQUFFLE1BQVcsRUFBRSxPQUFZO0lBQzdELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBUyxPQUFZO1FBQ2xELE9BQU8sNkJBQTZCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNELENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLE9BQVk7SUFDL0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUU7UUFDdEIsT0FBTyxTQUFTLENBQUM7S0FDcEI7SUFDRCxJQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzdDLE9BQU8sT0FBTyxXQUFXLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxXQUFXLENB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