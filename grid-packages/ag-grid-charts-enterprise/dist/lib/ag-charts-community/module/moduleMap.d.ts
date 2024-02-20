import type { BaseModule, ModuleInstance } from './baseModule';
import type { ModuleContext } from './moduleContext';
interface Module<I extends ModuleInstance = ModuleInstance, C = ModuleContext> extends BaseModule {
    instanceConstructor: new (ctx: C) => I;
}
export declare class ModuleMap<M extends Module<I, C>, I extends ModuleInstance, C = ModuleContext> {
    private moduleMap;
    addModule(module: M, moduleFactory: (module: M) => I): void;
    removeModule(module: M | string): void;
    isModuleEnabled(module: M | string): boolean;
    getModule(module: M | string): I | undefined;
    get modules(): IterableIterator<I>;
    mapValues<T>(callback: (value: I, index: number, array: I[]) => T): T[];
    destroy(): void;
}
export {};
