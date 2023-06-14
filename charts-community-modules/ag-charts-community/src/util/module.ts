import { ChartAxis } from '../chart/chartAxis';
import { Series } from '../chart/series/series';
import { ChartLegend } from '../chart/legendDatum';
import { JsonApplyParams } from './json';
import { AxisContext, ModuleContext, ModuleContextWithParent } from './moduleContext';

export type AxisConstructor = new (moduleContext: ModuleContext) => ChartAxis;
export type SeriesConstructor = new (moduleContext: ModuleContext) => Series<any>;
export type LegendConstructor = new (moduleContext: ModuleContext) => ChartLegend;

export interface ModuleInstance {
    destroy(): void;
}

interface BaseModule {
    optionsKey: string;
    packageType: 'community' | 'enterprise';
    chartTypes: ('cartesian' | 'polar' | 'hierarchy')[];
    identifier?: string;

    optionConstructors?: JsonApplyParams['constructors'];
}

export interface RootModule<M extends ModuleInstance = ModuleInstance> extends BaseModule {
    type: 'root';

    instanceConstructor: new (ctx: ModuleContext) => M;

    themeTemplate?: {};
}

export interface AxisOptionModule<M extends ModuleInstance = ModuleInstance> extends BaseModule {
    type: 'axis-option';

    axisTypes: ('category' | 'number' | 'log' | 'time')[];

    instanceConstructor: new (ctx: ModuleContextWithParent<AxisContext>) => M;

    themeTemplate: {};
}

export interface AxisModule extends BaseModule {
    type: 'axis';

    identifier: string;
    instanceConstructor: AxisConstructor;

    themeTemplate: {};
}

export interface LegendModule extends BaseModule {
    type: 'legend';

    identifier: string;
    instanceConstructor: LegendConstructor;
}

export interface SeriesModule extends BaseModule {
    type: 'series';

    identifier: string;
    instanceConstructor: SeriesConstructor;

    seriesDefaults: {};
    themeTemplate: {};
}

export type Module<M extends ModuleInstance = ModuleInstance> =
    | RootModule<M>
    | AxisModule
    | AxisOptionModule
    | LegendModule
    | SeriesModule;

export abstract class BaseModuleInstance {
    protected readonly destroyFns: (() => void)[] = [];

    destroy() {
        for (const destroyFn of this.destroyFns) {
            destroyFn();
        }
    }
}

export const REGISTERED_MODULES: Module[] = [];
export function registerModule(module: Module) {
    const otherModule = REGISTERED_MODULES.find((other) => {
        return (
            module.type === other.type &&
            module.optionsKey === other.optionsKey &&
            module.identifier === other.identifier
        );
    });

    if (otherModule) {
        if (module.packageType === 'enterprise' && otherModule.packageType === 'community') {
            // Replace the community module with an enterprise version
            const index = REGISTERED_MODULES.indexOf(otherModule);
            REGISTERED_MODULES.splice(index, 1, module);
        } else {
            // Skip if the module is already registered
        }
    } else {
        // Simply register the module
        REGISTERED_MODULES.push(module);
    }
}
