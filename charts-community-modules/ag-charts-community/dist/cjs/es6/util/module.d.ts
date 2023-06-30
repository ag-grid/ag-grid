import { AgCartesianAxisPosition } from '../chart/agChartOptions';
import { DataService } from '../chart/dataService';
import { AnimationManager } from '../chart/interaction/animationManager';
import { ChartEventManager } from '../chart/interaction/chartEventManager';
import { CursorManager } from '../chart/interaction/cursorManager';
import { HighlightManager } from '../chart/interaction/highlightManager';
import { InteractionManager } from '../chart/interaction/interactionManager';
import { TooltipManager } from '../chart/interaction/tooltipManager';
import { ZoomManager } from '../chart/interaction/zoomManager';
import { LayoutService } from '../chart/layout/layoutService';
import { UpdateService } from '../chart/updateService';
import { Scene } from '../integrated-charts-scene';
import { Series } from '../chart/series/series';
import { ChartLegend } from '../chart/legendDatum';
import { JsonApplyParams } from './json';
import { CallbackCache } from './callbackCache';
export interface ModuleContext {
    scene: Scene;
    mode: 'standalone' | 'integrated';
    animationManager: AnimationManager;
    chartEventManager: ChartEventManager;
    cursorManager: CursorManager;
    highlightManager: HighlightManager;
    interactionManager: InteractionManager;
    tooltipManager: TooltipManager;
    zoomManager: ZoomManager;
    dataService: DataService;
    layoutService: Pick<LayoutService, 'addListener' | 'removeListener'>;
    updateService: UpdateService;
    callbackCache: CallbackCache;
}
export interface ModuleContextWithParent<P> extends ModuleContext {
    parent: P;
}
export interface AxisContext {
    axisId: string;
    position: AgCartesianAxisPosition;
    direction: 'x' | 'y';
    continuous: boolean;
    keys: () => string[];
    scaleValueFormatter: (specifier: string) => ((x: any) => string) | undefined;
    scaleBandwidth: () => number;
    scaleConvert(val: any): number;
    scaleInvert(position: number): any;
}
export declare type SeriesConstructor = new (moduleContext: ModuleContext) => Series<any>;
export declare type LegendConstructor = new (moduleContext: ModuleContext) => ChartLegend;
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
export interface AxisModule<M extends ModuleInstance = ModuleInstance> extends BaseModule {
    type: 'axis';
    axisTypes: ('category' | 'number' | 'log' | 'time')[];
    instanceConstructor: new (ctx: ModuleContextWithParent<AxisContext>) => M;
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
export declare type Module<M extends ModuleInstance = ModuleInstance> = RootModule<M> | AxisModule<M> | LegendModule | SeriesModule;
export declare abstract class BaseModuleInstance {
    protected readonly destroyFns: (() => void)[];
    destroy(): void;
}
export declare const REGISTERED_MODULES: Module[];
export declare function registerModule(module: Module): void;
export {};
//# sourceMappingURL=module.d.ts.map