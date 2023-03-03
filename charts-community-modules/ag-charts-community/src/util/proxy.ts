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
 * @param opts.add called when a new value is set - never called for undefined values.
 * @param opts.remove called with the old value when a new value is set - never called for undefined
 *                    values.
 * @param opts.change called on any change to the value - always called.
 */
export function ActionOnWrite<T>(opts: {
    add?: (this: T, newValue: any) => void;
    remove?: (this: T, oldValue: any) => void;
    change?: (this: T, newValue?: any, oldValue?: any) => void;
}) {
    const { add: addFn, remove: removeFn, change: changeFn } = opts;
    return addTransformToInstanceProperty((target, _, newValue, oldValue) => {
        if (newValue === oldValue) {
            return newValue;
        }

        if (oldValue !== undefined) {
            removeFn?.call(target, oldValue);
        }
        if (newValue !== undefined) {
            addFn?.call(target, newValue);
        }
        changeFn?.call(target, newValue, oldValue);

        return newValue;
    });
}
