export class BaseModuleInstance {
    constructor() {
        this.destroyFns = [];
    }
    destroy() {
        for (const destroyFn of this.destroyFns) {
            destroyFn();
        }
    }
}
export const REGISTERED_MODULES = [];
export function registerModule(module) {
    const otherModule = REGISTERED_MODULES.find((other) => {
        return module.type === other.type && module.optionsKey === other.optionsKey;
    });
    if (otherModule) {
        if (module.packageType === 'enterprise' && otherModule.packageType === 'community') {
            // Replace the community module with an enterprise version
            const index = REGISTERED_MODULES.indexOf(otherModule);
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
