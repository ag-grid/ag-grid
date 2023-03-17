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
    exports.REGISTERED_MODULES.push(module);
}
exports.registerModule = registerModule;
