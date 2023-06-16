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
exports.registerModule = exports.REGISTERED_MODULES = exports.BaseModuleInstance = void 0;
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
exports.BaseModuleInstance = BaseModuleInstance;
exports.REGISTERED_MODULES = [];
function registerModule(module) {
    var otherModule = exports.REGISTERED_MODULES.find(function (other) {
        return (module.type === other.type &&
            module.optionsKey === other.optionsKey &&
            module.identifier === other.identifier);
    });
    if (otherModule) {
        if (module.packageType === 'enterprise' && otherModule.packageType === 'community') {
            // Replace the community module with an enterprise version
            var index = exports.REGISTERED_MODULES.indexOf(otherModule);
            exports.REGISTERED_MODULES.splice(index, 1, module);
        }
        else {
            // Skip if the module is already registered
        }
    }
    else {
        // Simply register the module
        exports.REGISTERED_MODULES.push(module);
    }
}
exports.registerModule = registerModule;
//# sourceMappingURL=module.js.map