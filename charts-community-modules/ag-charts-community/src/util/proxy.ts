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
 * If `change` is unspecified, `remove` then `add` will be invoked on value changes.
 * If `change` is specified, `add` and `remove` will only be invoked when moving from/to `undefined` respectively.
 *
 * @param addFn called when a new value is set
 * @param removeFn called with the old value when a new value is set
 * @param changeFn called on any change to the value
 */
export function ActionOnWrite<T>(
    addFn: (this: T, newValue: any) => void,
    removeFn: (this: T, oldValue: any) => void = () => undefined,
    changeFn?: (this: T, oldValue?: any, newValue?: any) => void
) {
    return addTransformToInstanceProperty((target, __, newValue, oldValue) => {
        if (newValue === oldValue) {
            return newValue;
        }

        if (changeFn) {
            if (oldValue === undefined) {
                addFn.call(target, newValue);
            } else if (newValue === undefined) {
                removeFn.call(target, oldValue);
            } else {
                changeFn.call(target, oldValue, newValue);
            }
        } else {
            if (oldValue !== undefined) {
                removeFn.call(target, oldValue);
            }
            if (newValue !== undefined) {
                addFn.call(target, newValue);
            }
        }

        return newValue;
    });
}
