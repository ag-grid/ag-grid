import type { AgSeriesTooltipRendererParams, AgTooltipRendererResult } from '../../options/chart/tooltipOptions';
import { TooltipPosition } from '../tooltip/tooltip';
type TooltipRenderer<P> = (params: P) => string | AgTooltipRendererResult;
type TooltipOverrides<P> = {
    format?: string;
    renderer?: TooltipRenderer<P>;
};
declare class SeriesTooltipInteraction {
    enabled: boolean;
}
export declare class SeriesTooltip<P extends AgSeriesTooltipRendererParams> {
    enabled: boolean;
    showArrow?: boolean;
    format?: string;
    renderer?: TooltipRenderer<P>;
    readonly interaction: SeriesTooltipInteraction;
    readonly position: TooltipPosition;
    toTooltipHtml(defaults: AgTooltipRendererResult, params: P, overrides?: TooltipOverrides<P>): string;
}
export {};
