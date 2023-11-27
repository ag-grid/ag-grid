import type { BaseModule, ModuleInstance } from './baseModule';
interface Module<C, I extends ModuleInstance = ModuleInstance> extends BaseModule {
    instanceConstructor: new (ctx: C) => I;
}
export interface ModuleContextInitialiser<C> {
    createModuleContext: () => C;
}
export declare class ModuleMap<M extends Module<C, I>, C, I extends ModuleInstance = ModuleInstance> {
    private readonly modules;
    private moduleContext?;
    private parent;
    constructor(parent: ModuleContextInitialiser<C>);
    destroy(): void;
    addModule(module: M): void;
    removeModule(module: M): void;
    isModuleEnabled(module: M): boolean;
    [Symbol.iterator](): IterableIterator<I>;
}
export {};
