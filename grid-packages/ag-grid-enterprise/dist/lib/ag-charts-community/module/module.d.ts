import type { AgChartOptions } from '../options/agChartOptions';
import type { ModuleInstance } from './baseModule';
import type { AxisModule, LegendModule, RootModule, SeriesModule } from './coreModules';
import type { AxisOptionModule, SeriesOptionModule } from './optionModules';
export type Module<M extends ModuleInstance = ModuleInstance> = RootModule<M> | AxisModule | AxisOptionModule | LegendModule | SeriesModule<any> | SeriesOptionModule;
export declare abstract class BaseModuleInstance {
    protected readonly destroyFns: (() => void)[];
    destroy(): void;
}
export declare const REGISTERED_MODULES: Module[];
export declare function registerModule(module: Module): void;
export declare function hasRegisteredEnterpriseModules(): boolean;
type AgChartOptionsKeys = keyof AgChartOptions;
export declare const MODULE_CONFLICTS: Map<AgChartOptionsKeys, AgChartOptionsKeys[]>;
export declare function registerModuleConflicts(source: AgChartOptionsKeys, targets: AgChartOptionsKeys[]): void;
export {};
