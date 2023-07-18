import type { ChartAxis } from '../chart/chartAxis';
import type { Series } from '../chart/series/series';
import type { ChartLegend } from '../chart/legendDatum';
import type { JsonApplyParams } from './json';
import type { AxisContext, ModuleContext, ModuleContextWithParent } from './moduleContext';
export declare type AxisConstructor = new (moduleContext: ModuleContext) => ChartAxis;
export declare type SeriesConstructor = new (moduleContext: ModuleContext) => Series<any>;
export declare type LegendConstructor = new (moduleContext: ModuleContext) => ChartLegend;
interface SeriesPaletteOptions {
    stroke?: string;
    fill?: string;
    fills?: string[];
    strokes?: string[];
    marker?: {
        fill?: string;
        stroke?: string;
    };
}
interface SeriesPaletteFactoryParams {
    takeColors: (count: number) => {
        fills: string[];
        strokes: string[];
    };
    seriesCount: number;
    colorsCount: number;
}
export declare type SeriesPaletteFactory = (params: SeriesPaletteFactoryParams) => SeriesPaletteOptions;
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
    paletteFactory?: SeriesPaletteFactory;
}
export declare type Module<M extends ModuleInstance = ModuleInstance> = RootModule<M> | AxisModule | AxisOptionModule | LegendModule | SeriesModule;
export declare abstract class BaseModuleInstance {
    protected readonly destroyFns: (() => void)[];
    destroy(): void;
}
export declare const REGISTERED_MODULES: Module[];
export declare function registerModule(module: Module): void;
export {};
//# sourceMappingURL=module.d.ts.map