"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTransformToInstanceProperty = exports.BREAK_TRANSFORM_CHAIN = void 0;
exports.BREAK_TRANSFORM_CHAIN = Symbol('BREAK');
var CONFIG_KEY = '__decorator_config';
function initialiseConfig(target, propertyKeyOrSymbol, propertyKey, valueStoreKey) {
    if (Object.getOwnPropertyDescriptor(target, CONFIG_KEY) == null) {
        Object.defineProperty(target, CONFIG_KEY, { value: {} });
    }
    var config = target[CONFIG_KEY];
    if (config[propertyKey] != null) {
        return config[propertyKey];
    }
    config[propertyKey] = { setters: [], getters: [] };
    var descriptor = Object.getOwnPropertyDescriptor(target, propertyKeyOrSymbol);
    var prevSet = descriptor === null || descriptor === void 0 ? void 0 : descriptor.set;
    var prevGet = descriptor === null || descriptor === void 0 ? void 0 : descriptor.get;
    var getter = function () {
        var e_1, _a;
        var _b, _c;
        var value = prevGet ? prevGet.call(this) : this[valueStoreKey];
        try {
            for (var _d = __values((_c = (_b = config[propertyKey]) === null || _b === void 0 ? void 0 : _b.getters) !== null && _c !== void 0 ? _c : []), _e = _d.next(); !_e.done; _e = _d.next()) {
                var transformFn = _e.value;
                value = transformFn(this, propertyKeyOrSymbol, value);
                if (value === exports.BREAK_TRANSFORM_CHAIN) {
                    return undefined;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return value;
    };
    var setter = function (value) {
        var e_2, _a;
        var _b, _c;
        try {
            for (var _d = __values((_c = (_b = config[propertyKey]) === null || _b === void 0 ? void 0 : _b.setters) !== null && _c !== void 0 ? _c : []), _e = _d.next(); !_e.done; _e = _d.next()) {
                var transformFn = _e.value;
                value = transformFn(this, propertyKeyOrSymbol, value);
                if (value === exports.BREAK_TRANSFORM_CHAIN) {
                    return;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_2) throw e_2.error; }
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
    return function (target, propertyKeyOrSymbol) {
        var propertyKey = propertyKeyOrSymbol.toString();
        var valueStoreKey = "__" + propertyKey;
        var _a = initialiseConfig(target, propertyKeyOrSymbol, propertyKey, valueStoreKey), getters = _a.getters, setters = _a.setters;
        setters.push(setTransform);
        if (getTransform) {
            getters.splice(0, 0, getTransform);
        }
    };
}
exports.addTransformToInstanceProperty = addTransformToInstanceProperty;
