import { BBox } from '../../scene/bbox';
import { Tooltip, TooltipMeta } from '../tooltip/tooltip';
import { InteractionManager } from './interactionManager';
/**
 * Manages the tooltip HTML an element. Tracks the requested HTML from distinct dependents and
 * handles conflicting tooltip requests.
 */
export declare class TooltipManager {
    private readonly states;
    private readonly tooltip;
    private appliedState?;
    private exclusiveAreas;
    private appliedExclusiveArea?;
    private destroyFns;
    constructor(tooltip: Tooltip, interactionManager: InteractionManager);
    updateTooltip(callerId: string, meta?: TooltipMeta, content?: string): void;
    updateExclusiveRect(callerId: string, area?: BBox): void;
    removeTooltip(callerId: string): void;
    getTooltipMeta(callerId: string): TooltipMeta | undefined;
    destroy(): void;
    private checkExclusiveRects;
    private applyStates;
}
