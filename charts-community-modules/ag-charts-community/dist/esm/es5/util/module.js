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
var BaseModuleInstance = /** @class */ (function () {
    function BaseModuleInstance() {
        this.destroyFns = [];
    }
    BaseModuleInstance.prototype.destroy = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.destroyFns), _c = _b.next(); !_c.done; _c = _b.next()) {
                var destroyFn = _c.value;
                destroyFn();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    return BaseModuleInstance;
}());
export { BaseModuleInstance };
export var REGISTERED_MODULES = [];
export function registerModule(module) {
    var otherModule = REGISTERED_MODULES.find(function (other) {
        return module.type === other.type && module.optionsKey === other.optionsKey;
    });
    if (otherModule) {
        if (module.packageType === 'enterprise' && otherModule.packageType === 'community') {
            // Replace the community module with an enterprise version
            var index = REGISTERED_MODULES.indexOf(otherModule);
            REGISTERED_MODULES.splice(index, 1, module);
        }
        else {
            // Skip if the module is already registered
        }
    }
    else {
        // Simply register the module
        REGISTERED_MODULES.push(module);
    }
}
