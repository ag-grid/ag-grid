import { isObject } from './object';

interface DeprecationOptions<T> {
    /** Default value */
    default?: T;
    /** Getter and setter for a target property to use instead of deprecated */
    accessors?: { get(target: T): any; set(target: T, v: any): void };
}

export function Deprecated<T = any>(message?: string, opts?: DeprecationOptions<T>) {
    let logged = false;
    const def = opts?.default;

    const createDeprecationWarning = (key: string) => {
        return () => {
            if (logged) {
                return;
            }
            const msg = [`AG Charts - Property [${key}] is deprecated.`, message].filter((v) => v != null).join(' ');
            console.warn(msg);
            logged = true;
        };
    };

    const getPrimitiveAccessors = (key: string) => {
        const warn = createDeprecationWarning(key);
        const symbol = Symbol(`__${key}__`);
        return {
            get: function () {
                return this[symbol];
            },
            set: function (value: any) {
                if (value !== def) {
                    warn();
                }
                this[symbol] = value;
            },
        };
    };

    const getObjectAccessors = (key: string) => {
        let proxy: any;
        const warn = createDeprecationWarning(key);
        const createProxy = (ref: any) => {
            return new Proxy(ref, {
                get(obj, prop) {
                    return Reflect.get(obj, prop);
                },
                set(obj, prop, value) {
                    warn();
                    return Reflect.set(obj, prop, value);
                },
            });
        };
        const updateProxy = (value: any) => {
            if (isObject(value)) {
                proxy = createProxy(value);
            } else {
                proxy = null;
            }
        };

        const { get: getTarget, set: setTarget } = opts!.accessors!;
        return {
            get: function () {
                const value = getTarget(this);
                updateProxy(value);
                return isObject(value) ? proxy : value;
            },
            set: function (value: any) {
                const oldValue = getTarget(this);
                if (value !== oldValue) {
                    warn();
                    updateProxy(value);
                    setTarget(this, value);
                }
            },
        };
    };

    return function (target: any, key: any) {
        // `target` is either a constructor (static member) or prototype (instance member)
        if (target.hasOwnProperty(key)) {
            return;
        }

        const accessors = opts?.accessors ? getObjectAccessors(key) : getPrimitiveAccessors(key);
        Object.defineProperty(target, key, {
            ...accessors,
            enumerable: true,
            configurable: false,
        });
    };
}
