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
export interface ModuleInstance {
    update(): void;
    destroy(): void;
}
export interface ModuleInstanceMeta<M extends ModuleInstance = ModuleInstance> {
    instance: M;
}
export interface Module<M extends ModuleInstance = ModuleInstance> {
    optionsKey: string;
    chartTypes: ('cartesian' | 'polar' | 'hierarchy')[];
    initialiseModule(ctx: ModuleContext): ModuleInstanceMeta<M>;
}
export declare abstract class BaseModuleInstance {
    protected readonly destroyFns: (() => void)[];
    destroy(): void;
}
export declare const REGISTERED_MODULES: Module[];
export declare function registerModule(module: Module): void;
