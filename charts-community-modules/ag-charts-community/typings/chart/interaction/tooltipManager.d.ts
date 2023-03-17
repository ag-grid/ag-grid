import { Tooltip, TooltipMeta } from '../tooltip/tooltip';
/**
 * Manages the tooltip HTML an element. Tracks the requested HTML from distinct dependents and
 * handles conflicting tooltip requests.
 */
export declare class TooltipManager {
    private readonly states;
    private readonly tooltip;
    private appliedState?;
    constructor(tooltip: Tooltip);
    updateTooltip(callerId: string, meta?: TooltipMeta, content?: string): void;
    getTooltipMeta(callerId: string): TooltipMeta | undefined;
    private applyStates;
}
