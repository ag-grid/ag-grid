import { addTransformToInstanceProperty } from './decorator';
export function ProxyOnWrite(proxyProperty) {
    return addTransformToInstanceProperty((target, _, value) => {
        target[proxyProperty] = value;
        return value;
    });
}
export function ProxyPropertyOnWrite(childName, childProperty) {
    return addTransformToInstanceProperty((target, key, value) => {
        target[childName][childProperty !== null && childProperty !== void 0 ? childProperty : key] = value;
        return value;
    });
}
/**
 * Allows side-effects to be triggered on property write.
 *
 * @param opts.newValue called when a new value is set - never called for undefined values.
 * @param opts.oldValue called with the old value before a new value is set - never called for
 *                      undefined values.
 * @param opts.changeValue called on any change to the value - always called.
 */
export function ActionOnSet(opts) {
    const { newValue: newValueFn, oldValue: oldValueFn, changeValue: changeValueFn } = opts;
    return addTransformToInstanceProperty((target, _, newValue, oldValue) => {
        if (newValue !== oldValue) {
            if (oldValue !== undefined) {
                oldValueFn === null || oldValueFn === void 0 ? void 0 : oldValueFn.call(target, oldValue);
            }
            if (newValue !== undefined) {
                newValueFn === null || newValueFn === void 0 ? void 0 : newValueFn.call(target, newValue);
            }
            changeValueFn === null || changeValueFn === void 0 ? void 0 : changeValueFn.call(target, newValue, oldValue);
        }
        return newValue;
    });
}
