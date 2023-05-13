import { AgCartesianAxisPosition } from '../chart/agChartOptions';
import { CursorManager } from '../chart/interaction/cursorManager';
import { HighlightManager } from '../chart/interaction/highlightManager';
import { InteractionManager } from '../chart/interaction/interactionManager';
import { TooltipManager } from '../chart/interaction/tooltipManager';
import { ZoomManager } from '../chart/interaction/zoomManager';
import { LayoutService } from '../chart/layout/layoutService';
import { UpdateService } from '../chart/updateService';
import { Scene } from '../integrated-charts-scene';
import { Series } from '../chart/series/series';
export interface ModuleContext {
    scene: Scene;
    interactionManager: InteractionManager;
    highlightManager: HighlightManager;
    cursorManager: CursorManager;
    zoomManager: ZoomManager;
    tooltipManager: TooltipManager;
    layoutService: Pick<LayoutService, 'addListener' | 'removeListener'>;
    updateService: UpdateService;
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
export declare type SeriesFactory = () => Series<any>;
export interface ChartThemeParams {
    seriesDefaults: any;
    defaultFontFamily: string;
}
export interface DarkThemeParams {
    seriesLabelDefaults: any;
}
export interface SeriesContext {
    seriesFactory: {
        add(factory: SeriesFactory): void;
        delete(): void;
    };
    defaults: {
        add(defaultOptions: any): void;
        delete(): void;
    };
    themes: {
        chartTheme: {
            add(fn: (params: ChartThemeParams) => any): void;
            delete(): void;
        };
        darkTheme: {
            add(fn: (params: DarkThemeParams) => any): void;
            delete(): void;
        };
    };
}
export interface ModuleInstance {
    update(): void;
    destroy(): void;
}
export interface ModuleInstanceMeta<M extends ModuleInstance = ModuleInstance> {
    instance: M;
}
interface BaseModule {
    optionsKey: string;
    packageType: 'community' | 'enterprise';
    chartTypes: ('cartesian' | 'polar' | 'hierarchy')[];
}
export interface RootModule<M extends ModuleInstance = ModuleInstance> extends BaseModule {
    type: 'root';
    initialiseModule(ctx: ModuleContext): ModuleInstanceMeta<M>;
}
export interface AxisModule<M extends ModuleInstance = ModuleInstance> extends BaseModule {
    type: 'axis';
    initialiseModule(ctx: ModuleContextWithParent<AxisContext>): ModuleInstanceMeta<M>;
}
export interface SeriesModule<M extends ModuleInstance = ModuleInstance> extends BaseModule {
    type: 'series';
    initialiseModule(ctx: SeriesContext): ModuleInstanceMeta<M>;
}
export declare type Module<M extends ModuleInstance = ModuleInstance> = RootModule<M> | AxisModule<M> | SeriesModule<M>;
export declare abstract class BaseModuleInstance {
    protected readonly destroyFns: (() => void)[];
    destroy(): void;
}
export declare const REGISTERED_MODULES: Module[];
export declare function registerModule(module: Module): void;
export {};
