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
    // Determines which sub-path of the options structure activates this module.
    optionsKey: string;
    initialiseModule(ctx: ModuleContext): ModuleInstanceMeta<M>;
}

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
    REGISTERED_MODULES.push(module);
}
