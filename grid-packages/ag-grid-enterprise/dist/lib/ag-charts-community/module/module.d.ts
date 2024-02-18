import type { ModuleInstance } from './baseModule';
import type { AxisModule, LegendModule, RootModule, SeriesModule } from './coreModules';
import type { AxisOptionModule } from './optionsModule';
import type { SeriesOptionModule } from './optionsModuleTypes';
export type Module<M extends ModuleInstance = ModuleInstance> = RootModule<M> | AxisModule | AxisOptionModule | LegendModule | SeriesModule<any> | SeriesOptionModule;
export declare abstract class BaseModuleInstance {
    protected readonly destroyFns: (() => void)[];
    destroy(): void;
}
export declare const REGISTERED_MODULES: Module[];
export declare function registerModule(module: Module): void;
export declare function hasRegisteredEnterpriseModules(): boolean;
