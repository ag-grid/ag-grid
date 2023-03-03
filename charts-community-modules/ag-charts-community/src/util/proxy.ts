import { addTransformToInstanceProperty } from './decorator';

export function ProxyOnWrite(proxyProperty: string) {
    return addTransformToInstanceProperty((target, _, value) => {
        target[proxyProperty] = value;

        return value;
    });
}

export function ProxyPropertyOnWrite(childName: string, childProperty?: string) {
    return addTransformToInstanceProperty((target, key, value) => {
        target[childName][childProperty ?? key] = value;

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
export function ActionOnSet<T>(opts: {
    newValue?: (this: T, newValue: any) => void;
    oldValue?: (this: T, oldValue: any) => void;
    changeValue?: (this: T, newValue?: any, oldValue?: any) => void;
}) {
    const { newValue: newValueFn, oldValue: oldValueFn, changeValue: changeValueFn } = opts;
    return addTransformToInstanceProperty((target, _, newValue, oldValue) => {
        if (newValue === oldValue) {
            return newValue;
        }

        if (oldValue !== undefined) {
            oldValueFn?.call(target, oldValue);
        }
        if (newValue !== undefined) {
            newValueFn?.call(target, newValue);
        }
        changeValueFn?.call(target, newValue, oldValue);

        return newValue;
    });
}
