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
export var BREAK_TRANSFORM_CHAIN = Symbol('BREAK');
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
                if (value === BREAK_TRANSFORM_CHAIN) {
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
        var setters = (_c = (_b = config[propertyKey]) === null || _b === void 0 ? void 0 : _b.setters) !== null && _c !== void 0 ? _c : [];
        var oldValue;
        if (setters.some(function (f) { return f.length > 2; })) {
            // Lazily retrieve old value.
            oldValue = prevGet ? prevGet.call(this) : this[valueStoreKey];
        }
        try {
            for (var setters_1 = __values(setters), setters_1_1 = setters_1.next(); !setters_1_1.done; setters_1_1 = setters_1.next()) {
                var transformFn = setters_1_1.value;
                value = transformFn(this, propertyKeyOrSymbol, value, oldValue);
                if (value === BREAK_TRANSFORM_CHAIN) {
                    return;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (setters_1_1 && !setters_1_1.done && (_a = setters_1.return)) _a.call(setters_1);
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
export function addTransformToInstanceProperty(setTransform, getTransform) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWwvZGVjb3JhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsTUFBTSxDQUFDLElBQU0scUJBQXFCLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBU3JELElBQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDO0FBRXhDLFNBQVMsZ0JBQWdCLENBQ3JCLE1BQVcsRUFDWCxtQkFBb0MsRUFDcEMsV0FBbUIsRUFDbkIsYUFBcUI7SUFFckIsSUFBSSxNQUFNLENBQUMsd0JBQXdCLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxJQUFJLElBQUksRUFBRTtRQUM3RCxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUM1RDtJQUVELElBQU0sTUFBTSxHQUFvQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkUsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxFQUFFO1FBQzdCLE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQzlCO0lBRUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFFbkQsSUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBQ2hGLElBQU0sT0FBTyxHQUFHLFVBQVUsYUFBVixVQUFVLHVCQUFWLFVBQVUsQ0FBRSxHQUFHLENBQUM7SUFDaEMsSUFBTSxPQUFPLEdBQUcsVUFBVSxhQUFWLFVBQVUsdUJBQVYsVUFBVSxDQUFFLEdBQUcsQ0FBQztJQUVoQyxJQUFNLE1BQU0sR0FBRzs7O1FBQ1gsSUFBSSxLQUFLLEdBQUcsT0FBTyxD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