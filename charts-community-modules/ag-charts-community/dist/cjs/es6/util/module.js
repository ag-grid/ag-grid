"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerModule = exports.REGISTERED_MODULES = exports.BaseModuleInstance = void 0;
class BaseModuleInstance {
    constructor() {
        this.destroyFns = [];
    }
    destroy() {
        for (const destroyFn of this.destroyFns) {
            destroyFn();
        }
    }
}
exports.BaseModuleInstance = BaseModuleInstance;
exports.REGISTERED_MODULES = [];
function registerModule(module) {
    const otherModule = exports.REGISTERED_MODULES.find((other) => {
        return module.type === other.type && module.optionsKey === other.optionsKey;
    });
    if (otherModule) {
        if (module.packageType === 'enterprise' && otherModule.packageType === 'community') {
            // Replace the community module with an enterprise version
            const index = exports.REGISTERED_MODULES.indexOf(otherModule);
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
