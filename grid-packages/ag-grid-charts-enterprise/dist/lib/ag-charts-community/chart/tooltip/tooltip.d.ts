import type { AgTooltipRendererResult, InteractionRange, TextWrap } from '../../options/agChartOptions';
import { BaseProperties } from '../../util/properties';
import type { InteractionEvent, PointerOffsets } from '../interaction/interactionManager';
export type TooltipMeta = PointerOffsets & {
    showArrow?: boolean;
    lastPointerEvent: PointerOffsets;
    position?: {
        xOffset?: number;
        yOffset?: number;
    };
    enableInteraction?: boolean;
    addCustomClass?: boolean;
};
export declare function toTooltipHtml(input: string | AgTooltipRendererResult, defaults?: AgTooltipRendererResult): string;
type TooltipPositionType = 'pointer' | 'node';
export declare class TooltipPosition extends BaseProperties {
    /** The type of positioning for the tooltip. By default, the tooltip follows the pointer. */
    type: TooltipPositionType;
    /** The horizontal offset in pixels for the position of the tooltip. */
    xOffset: number;
    /** The vertical offset in pixels for the position of the tooltip. */
    yOffset: number;
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
    range: InteractionRange;
    wrapping: TextWrap;
    darkTheme: boolean;
    private lastVisibilityChange;
    readonly position: TooltipPosition;
    private readonly window;
    constructor(canvasElement: HTMLCanvasElement, document: Document, window: Window, container: HTMLElement);
    destroy(): void;
    isVisible(): boolean;
    private updateClass;
    private updateWrapping;
    private showTimeout;
    private _showArrow;
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    show(meta: TooltipMeta, html?: string, instantly?: boolean): void;
    private getWindowBoundingBox;
    toggle(visible?: boolean, addCustomClass?: boolean): void;
    pointerLeftOntoTooltip(event: InteractionEvent<'leave'>): boolean;
    private updateShowArrow;
}
export {};
