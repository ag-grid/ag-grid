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
        return (module.type === other.type &&
            module.optionsKey === other.optionsKey &&
            module.identifier === other.identifier);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWwvbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBMEdBO0lBQUE7UUFDdUIsZUFBVSxHQUFtQixFQUFFLENBQUM7SUFPdkQsQ0FBQztJQUxHLG9DQUFPLEdBQVA7OztZQUNJLEtBQXdCLElBQUEsS0FBQSxTQUFBLElBQUksQ0FBQyxVQUFVLENBQUEsZ0JBQUEsNEJBQUU7Z0JBQXBDLElBQU0sU0FBUyxXQUFBO2dCQUNoQixTQUFTLEVBQUUsQ0FBQzthQUNmOzs7Ozs7Ozs7SUFDTCxDQUFDO0lBQ0wseUJBQUM7QUFBRCxDQUFDLEFBUkQsSUFRQzs7QUFFRCxNQUFNLENBQUMsSUFBTSxrQkFBa0IsR0FBYSxFQUFFLENBQUM7QUFDL0MsTUFBTSxVQUFVLGNBQWMsQ0FBQyxNQUFjO0lBQ3pDLElBQU0sV0FBVyxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFDLEtBQUs7UUFDOUMsT0FBTyxDQUNILE1BQU0sQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLElBQUk7WUFDMUIsTUFBTSxDQUFDLFVBQVUsS0FBSyxLQUFLLENBQUMsVUFBVTtZQUN0QyxNQUFNLENBQUMsVUFBVSxLQUFLLEtBQUssQ0FBQyxVQUFVLENBQ3pDLENBQUM7SUFDTixDQUFDLENBQUMsQ0FBQztJQUVILElBQUksV0FBVyxFQUFFO1FBQ2IsSUFBSSxNQUFNLENBQUMsV0FBVyxLQUFLLFlBQVksSUFBSSxXQUFXLENBQUMsV0FBVyxLQUFLLFdBQVcsRUFBRTtZQUNoRiwwREFBMEQ7WUFDMUQsSUFBTSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3RELGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQy9DO2FBQU07WUFDSCwyQ0FBMkM7U0FDOUM7S0FDSjtTQUFNO1FBQ0gsNkJBQTZCO1FBQzdCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNuQztBQUNMLENBQUMifQ==