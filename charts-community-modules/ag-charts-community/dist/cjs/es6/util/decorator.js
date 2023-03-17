"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTransformToInstanceProperty = exports.BREAK_TRANSFORM_CHAIN = void 0;
exports.BREAK_TRANSFORM_CHAIN = Symbol('BREAK');
const CONFIG_KEY = '__decorator_config';
function initialiseConfig(target, propertyKeyOrSymbol, propertyKey, valueStoreKey) {
    if (Object.getOwnPropertyDescriptor(target, CONFIG_KEY) == null) {
        Object.defineProperty(target, CONFIG_KEY, { value: {} });
    }
    const config = target[CONFIG_KEY];
    if (config[propertyKey] != null) {
        return config[propertyKey];
    }
    config[propertyKey] = { setters: [], getters: [] };
    const descriptor = Object.getOwnPropertyDescriptor(target, propertyKeyOrSymbol);
    const prevSet = descriptor === null || descriptor === void 0 ? void 0 : descriptor.set;
    const prevGet = descriptor === null || descriptor === void 0 ? void 0 : descriptor.get;
    const getter = function () {
        var _a, _b;
        let value = prevGet ? prevGet.call(this) : this[valueStoreKey];
        for (const transformFn of (_b = (_a = config[propertyKey]) === null || _a === void 0 ? void 0 : _a.getters) !== null && _b !== void 0 ? _b : []) {
            value = transformFn(this, propertyKeyOrSymbol, value);
            if (value === exports.BREAK_TRANSFORM_CHAIN) {
                return undefined;
            }
        }
        return value;
    };
    const setter = function (value) {
        var _a, _b;
        const setters = (_b = (_a = config[propertyKey]) === null || _a === void 0 ? void 0 : _a.setters) !== null && _b !== void 0 ? _b : [];
        let oldValue;
        if (setters.some((f) => f.length > 2)) {
            // Lazily retrieve old value.
            oldValue = prevGet ? prevGet.call(this) : this[valueStoreKey];
        }
        for (const transformFn of setters) {
            value = transformFn(this, propertyKeyOrSymbol, value, oldValue);
            if (value === exports.BREAK_TRANSFORM_CHAIN) {
                return;
            }
        }
        if (prevSet) {
            prevSet.call(this, value);
        }
        else {
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
function addTransformToInstanceProperty(setTransform, getTransform) {
    return (target, propertyKeyOrSymbol) => {
        const propertyKey = propertyKeyOrSymbol.toString();
        const valueStoreKey = `__${propertyKey}`;
        const { getters, setters } = initialiseConfig(target, propertyKeyOrSymbol, propertyKey, valueStoreKey);
        setters.push(setTransform);
        if (getTransform) {
            getters.splice(0, 0, getTransform);
        }
    };
}
exports.addTransformToInstanceProperty = addTransformToInstanceProperty;
