import type { AgChartInteractionRange, AgTooltipRendererResult } from '../agChartOptions';
import type { InteractionEvent } from '../interaction/interactionManager';
export interface TooltipMeta {
    pageX: number;
    pageY: number;
    offsetX: number;
    offsetY: number;
    showArrow?: boolean;
    position?: {
        xOffset?: number;
        yOffset?: number;
    };
    enableInteraction?: boolean;
    event: Event | InteractionEvent<any>;
}
export declare function toTooltipHtml(input: string | AgTooltipRendererResult, defaults?: AgTooltipRendererResult): string;
declare type TooltipPositionType = 'pointer' | 'node';
export declare class TooltipPosition {
    /** The type of positioning for the tooltip. By default, the tooltip follows the pointer. */
    type: TooltipPositionType;
    /** The horizontal offset in pixels for the position of the tooltip. */
    xOffset?: number;
    /** The vertical offset in pixels for the position of the tooltip. */
    yOffset?: number;
}
export declare class Tooltip {
    private static tooltipDocuments;
    private readonly element;
    private readonly observer?;
    private readonly canvasElement;
    private readonly tooltipRoot;
    private enableInteraction;
    enabled: boolean;
    showArrow?: boolean;
    class?: string;
    lastClass?: string;
    delay: number;
    tracking?: boolean;
    range: AgChartInteractionRange;
    readonly position: TooltipPosition;
    constructor(canvasElement: HTMLCanvasElement, document: Document, container: HTMLElement);
    destroy(): void;
    isVisible(): boolean;
    private updateClass;
    private showTimeout;
    private _showArrow;
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    show(meta: TooltipMeta, html?: string, instantly?: boolean): void;
    private getWindowBoundingBox;
    toggle(visible?: boolean): void;
    pointerLeftOntoTooltip(event: InteractionEvent<'leave'>): boolean;
    private updateShowArrow;
}
export {};
//# sourceMappingURL=tooltip.d.ts.map