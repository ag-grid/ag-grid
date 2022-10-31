export declare const DEFAULT_TOOLTIP_CLASS = "ag-chart-tooltip";
export interface TooltipMeta {
    pageX: number;
    pageY: number;
    offsetX: number;
    offsetY: number;
    event: MouseEvent;
}
export interface TooltipRendererResult {
    content?: string;
    title?: string;
    color?: string;
    backgroundColor?: string;
}
export declare function toTooltipHtml(input: string | TooltipRendererResult, defaults?: TooltipRendererResult): string;
declare type OptionalHTMLElement = HTMLElement | undefined | null;
export declare class Tooltip {
    private static tooltipDocuments;
    element: HTMLDivElement;
    private observer?;
    private observedElement;
    private container;
    enabled: boolean;
    class?: string;
    lastClass?: string;
    delay: number;
    /**
     * If `true`, the tooltip will be shown for the marker closest to the mouse cursor.
     * Only has effect on series with markers.
     */
    tracking: boolean;
    constructor(canvasElement: () => HTMLCanvasElement, document: Document, container: () => OptionalHTMLElement);
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
    toggle(visible?: boolean): void;
}
export {};
