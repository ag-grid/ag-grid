export const BREAK_TRANSFORM_CHAIN = Symbol('BREAK');

type TransformFn = (
    target: any,
    key: string | symbol,
    value: any,
    oldValue?: any
) => any | typeof BREAK_TRANSFORM_CHAIN;
type TransformConfig = { setters: TransformFn[]; getters: TransformFn[] };
const CONFIG_KEY = '__decorator_config';

function initialiseConfig(
    target: any,
    propertyKeyOrSymbol: string | symbol,
    propertyKey: string,
    valueStoreKey: string
) {
    if (Object.getOwnPropertyDescriptor(target, CONFIG_KEY) == null) {
        Object.defineProperty(target, CONFIG_KEY, { value: {} });
    }

    const config: Record<string, TransformConfig> = target[CONFIG_KEY];
    if (config[propertyKey] != null) {
        return config[propertyKey];
    }

    config[propertyKey] = { setters: [], getters: [] };

    const descriptor = Object.getOwnPropertyDescriptor(target, propertyKeyOrSymbol);
    const prevSet = descriptor?.set;
    const prevGet = descriptor?.get;

    const getter = function (this: any) {
        let value = prevGet ? prevGet.call(this) : this[valueStoreKey];
        for (const transformFn of config[propertyKey]?.getters ?? []) {
            value = transformFn(this, propertyKeyOrSymbol, value);

            if (value === BREAK_TRANSFORM_CHAIN) {
                return undefined;
            }
        }

        return value;
    };
    const setter = function (this: any, value: any) {
        const setters = config[propertyKey]?.setters ?? [];

        let oldValue;
        if (setters.some((f) => f.length > 2)) {
            // Lazily retrieve old value.
            oldValue = prevGet ? prevGet.call(this) : this[valueStoreKey];
        }

        for (const transformFn of setters) {
            value = transformFn(this, propertyKeyOrSymbol, value, oldValue);

            if (value === BREAK_TRANSFORM_CHAIN) {
                return;
            }
        }

        if (prevSet) {
            prevSet.call(this, value);
        } else {
            this[valueStoreKey] = value;
        }
    };

    Object.defineProperty(target, propertyKeyOrSymbol, {
        set: setter,
        get: getter,
        enumerable: true,
        configurable: false,
    });

    return config[propertyKey];
}

export function addTransformToInstanceProperty(
    setTransform: TransformFn,
    getTransform?: TransformFn
): PropertyDecorator {
    return (target: any, propertyKeyOrSymbol: string | symbol) => {
        const propertyKey = propertyKeyOrSymbol.toString();
        const valueStoreKey = `__${propertyKey}`;

        const { getters, setters } = initialiseConfig(target, propertyKeyOrSymbol, propertyKey, valueStoreKey);

        setters.push(setTransform);
        if (getTransform) {
            getters.splice(0, 0, getTransform);
        }
    };
}
