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
    REGISTERED_MODULES.push(module);
}
