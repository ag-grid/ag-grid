import { AgCartesianAxisPosition } from '../chart/agChartOptions';
import { CursorManager } from '../chart/interaction/cursorManager';
import { HighlightManager } from '../chart/interaction/highlightManager';
import { InteractionManager } from '../chart/interaction/interactionManager';
import { TooltipManager } from '../chart/interaction/tooltipManager';
import { ZoomManager } from '../chart/interaction/zoomManager';
import { LayoutService } from '../chart/layout/layoutService';
import { Scene } from '../integrated-charts-scene';
export interface ModuleContext {
    scene: Scene;
    interactionManager: InteractionManager;
    highlightManager: HighlightManager;
    cursorManager: CursorManager;
    zoomManager: ZoomManager;
    tooltipManager: TooltipManager;
    layoutService: Pick<LayoutService, 'addListener' | 'removeListener'>;
}
export interface ModuleContextWithParent<P> extends ModuleContext {
    parent: P;
}
export interface AxisContext {
    axisId: string;
    position: AgCartesianAxisPosition;
    direction: 'x' | 'y';
    continuous: boolean;
    scaleConvert(val: any): number;
    scaleInvert(position: number): any;
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
export declare type Module<M extends ModuleInstance = ModuleInstance> = RootModule<M> | AxisModule<M>;
export declare abstract class BaseModuleInstance {
    protected readonly destroyFns: (() => void)[];
    destroy(): void;
}
export declare const REGISTERED_MODULES: Module[];
export declare function registerModule(module: Module): void;
export {};
