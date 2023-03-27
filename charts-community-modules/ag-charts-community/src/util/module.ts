import { AgCartesianAxisPosition } from '../chart/agChartOptions';
import { CursorManager } from '../chart/interaction/cursorManager';
import { HighlightManager } from '../chart/interaction/highlightManager';
import { InteractionManager } from '../chart/interaction/interactionManager';
import { TooltipManager } from '../chart/interaction/tooltipManager';
import { ZoomManager } from '../chart/interaction/zoomManager';
import { LayoutService } from '../chart/layout/layoutService';
import { UpdateService } from '../chart/updateService';
import { Scene } from '../integrated-charts-scene';

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
    scaleBandwidth: () => number;
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
    packageType: 'community' | 'enterprise';
    chartTypes: ('cartesian' | 'polar' | 'hierarchy')[];
}

export interface RootModule<M extends ModuleInstance = ModuleInstance> extends BaseModule {
    type: 'root';
    // Determines which sub-path of the options structure activates this module.
    initialiseModule(ctx: ModuleContext): ModuleInstanceMeta<M>;
}

export interface AxisModule<M extends ModuleInstance = ModuleInstance> extends BaseModule {
    type: 'axis';
    // Determines which sub-path of the options structure activates this module.
    initialiseModule(ctx: ModuleContextWithParent<AxisContext>): ModuleInstanceMeta<M>;
}

export type Module<M extends ModuleInstance = ModuleInstance> = RootModule<M> | AxisModule<M>;

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
    // Skip if the module is already registered
    const sameModule = REGISTERED_MODULES.find((other) => {
        return (
            module.type === other.type &&
            module.optionsKey === other.optionsKey &&
            module.packageType === other.packageType
        );
    });
    if (sameModule) {
        return;
    }

    // Replace the community module with an enterprise version
    if (module.packageType === 'enterprise') {
        const communityModuleIndex = REGISTERED_MODULES.findIndex((other) => {
            return (
                module.type === other.type &&
                module.optionsKey === other.optionsKey &&
                other.packageType === 'community'
            );
        });
        if (communityModuleIndex >= 0) {
            REGISTERED_MODULES.splice(communityModuleIndex, 1, module);
            return;
        }
    }

    // Simply register the module
    REGISTERED_MODULES.push(module);
}
