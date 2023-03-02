import { addTransformToInstanceProperty } from './decorator';

/**
 * Wraps the target property with a set method that will write assigned value into a nested object with the same
 * property key.
 *
 * @param proxyProperty property name of this, which has the child object to receive values.
 */
export function ProxyOnWrite(proxyProperty: string) {
    return addTransformToInstanceProperty((target, _, value) => {
        target[proxyProperty] = value;

        return value;
    });
}

/**
 * Wraps the target property with a set method that will write assigned value into a nested object with a specified
 * property key.
 *
 * @param childName property name of this, which has the child object to receive values.
 * @param childProperty property key of the child object to receive values.
 */
export function ProxyPropertyOnWrite(childName: string, childProperty?: string) {
    return addTransformToInstanceProperty((target, key, value) => {
        target[childName][childProperty ?? key] = value;

        return value;
    });
}

/**
 * Allows side-effects to be triggered on property write. Exactly one callback is invoked on every
 * write, provided the assigned value changes.
 *
 * @param opts.addFn called when a new value is set
 * @param opts.removeFn called with the old value when a new value is set
 * @param opts.changeFn called on any change to the value
 */
export function ActionOnWrite<T>(opts: {
    add?: (this: T, newValue: any) => void;
    remove?: (this: T, oldValue: any) => void;
    change?: (this: T, newValue?: any, oldValue?: any) => void;
}) {
    const { add: addFn, remove: removeFn, change: changeFn } = opts;
    return addTransformToInstanceProperty((target, __, newValue, oldValue) => {
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
