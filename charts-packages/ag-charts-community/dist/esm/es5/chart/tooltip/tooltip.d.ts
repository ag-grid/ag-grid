import { AgTooltipRendererResult } from '../agChartOptions';
export declare const DEFAULT_TOOLTIP_CLASS = "ag-chart-tooltip";
export interface TooltipMeta {
    pageX: number;
    pageY: number;
    offsetX: number;
    offsetY: number;
    event: Event;
}
export declare function toTooltipHtml(input: string | AgTooltipRendererResult, defaults?: AgTooltipRendererResult): string;
export declare class Tooltip {
    private static tooltipDocuments;
    private readonly element;
    private readonly observer?;
    private readonly canvasElement;
    private readonly tooltipRoot;
    enabled: boolean;
    class?: string;
    lastClass?: string;
    delay: number;
    /**
     * If `true`, the tooltip will be shown for the marker closest to the mouse cursor.
     * Only has effect on series with markers.
     */
    tracking: boolean;
    constructor(canvasElement: HTMLCanvasElement, document: Document, container: HTMLElement);
    destroy(): void;
    isVisible(): boolean;
    updateClass(visible?: boolean, constrained?: boolean): void;
    private showTimeout;
    private constrained;
    /**
     * Shows tooltip at the given event's coordinates.
     * If the `html` parameter is missing, moves the existing tooltip to the new position.
     */
    show(meta: TooltipMeta, html?: string, instantly?: boolean): void;
    private getWindowBoundingBox;
    toggle(visible?: boolean): void;
}
